//  DOM ELEMENTS 
const runnerInput = document.querySelector('#runnerID');
const saveRunnerBtn = document.querySelector('#saveRunnerBtn');
const runnersList = document.querySelector('#runnersList');
const startTimerBtn = document.querySelector('#startTimerBtn');
const darkModeBtn = document.querySelector('#dark-mode');
const saveStatus = document.querySelector('#saveStatus');
const connectionStatus = document.querySelector('#connection-status');

// Initialise 
document.addEventListener('DOMContentLoaded', () => {
  loadRunners();
  updateConnectionStatus();
  loadDarkModePreference();
  
  // Event Listeners
  saveRunnerBtn.addEventListener('click', saveRunner);
  runnerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveRunner();
  });
  startTimerBtn.addEventListener('click', startTimer);
  darkModeBtn.addEventListener('click', toggleDarkMode);
  
  // Network Events
  window.addEventListener('online', updateConnectionStatus);
  window.addEventListener('offline', updateConnectionStatus);
});

//  Runner functions
function saveRunner() {
  const runnerId = runnerInput.value.trim();
  
  // Validation
  if (!runnerId || isNaN(runnerId)) {
    showStatus("Please enter a valid bib number", "error");
    runnerInput.focus();
    return;
  }

  const runners = getRunners();
  
  // Check for duplicates
  if (runners.includes(runnerId)) {
    showStatus(`Runner #${runnerId} already registered`, "error");
    return;
  }

  // Save runner
  runners.push(runnerId);
  localStorage.setItem('runners', JSON.stringify(runners));

  
  // Update UI
  loadRunners();
  runnerInput.value = "";
  runnerInput.focus();
  showStatus(`Runner #${runnerId} saved!`, "success");
}

function loadRunners() {
  const runners = getRunners();
  
  if (runners.length === 0) {
    runnersList.innerHTML = '<p class="no-runners">No runners registered yet</p>';
    return;
  }
  runners.sort((a, b) => Number(a) - Number(b)); //sorted the runners in numerical order !

  runnersList.innerHTML = runners.map(id => `
    <div class="runner-item">
      <span>#${id}</span>
      <button class="delete-runner" data-id="${id}">×</button>
    </div>
  `).join('');

  // Added the delete handlers!!! DONT FORGET
  document.querySelectorAll('.delete-runner').forEach(btn => {
    btn.addEventListener('click', (e) => {
      deleteRunner(e.target.dataset.id);
    });
  });
}

function deleteRunner(runnerId) {
  if (!confirm(`Are you sure you want to delete runner #${runnerId}?`)) return;
  const runners = getRunners().filter(id => id !== runnerId);
  localStorage.setItem('runners', JSON.stringify(runners));
  loadRunners();
  showStatus(`Deleted runner #${runnerId}`, "success");
}

function getRunners() {
  try {
    return JSON.parse(localStorage.getItem('runners')) || [];
  } catch (e) {
    console.error("Error loading runners:", e);
    return [];
  }
}

// Timer function to take you the user to the timer.html page but at least one runner needs to be registered 
function startTimer() {
  const runners = getRunners();
  if (runners.length === 0) {
    showStatus("Register at least 1 runner first", "error");
    return;
  }
  window.location.href = "timer.html";
}

//  UI functions
//Going to show a message after the runner is saved with the number inputted for 3 seconds after the bib number is saved 
function showStatus(message, type) {
  saveStatus.textContent = message;
  saveStatus.className = `save-status save-${type}`;
  setTimeout(() => {
    saveStatus.textContent = '';
  }, 3000);
}
//update the connection status whether its online of offline at the bottom of the screen
function updateConnectionStatus() {
  const isOnline = navigator.onLine;
  connectionStatus.className = isOnline ? 'status-online' : 'status-offline';
  connectionStatus.querySelector('.status-text').textContent = 
    isOnline ? 'Online - Syncing data' : 'Offline - Working locally';
}

// Dark mode
function toggleDarkMode() {
  document.body.classList.toggle('dark-theme');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-theme'));
}

function loadDarkModePreference() {
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-theme');
  }
}