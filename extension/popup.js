// Popup script for AgileWeb Chrome Extension

// Password manager (simplified version for extension)
async function hashPassword(password) {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

async function getPasswordConfig() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['agileweb_parental_password'], (result) => {
      if (result.agileweb_parental_password) {
        resolve(result.agileweb_parental_password);
      } else {
        resolve({ hasPassword: false, passwordHash: '' });
      }
    });
  });
}

async function verifyPassword(inputPassword) {
  const config = await getPasswordConfig();
  if (!config.hasPassword) {
    return true; // No password set
  }
  const inputHash = await hashPassword(inputPassword);
  return inputHash === config.passwordHash;
}

// Check if password is required and verify
async function checkPasswordAccess() {
  const config = await getPasswordConfig();
  
  if (!config.hasPassword) {
    // No password set, show main content
    document.getElementById('password-screen').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    await loadStatus();
    return;
  }

  // Check if already verified in this session
  const sessionVerified = sessionStorage.getItem('agileweb_password_verified');
  if (sessionVerified === 'true') {
    document.getElementById('password-screen').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    await loadStatus();
    return;
  }

  // Show password screen
  document.getElementById('password-screen').style.display = 'block';
  document.getElementById('main-content').style.display = 'none';
  
  const passwordInput = document.getElementById('password-input');
  const verifyButton = document.getElementById('verify-password');
  const errorMessage = document.getElementById('password-error');
  
  const handleVerify = async () => {
    const password = passwordInput.value;
    if (!password) {
      errorMessage.textContent = 'Please enter a code.';
      errorMessage.style.display = 'block';
      return;
    }
    
    const isValid = await verifyPassword(password);
    if (isValid) {
      sessionStorage.setItem('agileweb_password_verified', 'true');
      document.getElementById('password-screen').style.display = 'none';
      document.getElementById('main-content').style.display = 'block';
      await loadStatus();
    } else {
      errorMessage.textContent = 'Incorrect code. Please try again.';
      errorMessage.style.display = 'block';
      passwordInput.value = '';
      passwordInput.focus();
    }
  };
  
  verifyButton.addEventListener('click', handleVerify);
  passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  });
  
  passwordInput.focus();
}

document.addEventListener('DOMContentLoaded', async () => {
  await checkPasswordAccess();
  
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

