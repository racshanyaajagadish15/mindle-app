document.addEventListener('DOMContentLoaded', () => {
  const circle = document.getElementById('breathing-circle');
  const prompt = document.getElementById('breathing-prompt');
  const startBtn = document.getElementById('start-btn');
  const pauseBtn = document.getElementById('pause-btn');
  
  let animationInterval;
  let isAnimating = false;
  let isPaused = false;
  let cycleCount = 0;
  
  const prompts = [
    "Breathe in...",
    "Hold...",
    "Breathe out...",
    "Hold..."
  ];
  
  const durations = [4000, 2000, 4000, 2000]; // in ms
  
  startBtn.addEventListener('click', startAnimation);
  pauseBtn.addEventListener('click', togglePause);
  
  function startAnimation() {
    if (isAnimating) return;
    
    isAnimating = true;
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
    animationInterval = setTimeout(() => {
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
      clearTimeout(animationInterval);
      prompt.textContent = "Paused";
    }
  }
  
  function stopAnimation() {
    clearTimeout(animationInterval);
    isAnimating = false;
    isPaused = false;
    
    circle.style.transform = 'scale(1)';
    prompt.textContent = "Ready to begin";
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pause';
  }
  
  // Reset when window closes
  window.addEventListener('beforeunload', stopAnimation);
});