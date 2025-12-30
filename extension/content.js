// Content script for AgileWeb Chrome Extension

(function() {
  'use strict';
  
  // Check if content should be blocked
  async function checkContent() {
    try {
      const url = window.location.href;
      const content = document.body ? document.body.innerText : '';
      const metadata = {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content || '',
      };
      
      // Send message to background script
      chrome.runtime.sendMessage(
        {
          action: 'checkContent',
          url,
          content: content.substring(0, 10000), // Limit content size
          metadata,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError);
            return;
          }
          
          if (response && response.blocked && response.action === 'BLOCK') {
            handleBlockedContent(response);
          } else if (response && response.action === 'GATE') {
            handleGatedContent(response);
          }
        }
      );
    } catch (error) {
      console.error('Error checking content:', error);
    }
  }
  
  function handleBlockedContent(response) {
    // Redirect to blocked page
    const blockedUrl = chrome.runtime.getURL(
      `blocked.html?url=${encodeURIComponent(window.location.href)}&reason=${encodeURIComponent(response.reason || 'Content blocked')}`
    );
    window.location.href = blockedUrl;
  }
  
  function handleGatedContent(response) {
    // Show gate overlay
    const gateMode = response.gateMode || 'warning';
    
    if (gateMode === 'warning') {
      showWarningOverlay(response);
    } else if (gateMode === 'delay') {
      showDelayOverlay(response);
    } else if (gateMode === 'parent_approval') {
      showApprovalOverlay(response);
    }
  }
  
  function showWarningOverlay(response) {
    const overlay = document.createElement('div');
    overlay.id = 'agileweb-warning-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    overlay.innerHTML = `
      <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 500px; text-align: center;">
        <h2 style="color: #dc2626; margin-bottom: 1rem;">⚠️ Content Warning</h2>
        <p style="color: #374151; margin-bottom: 1.5rem;">${response.reason || 'This content may not be appropriate for your age group.'}</p>
        <div style="display: flex; gap: 1rem; justify-content: center;">
          <button id="agileweb-continue" style="padding: 0.75rem 1.5rem; background: #4f46e5; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Continue Anyway
          </button>
          <button id="agileweb-go-back" style="padding: 0.75rem 1.5rem; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Go Back
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    document.getElementById('agileweb-continue').addEventListener('click', () => {
      overlay.remove();
    });
    
    document.getElementById('agileweb-go-back').addEventListener('click', () => {
      window.history.back();
      overlay.remove();
    });
  }
  
  function showDelayOverlay(response) {
    let secondsLeft = 15;
    const overlay = document.createElement('div');
    overlay.id = 'agileweb-delay-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    const updateTimer = () => {
      overlay.querySelector('#agileweb-timer').textContent = secondsLeft;
      if (secondsLeft > 0) {
        secondsLeft--;
        setTimeout(updateTimer, 1000);
      } else {
        overlay.remove();
      }
    };
    
    overlay.innerHTML = `
      <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 500px; text-align: center;">
        <h2 style="color: #f59e0b; margin-bottom: 1rem;">⏱️ Content Delay</h2>
        <p style="color: #374151; margin-bottom: 1rem;">${response.reason || 'Please wait before accessing this content.'}</p>
        <p style="font-size: 2rem; font-weight: bold; color: #4f46e5; margin: 1.5rem 0;">
          <span id="agileweb-timer">${secondsLeft}</span> seconds
        </p>
        <button id="agileweb-go-back-delay" style="padding: 0.75rem 1.5rem; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Go Back
        </button>
      </div>
    `;
    
    document.body.appendChild(overlay);
    updateTimer();
    
    document.getElementById('agileweb-go-back-delay').addEventListener('click', () => {
      window.history.back();
      overlay.remove();
    });
  }
  
  function showApprovalOverlay(response) {
    const overlay = document.createElement('div');
    overlay.id = 'agileweb-approval-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    overlay.innerHTML = `
      <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 500px; text-align: center;">
        <h2 style="color: #dc2626; margin-bottom: 1rem;">🔒 Parent Approval Required</h2>
        <p style="color: #374151; margin-bottom: 1.5rem;">${response.reason || 'This content requires parent approval to access.'}</p>
        <p style="color: #6b7280; font-size: 0.875rem; margin-bottom: 1.5rem;">
          Please visit the AgileWeb dashboard to approve this request.
        </p>
        <button id="agileweb-go-back-approval" style="padding: 0.75rem 1.5rem; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Go Back
        </button>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    document.getElementById('agileweb-go-back-approval').addEventListener('click', () => {
      window.history.back();
      overlay.remove();
    });
  }
  
  // Run check when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkContent);
  } else {
    checkContent();
  }
  
  // Also check on navigation
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      checkContent();
    }
  }).observe(document, { subtree: true, childList: true });
})();

