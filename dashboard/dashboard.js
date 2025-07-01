document.addEventListener('DOMContentLoaded', async () => {
  // Load data
  const result = await chrome.storage.local.get([
    'visitedPages', 
    'totalFocusTime', 
    'lastFocusSession',
    'focusSessions'
  ]);
  
  // Update stats
  const today = new Date().toISOString().split('T')[0];
  const todaysPages = result.visitedPages?.filter(page => 
    page.timestamp.includes(today)
  ) || [];
  
  document.getElementById('today-pages').textContent = todaysPages.length;
  document.getElementById('total-focus').textContent = `${result.totalFocusTime || 0} min`;
  document.getElementById('last-focus').textContent = `${result.lastFocusSession || 0} min`;
  
  // Generate weekly focus chart
  generateFocusChart(result.focusSessions || []);
  
  // Display visited pages
  displayVisitedPages(result.visitedPages || []);
});

function displayVisitedPages(pages) {
  const pagesList = document.getElementById('pages-list');
  pagesList.innerHTML = '';
  
  if (!pages || pages.length === 0) {
    pagesList.innerHTML = '<p class="no-pages">No pages visited yet</p>';
    return;
  }
  
  // Show only last 10 pages in reverse chronological order
  const recentPages = [...pages].reverse().slice(0, 10);
  
  recentPages.forEach(page => {
    if (!page.url) return;
    
    const pageItem = document.createElement('div');
    pageItem.className = 'page-item';
    
    const date = new Date(page.timestamp).toLocaleString();
    const domain = new URL(page.url).hostname.replace('www.', '');
    
    pageItem.innerHTML = `
      <h3>${page.title || 'Untitled Page'}</h3>
      <p class="url">${domain}</p>
      <p class="date">${date}</p>
      ${page.summary ? `<p class="summary">${page.summary}</p>` : ''}
    `;
    
    pagesList.appendChild(pageItem);
  });
}

function generateFocusChart(focusSessions) {
  // Group by day
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayMap = {};
  
  // Initialize with 0 values for each day
  days.forEach(day => {
    dayMap[day] = 0;
  });
  
  // Sum focus time for each day
  focusSessions.forEach(session => {
    if (session.date && session.minutes) {
      const date = new Date(session.date);
      const dayName = days[date.getDay()];
      dayMap[dayName] += session.minutes;
    }
  });
  
  // Prepare data for chart
  const data = {
    labels: days,
    datasets: [{
      label: 'Focus Time (minutes)',
      data: days.map(day => dayMap[day]),
      backgroundColor: 'rgba(106, 48, 147, 0.2)',
      borderColor: 'rgba(106, 48, 147, 1)',
      borderWidth: 2,
      tension: 0.4,
      fill: true
    }]
  };
  
  // Create chart
  const ctx = document.getElementById('focus-chart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.dataset.label}: ${context.raw} min`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `${value} min`
          }
        }
      }
    }
  });
}