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