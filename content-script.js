async function generateSummary() {
  const mainContent = document.body.innerText;
  const content = mainContent.slice(0, 5000);
  
  try {
    const response = await fetch('http://localhost:3000/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${API_SECRET}'
      },
      body: JSON.stringify({ content })
    });
    
    const data = await response.json();
    
    if (data.summary) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      const result = await chrome.storage.local.get(['visitedPages']);
      const visitedPages = result.visitedPages || [];
      
      const pageIndex = visitedPages.findIndex(page => 
        page.url === tab.url && !page.summary
      );
      
      if (pageIndex !== -1) {
        visitedPages[pageIndex].summary = data.summary;
        await chrome.storage.local.set({ visitedPages });
      }
    }
  } catch (error) {
    console.error('Error generating summary:', error);
  }
}