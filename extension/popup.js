// Popup script for AgileWeb Chrome Extension

document.addEventListener('DOMContentLoaded', async () => {
  await loadStatus();
  
  document.getElementById('open-dashboard').addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3000' });
  });
  
  document.getElementById('open-settings').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  document.getElementById('setup-profile').addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3000' });
  });
});

async function loadStatus() {
  try {
    const result = await chrome.storage.sync.get(['children', 'activeChildId', 'blockedAttempts']);
    const children = result.children || [];
    const activeChildId = result.activeChildId;
    const blockedAttempts = result.blockedAttempts || [];
    
    if (!activeChildId || children.length === 0) {
      document.getElementById('status-container').style.display = 'none';
      document.getElementById('no-profile').style.display = 'block';
      return;
    }
    
    const activeChild = children.find(c => c.id === activeChildId);
    if (!activeChild) {
      document.getElementById('status-container').style.display = 'none';
      document.getElementById('no-profile').style.display = 'block';
      return;
    }
    
    // Update status display
    document.getElementById('active-profile').textContent = activeChild.name;
    
    const ageGroupLabels = {
      UNDER_10: 'Under 10',
      AGE_10_13: '10-13',
      AGE_13_16: '13-16',
      AGE_16_18: '16-18',
      AGE_18_PLUS: '18+',
    };
    document.getElementById('age-group').textContent = ageGroupLabels[activeChild.ageGroup] || activeChild.ageGroup;
    
    // Count blocked attempts today
    const today = new Date().toDateString();
    const todayBlocked = blockedAttempts.filter(attempt => {
      const attemptDate = new Date(attempt.timestamp).toDateString();
      return attemptDate === today && attempt.action === 'BLOCK';
    }).length;
    document.getElementById('blocked-count').textContent = todayBlocked;
    
  } catch (error) {
    console.error('Error loading status:', error);
    document.getElementById('status-container').style.display = 'none';
    document.getElementById('no-profile').style.display = 'block';
  }
}

