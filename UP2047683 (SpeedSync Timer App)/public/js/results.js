// DOM Elements
const resultsList = document.querySelector('#resultsList');
const exportBtn = document.querySelector('#exportBtn');
const clearResultsBtn = document.querySelector('#clearResults');
const connectionStatus = document.querySelector('#connection-status');
const darkModeBtn = document.querySelector('#dark-mode');
const backButton = document.querySelector('#backButton');
let isSyncing = false; 



async function syncResultsWithServer() {
  // Prevent multiple simultaneous syncs
  if (isSyncing) {
    console.log('Sync already in progress - skipping');
    return;
  }
  
  isSyncing = true;
  
  try {
    const savedData = JSON.parse(localStorage.getItem('currentRaceResults') || '{"results":[]}');
    const results = savedData.results || [];
    
    if (!results.length) {
      console.log('No results to sync');
      return;
    }

    console.log('Attempting to sync', results.length, 'results');
    const response = await fetch('/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(results)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Sync successful:', data);
    
    // Clear local cache after successful sync
    localStorage.setItem('currentRaceResults', JSON.stringify({results: []}));
    
  } catch (err) {
    console.error('Sync failed:', err);
    
  } finally {
    isSyncing = false; 
  }
}


function recordFinisher(bibNumber, finishTime) {
  // Get existing results or initialize empty array
  const currentData = JSON.parse(localStorage.getItem('currentRaceResults') || '{"results":[]}');
  const results = JSON.parse(currentData).results || [];
  
  // Add new result
  results.push({
    runner_number: bibNumber,
    finish_time: finishTime,
    recorded_at: new Date().toISOString()
  });

  // Save back to localStorage
  localStorage.setItem('currentRaceResults', JSON.stringify({results}));
  
  // Update UI
  renderResults(results.sort((a, b) => a.finish_time - b.finish_time));
  
  // Sync immediately if online
  if (navigator.onLine) {
     syncResultsWithServer(); 
  }
}



// Added periodic syncing (every 30 seconds) this used to be immediate but changed for safety sync in case some results failed to sync initiially 
setInterval(() => {
  if (navigator.onLine) {
    syncResultsWithServer();
  }
}, 30000); // 30 seconds

async function clearServerResults() {
  try {
    const response = await fetch('/results', { method: 'DELETE' });
    if (response.ok) {
      console.log('Results cleared from server');
    } else {
      console.error('Failed to clear server results');
    }
  } catch (err) {
    console.error('Error clearing server results:', err);
  }
}
// I know this function is not needed anymore as the clear results button doesnt delete from the database however its here if in the future someone decided it should be able to...


// Initialise
document.addEventListener('DOMContentLoaded', () => {
  loadResults();
  loadDarkModePreference();
  updateConnectionStatus();
  
  // Event Listeners
  exportBtn.addEventListener('click', exportToCSV);
  darkModeBtn.addEventListener('click', toggleDarkMode);
  backButton.addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  // Clear Results with pop up to ask for confirmation if they are sure they want to delete 
  clearResultsBtn.addEventListener('click', async() => {
    if (confirm('Permanently delete all results on your device?')) {
      // Clear storage
      localStorage.removeItem('currentRaceResults');
      localStorage.removeItem('raceResults');
      //await clearServerResults(); <--- this was commeneted out so users could not delete race results from the database :)

      
      // Immediate UI update
      renderResults([]);
      
      // changing the clwar button to verify to the user 
      clearResultsBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M21 7L9 19l-5.5-5.5 1.41-1.41L9 16.17 19.59 5.59 21 7z"/>
        </svg>
        Cleared!
      `;
      clearResultsBtn.style.backgroundColor = '#28a745';
      
      // Reset button after 
      setTimeout(() => {
        clearResultsBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12z"/>
          </svg>
          Clear All
        `;
        clearResultsBtn.style.backgroundColor = '';
      }, 1500);
    }
  });
  
  
  window.addEventListener('online', updateConnectionStatus);
  window.addEventListener('offline', updateConnectionStatus);
});

// Load and display results
async function loadResults() {
  try {
    const savedData = JSON.parse(localStorage.getItem('currentRaceResults') || '{"results":[]}');
    
    if (savedData.results?.length > 0) {
      const sortedResults = [...savedData.results].sort((a, b) => a.finish_time - b.finish_time);
      renderResults(sortedResults);
    } else {
      renderResults([]);
    }
  } catch (error) {
    console.error('Error loading results:', error);
    resultsList.innerHTML = '<div class="no-results">Error loading results</div>';
  }
  updateConnectionStatus();
}

// Render results to the table
function renderResults(results) {
  resultsList.innerHTML = results.length 
    ? results.map((result, index) => `
        <div class="result-row">
          <span class="position">${index + 1}</span>
          <span class="bib-number">#${result.runner_number}</span>
          <span class="time">${formatTime(result.finish_time)}</span>
        </div>
      `).join('')
    : '<div class="no-results">No results recorded yet</div>';
}

// Format time as HH:MM:SS.mmm --> milliseconds not used anymore but can be added back!
function formatTime(ms) {
  const date = new Date(ms);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');
  //const milliseconds = date.getUTCMilliseconds().toString().padStart(3, '0');
  return `${hours}:${minutes}:${seconds}`;
}

// Export to CSV. The race results can be seen in a excel spreadsheet 
function exportToCSV() {
  const data = JSON.parse(localStorage.getItem('currentRaceResults') || '{"results":[]}');
  const results = data.results || [];
  
  if (!results.length) {
    alert('No results to export');
    return;
  }
  
  let csv = 'Position,Bib Number,Time\n';
  results.forEach((result, index) => {
    csv += `${index + 1},${result.runner_number},${formatTime(result.finish_time)}\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'race_results.csv';
  a.click();
}

// Dark Mode Functions
function toggleDarkMode() {
  document.body.classList.toggle('dark-theme');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-theme'));
}

function loadDarkModePreference() {
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-theme');
  }
}

// Connection Status
function updateConnectionStatus() {
  const isOnline = navigator.onLine;
  connectionStatus.className = isOnline ? 'status-online' : 'status-offline';
  connectionStatus.querySelector('.status-text').textContent = 
    isOnline ? 'Online - Live results' : 'Offline - Showing cached results';
}


window.addEventListener('online', () => {
  updateConnectionStatus();
  syncResultsWithServer();
});
