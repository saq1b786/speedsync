// DOM Elements
const display = document.querySelector('#display');
const startBtn = document.querySelector('#startbtn');
const recordBtn = document.querySelector('#recordbtn');
const resetBtn = document.querySelector('#resetbtn');
const runnerDropdown = document.querySelector('#runner-dropdown');
const recordTimes = document.querySelector('#recordTimes');
const darkModeBtn = document.querySelector('#dark-mode');
const connectionStatus = document.querySelector('#connection-status');
const backButton = document.querySelector('#backButton');
document.querySelector('#resultsBtn').addEventListener('click', navigateToResults);


let startTime;
let elapsedTime = 0;
let timerInterval;
let isRunning = false;
let records = []; 


document.addEventListener('DOMContentLoaded', () => {
  loadRunners();
  loadDarkModePreference();
  updateConnectionStatus();
  
  // Event Listeners
  startBtn.addEventListener('click', toggleTimer);
  recordBtn.addEventListener('click', recordTime);
  resetBtn.addEventListener('click', resetTimer);
  darkModeBtn.addEventListener('click', toggleDarkMode);
  runnerDropdown.addEventListener('change', updateRecordButton);
  backButton.addEventListener('click', () => {
    if (confirm('Return to registration? All timer data will be reset.')) {
      resetTimer();
      window.location.href = 'index.html'; // Goes back to your registration page. NOT SURE IF I SHOULD CHNAGE THAT
    }
  });
  
  // Network Events
  window.addEventListener('online', updateConnectionStatus);
  window.addEventListener('offline', updateConnectionStatus);
});

// Timer Functions
function toggleTimer() {
  if (!isRunning) {
    startTimer();
    startBtn.textContent = 'Stop';
    updateRecordButton();
  } else {
    stopTimer();
    startBtn.textContent = 'Start';
    recordBtn.disabled = true;
  }
}

function startTimer() {
  startTime = Date.now() - elapsedTime;
  timerInterval = setInterval(updateTimer, 10);
  isRunning = true;
}

function stopTimer() {
  clearInterval(timerInterval);
  elapsedTime = Date.now() - startTime;
  isRunning = false;
}

function resetTimer() {
  stopTimer();
  elapsedTime = 0;
  updateTimer();
  records = [];
  renderRecords();
  startBtn.textContent = 'Start';
}

function updateTimer() {
  const currentTime = isRunning ? Date.now() - startTime : elapsedTime;
  display.textContent = formatTime(currentTime);
}

function formatTime(ms) {
  const date = new Date(ms);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');
  //const milliseconds = Math.floor(date.getUTCMilliseconds() / 10).toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

// Record Functions
function recordTime() {
  const runnerId = runnerDropdown.value;
  if (!runnerId) return;

  const currentTime = isRunning ? Date.now() - startTime : elapsedTime;
  const formattedTime = formatTime(currentTime);
  
  // Create record
  const newRecord = {
    runnerId,
    time: formattedTime,
    timestamp: new Date().toISOString()
  };
  
  // Add to records array
  records.push(newRecord);
  
  // Save to localStorage
  const allRecords = JSON.parse(localStorage.getItem('raceRecords') || '[]');
  allRecords.push(newRecord);
  localStorage.setItem('raceRecords', JSON.stringify(allRecords));
  
  
  recordBtn.textContent = '✓ Recorded';
  setTimeout(() => {
    if (recordBtn.textContent.includes('✓')) {
      recordBtn.textContent = 'Record Time';
    }
  }, 1000);
  
  renderRecords();
}

function renderRecords() {
  recordTimes.innerHTML = records.length 
    ? records.map(record => `
        <div class="record-item">
          <span class="runner-id">#${record.runnerId}</span>
          <span class="record-time">${record.time}</span>
        </div>
      `).join('')
    : '<p class="no-records">No times recorded yet</p>';
}

// Runner Functions
function loadRunners() {
  const runners = JSON.parse(localStorage.getItem('runners') || []);
  runnerDropdown.innerHTML = '<option value="">Select Runner</option>' + 
    runners.map(runnerId => 
      `<option value="${runnerId}">Runner #${runnerId}</option>`
    ).join('');
}

function updateRecordButton() {
  recordBtn.disabled = !runnerDropdown.value || !isRunning;
}

function navigateToResults() {
  // Convert current records to the correct format
  const resultsToSave = records.map(record => {
    // Parse the formatted time back to milliseconds ---> not needed anymore but left in if future they wanted to add milliseconds for accuracy reasons possibly?
    const timeParts = record.time.split(':');
    const ms = (
      (parseInt(timeParts[0]) * 3600000) +  // hours
      (parseInt(timeParts[1]) * 60000) +    // minutes
      (parseInt(timeParts[2]) * 1000)      // seconds
     // (parseInt(timeParts[3]) * 10)         // milliseconds
    );
    
    return {
      runner_number: parseInt(record.runnerId),  // MAKES SURE  numeric bib numbers and not letters
      finish_time: ms,
      recorded_at: record.timestamp
    };
  });

  
  localStorage.setItem('currentRaceResults', JSON.stringify({
    results: resultsToSave,
    lastUpdated: new Date().toISOString()
  }));

  window.location.href = 'results.html';
}



// Dark Mode
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
    isOnline ? 'Online - Syncing data' : 'Offline - Working locally';
}