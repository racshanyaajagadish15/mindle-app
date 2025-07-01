document.addEventListener('DOMContentLoaded', async () => {
  // Load data
  const result = await chrome.storage.local.get(['visitedPages', 'totalFocusTime', 'relaxationInterval', 'focusMode']);
  
  // Update page count
  const today = new Date().toISOString().split('T')[0];
  const todaysPages = result.visitedPages?.filter(page => 
    page.timestamp.includes(today)
  ) || [];
  document.getElementById('page-count').textContent = todaysPages.length;
  
  // Update focus time
  const focusTime = result.totalFocusTime || 0;
  document.getElementById('focus-time').textContent = `${focusTime} min`;
  
  // Set up focus button
  const focusBtn = document.getElementById('focus-btn');
  const focusBtnText = document.getElementById('focus-btn-text');
  
  if (result.focusMode) {
    focusBtnText.textContent = 'End Focus';
    focusBtn.classList.add('focus-active');
  } else {
    focusBtnText.textContent = 'Start Focus';
    focusBtn.classList.remove('focus-active');
  }
  
  focusBtn.addEventListener('click', async () => {
    const isFocusMode = await toggleFocusMode();
    if (isFocusMode) {
      focusBtnText.textContent = 'End Focus';
      focusBtn.classList.add('focus-active');
    } else {
      focusBtnText.textContent = 'Start Focus';
      focusBtn.classList.remove('focus-active');
    }
  });
  
  // Set up breathing exercise
  const breathingBtn = document.getElementById('breathing-btn');
  const mainView = document.getElementById('main-view');
  const breathingView = document.getElementById('breathing-view');
  const backBtn = document.getElementById('back-btn');
  
  breathingBtn.addEventListener('click', () => {
    mainView.classList.add('hidden');
    breathingView.classList.remove('hidden');
    initBreathingExercise();
  });
  
  backBtn.addEventListener('click', () => {
    breathingView.classList.add('hidden');
    mainView.classList.remove('hidden');
    stopBreathingExercise();
  });
  
  // Set up relaxation interval
  const intervalSelect = document.getElementById('relaxation-interval');
  if (result.relaxationInterval) {
    intervalSelect.value = result.relaxationInterval;
  }
  
  intervalSelect.addEventListener('change', (e) => {
    const minutes = parseInt(e.target.value);
    chrome.runtime.sendMessage({
      action: 'setRelaxationInterval',
      minutes
    });
  });
  
  // Set up dashboard button
  document.getElementById('dashboard-btn').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html') });
  });
});

// Breathing exercise functionality
let breathingInterval;
let isBreathing = false;
let isPaused = false;
let cycleCount = 0;

const prompts = [
  "Breathe in...",
  "Hold...",
  "Breathe out...",
  "Hold..."
];

const durations = [4000, 2000, 4000, 2000]; // in ms

function initBreathingExercise() {
  const circle = document.getElementById('breathing-circle');
  const prompt = document.getElementById('breathing-prompt');
  const startBtn = document.getElementById('start-btn');
  const pauseBtn = document.getElementById('pause-btn');
  
  startBtn.addEventListener('click', startBreathing);
  pauseBtn.addEventListener('click', togglePause);
  
  function startBreathing() {
    if (isBreathing) return;
    
    isBreathing = true;
    isPaused = false;
    cycleCount = 0;
    
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    animateBreath();
  }
  
  function animateBreath() {
    if (isPaused) return;
    
    const phase = cycleCount % 4;
    const nextPhase = (cycleCount + 1) % 4;
    
    // Update prompt
    prompt.textContent = prompts[phase];
    
    // Animate circle
    if (phase === 0) {
      // Inhale - expand
      circle.style.transform = 'scale(1.2)';
      circle.style.backgroundColor = 'var(--primary-light)';
    } else if (phase === 2) {
      // Exhale - contract
      circle.style.transform = 'scale(1)';
      circle.style.backgroundColor = 'var(--primary-color)';
    }
    
    // Schedule next phase
    breathingInterval = setTimeout(() => {
      cycleCount++;
      animateBreath();
    }, durations[phase]);
  }
  
  function togglePause() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
    
    if (!isPaused) {
      animateBreath();
    } else {
      clearTimeout(breathingInterval);
      prompt.textContent = "Paused";
    }
  }
  
  function stopBreathingExercise() {
    clearTimeout(breathingInterval);
    isBreathing = false;
    isPaused = false;
    
    const circle = document.getElementById('breathing-circle');
    const prompt = document.getElementById('breathing-prompt');
    
    circle.style.transform = 'scale(1)';
    prompt.textContent = "Ready to begin";
    
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pause';
  }
}

async function toggleFocusMode() {
  const response = await chrome.runtime.sendMessage({ action: 'getFocusStatus' });
  const isFocusMode = response.isFocusMode;
  
  if (isFocusMode) {
    await chrome.runtime.sendMessage({ action: 'stopFocus' });
    return false;
  } else {
    await chrome.runtime.sendMessage({ action: 'startFocus' });
    return true;
  }
}