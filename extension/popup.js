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
    try {
      chrome.storage.sync.get(['agileweb_parental_password'], (result) => {
        if (chrome.runtime.lastError) {
          console.error('Chrome storage error:', chrome.runtime.lastError);
          resolve({ hasPassword: false, passwordHash: '' });
          return;
        }
        if (result.agileweb_parental_password && typeof result.agileweb_parental_password === 'object') {
          const config = result.agileweb_parental_password;
          resolve({
            hasPassword: Boolean(config.hasPassword),
            passwordHash: typeof config.passwordHash === 'string' ? config.passwordHash : '',
          });
        } else {
          resolve({ hasPassword: false, passwordHash: '' });
        }
      });
    } catch (error) {
      console.error('Error in getPasswordConfig:', error);
      resolve({ hasPassword: false, passwordHash: '' });
    }
  });
}

async function verifyPassword(inputPassword) {
  if (!inputPassword || typeof inputPassword !== 'string' || inputPassword.trim().length === 0) {
    return false;
  }

  try {
    const config = await getPasswordConfig();
    if (!config.hasPassword || !config.passwordHash) {
      return true; // No password set
    }
    const inputHash = await hashPassword(inputPassword);
    return inputHash === config.passwordHash;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
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
  const passwordScreen = document.getElementById('password-screen');
  const mainContent = document.getElementById('main-content');
  const passwordInput = document.getElementById('password-input');
  const verifyButton = document.getElementById('verify-password');
  const errorMessage = document.getElementById('password-error');
  
  if (!passwordScreen || !mainContent || !passwordInput || !verifyButton || !errorMessage) {
    console.error('Required DOM elements not found');
    return;
  }
  
  passwordScreen.style.display = 'block';
  mainContent.style.display = 'none';
  
  const handleVerify = async () => {
    const password = passwordInput.value;
    if (!password || password.trim().length === 0) {
      errorMessage.textContent = 'Please enter a code.';
      errorMessage.style.display = 'block';
      return;
    }
    
    try {
      const isValid = await verifyPassword(password);
      if (isValid) {
        sessionStorage.setItem('agileweb_password_verified', 'true');
        passwordScreen.style.display = 'none';
        mainContent.style.display = 'block';
        await loadStatus();
      } else {
        errorMessage.textContent = 'Incorrect code. Please try again.';
        errorMessage.style.display = 'block';
        passwordInput.value = '';
        passwordInput.focus();
      }
    } catch (error) {
      console.error('Error verifying password:', error);
      errorMessage.textContent = 'An error occurred. Please try again.';
      errorMessage.style.display = 'block';
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
  try {
    await checkPasswordAccess();
    
    const openDashboardBtn = document.getElementById('open-dashboard');
    const openSettingsBtn = document.getElementById('open-settings');
    const setupProfileBtn = document.getElementById('setup-profile');
    
    if (openDashboardBtn) {
      openDashboardBtn.addEventListener('click', () => {
        try {
          chrome.tabs.create({ url: 'http://localhost:3000' });
        } catch (error) {
          console.error('Error opening dashboard:', error);
        }
      });
    }
    
    if (openSettingsBtn) {
      openSettingsBtn.addEventListener('click', () => {
        try {
          chrome.runtime.openOptionsPage();
        } catch (error) {
          console.error('Error opening settings:', error);
        }
      });
    }
    
    if (setupProfileBtn) {
      setupProfileBtn.addEventListener('click', () => {
        try {
          chrome.tabs.create({ url: 'http://localhost:3000' });
        } catch (error) {
          console.error('Error opening setup:', error);
        }
      });
    }
  } catch (error) {
    console.error('Error initializing popup:', error);
  }
});

async function loadStatus() {
  try {
    const result = await new Promise((resolve, reject) => {
      try {
        chrome.storage.sync.get(['children', 'activeChildId', 'blockedAttempts'], (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            return;
          }
          resolve(result);
        });
      } catch (error) {
        reject(error);
      }
    });

    const children = Array.isArray(result.children) ? result.children : [];
    const activeChildId = result.activeChildId || null;
    const blockedAttempts = Array.isArray(result.blockedAttempts) ? result.blockedAttempts : [];
    
    const statusContainer = document.getElementById('status-container');
    const noProfile = document.getElementById('no-profile');
    const activeProfile = document.getElementById('active-profile');
    const ageGroup = document.getElementById('age-group');
    const blockedCount = document.getElementById('blocked-count');
    
    if (!activeChildId || children.length === 0) {
      if (statusContainer) statusContainer.style.display = 'none';
      if (noProfile) noProfile.style.display = 'block';
      return;
    }
    
    const activeChild = children.find(c => c && c.id === activeChildId);
    if (!activeChild || !activeChild.name) {
      if (statusContainer) statusContainer.style.display = 'none';
      if (noProfile) noProfile.style.display = 'block';
      return;
    }
    
    // Update status display
    if (activeProfile) {
      activeProfile.textContent = String(activeChild.name || 'Unknown');
    }
    
    const ageGroupLabels = {
      UNDER_10: 'Under 10',
      AGE_10_13: '10-13',
      AGE_13_16: '13-16',
      AGE_16_18: '16-18',
      AGE_18_PLUS: '18+',
    };
    if (ageGroup) {
      ageGroup.textContent = ageGroupLabels[activeChild.ageGroup] || String(activeChild.ageGroup || '-');
    }
    
    // Count blocked attempts today
    try {
      const today = new Date().toDateString();
      const todayBlocked = blockedAttempts.filter(attempt => {
        if (!attempt || !attempt.timestamp) return false;
        try {
          const attemptDate = new Date(attempt.timestamp).toDateString();
          return attemptDate === today && attempt.action === 'BLOCK';
        } catch (e) {
          return false;
        }
      }).length;
      if (blockedCount) {
        blockedCount.textContent = String(todayBlocked || 0);
      }
    } catch (dateError) {
      console.error('Error processing dates:', dateError);
      if (blockedCount) {
        blockedCount.textContent = '0';
      }
    }
    
  } catch (error) {
    console.error('Error loading status:', error);
    const statusContainer = document.getElementById('status-container');
    const noProfile = document.getElementById('no-profile');
    if (statusContainer) statusContainer.style.display = 'none';
    if (noProfile) noProfile.style.display = 'block';
  }
}

