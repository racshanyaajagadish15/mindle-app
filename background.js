// Track visited pages and focus time
let visitedPages = [];
let focusStartTime = null;
let totalFocusTime = 0;
let relaxationAlarmName = 'relaxation-reminder';

// Load saved data
chrome.storage.local.get(['visitedPages', 'totalFocusTime', 'relaxationInterval'], (result) => {
  visitedPages = result.visitedPages || [];
  totalFocusTime = result.totalFocusTime || 0;
  
  if (result.relaxationInterval) {
    setupRelaxationReminder(result.relaxationInterval);
  }
});

// Track page visits
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
    const pageInfo = {
      url: tab.url,
      title: tab.title,
      timestamp: new Date().toISOString(),
      summary: '' // Will be filled by content script
    };
    
    visitedPages.push(pageInfo);
    if (visitedPages.length > 100) visitedPages.shift(); // Keep only last 100
    
    chrome.storage.local.set({ visitedPages });
  }
});

// Handle focus mode
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startFocus') {
    focusStartTime = Date.now();
    chrome.storage.local.set({ focusMode: true });
    chrome.action.setBadgeText({ text: 'ON' });
    chrome.action.setBadgeBackgroundColor({ color: '#6a3093' });
  } else if (request.action === 'stopFocus') {
    if (focusStartTime) {
      const sessionTime = Math.floor((Date.now() - focusStartTime) / 60000); // in minutes
      totalFocusTime += sessionTime;
      chrome.storage.local.set({ 
        focusMode: false, 
        totalFocusTime,
        lastFocusSession: sessionTime 
      });
      focusStartTime = null;
      chrome.action.setBadgeText({ text: '' });
    }
  } else if (request.action === 'getFocusStatus') {
    sendResponse({ isFocusMode: focusStartTime !== null });
  } else if (request.action === 'setRelaxationInterval') {
    setupRelaxationReminder(request.minutes);
  }
});

// Setup relaxation reminder
function setupRelaxationReminder(minutes) {
  chrome.alarms.clear(relaxationAlarmName);
  
  if (minutes > 0) {
    chrome.alarms.create(relaxationAlarmName, {
      delayInMinutes: minutes,
      periodInMinutes: minutes
    });
    
    chrome.storage.local.set({ relaxationInterval: minutes });
  } else {
    chrome.storage.local.remove('relaxationInterval');
  }
}

// Handle alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === relaxationAlarmName) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/icons/icon128.png',
      title: 'Time to Relax',
      message: 'Take a moment to breathe and relax your mind.',
      buttons: [{ title: 'Start Breathing Exercise' }]
    });
  }
});

// Handle notification button click
chrome.notifications.onButtonClicked.addListener(() => {
  chrome.windows.create({
    url: chrome.runtime.getURL('popup/breathing-exercise.html'),
    type: 'popup',
    width: 400,
    height: 600
  });
});