// Background service worker for AgileWeb Chrome Extension

import { isAdultSite, getMatchedAdultSite } from './adultSiteBlocklist.js';
import './uninstall-protection.js';

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('AgileWeb extension installed', details.reason);
  
  // Initialize default settings
  chrome.storage.sync.get(['children', 'activeChildId'], (result) => {
    if (!result.children || result.children.length === 0) {
      chrome.storage.sync.set({
        children: [],
        activeChildId: null,
        blockedAttempts: [],
        auditLog: [],
        sitePolicies: [],
      });
    }
  });
  
  // Prevent uninstallation if password is set
  if (details.reason === 'install') {
    // First install - allow
    return;
  }
  
  // Check if password is set and prevent uninstallation
  chrome.storage.sync.get(['agileweb_parental_password'], (result) => {
    if (result.agileweb_parental_password && result.agileweb_parental_password.hasPassword) {
      // Password is set - show warning
      console.log('Extension is password protected. Uninstallation requires parental code.');
    }
  });
});

// Listen for storage changes to sync from web dashboard
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync') {
    // Settings changed - reload active child profile
    if (changes.children || changes.activeChildId || changes.sitePolicies) {
      console.log('Settings updated from dashboard - reloading extension state');
      
      // Notify content scripts to refresh
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, { action: 'settingsUpdated' }).catch(() => {
            // Ignore errors for tabs that don't have content script
          });
        });
      });
    }
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkContent') {
    handleContentCheck(request, sender, sendResponse);
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'getSettings') {
    chrome.storage.sync.get(['children', 'activeChildId', 'sitePolicies'], (result) => {
      sendResponse({
        children: result.children || [],
        activeChildId: result.activeChildId || null,
        sitePolicies: result.sitePolicies || [],
      });
    });
    return true;
  }
  
  if (request.action === 'logBlockedAttempt') {
    logBlockedAttempt(request.data);
    sendResponse({ success: true });
    return true;
  }
});

async function handleContentCheck(request, sender, sendResponse) {
  try {
    const { url, content, metadata } = request;
    
    // Validate request
    if (!url || typeof url !== 'string') {
      sendResponse({ blocked: false, action: 'ALLOW', reason: 'Invalid URL' });
      return;
    }
    
    // Get current settings
    const result = await new Promise((resolve, reject) => {
      try {
        chrome.storage.sync.get(['children', 'activeChildId', 'sitePolicies'], (result) => {
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
    const sitePolicies = Array.isArray(result.sitePolicies) ? result.sitePolicies : [];
    
    // Find active child profile
    const activeChild = children.find(c => c && c.id === activeChildId);
    if (!activeChild) {
      sendResponse({ blocked: false, action: 'ALLOW', reason: 'No active child profile' });
      return;
    }
    
    // Check adult site blocklist first
    if (isAdultSite(url)) {
      const matchedSite = getMatchedAdultSite(url);
      logBlockedAttempt({
        childId: activeChild.id,
        url,
        action: 'BLOCK',
        category: 'sexual',
        contentType: 'explicit-sexual',
        reason: `Blocked adult site: ${matchedSite || 'known adult content site'}`,
      });
      
      sendResponse({
        blocked: true,
        action: 'BLOCK',
        categoryId: 'sexual',
        contentTypeId: 'explicit-sexual',
        reason: `Blocked adult site: ${matchedSite || 'known adult content site'}`,
      });
      return;
    }
    
    // Basic content filtering (simplified for extension)
    // For full filtering, use the web dashboard API
    const filterResult = {
      blocked: false,
      action: 'ALLOW',
      categoryId: null,
      contentTypeId: null,
      reason: 'Content allowed',
    };
    
    // Check custom controls
    const customControls = activeChild.customControls || [];
    for (const control of customControls.slice(0, 100)) {
      if (!control || !control.value) continue;
      
      const lowerValue = control.value.toLowerCase();
      const lowerUrl = url.toLowerCase();
      const lowerContent = (content || '').toLowerCase();
      
      if (control.type === 'url' && lowerUrl.includes(lowerValue)) {
        filterResult.blocked = control.action === 'BLOCK';
        filterResult.action = control.action;
        filterResult.reason = `Custom control: ${control.type} - ${control.value}`;
        break;
      }
      
      if ((control.type === 'keyword' || control.type === 'interest') && 
          (lowerContent.includes(lowerValue) || lowerUrl.includes(lowerValue))) {
        filterResult.blocked = control.action === 'BLOCK';
        filterResult.action = control.action;
        filterResult.reason = `Custom control: ${control.type} - ${control.value}`;
        break;
      }
    }
    
    // Check site policies
    const relevantPolicies = sitePolicies.filter(p => 
      p.childId === activeChild.id && 
      p.ageGroup === activeChild.ageGroup
    );
    
    for (const policy of relevantPolicies.slice(0, 200)) {
      const lowerUrl = url.toLowerCase();
      const lowerPattern = policy.sitePattern.toLowerCase();
      
      if (policy.type === 'domain' && lowerUrl.includes(lowerPattern)) {
        filterResult.blocked = policy.action === 'BLOCK';
        filterResult.action = policy.action;
        filterResult.reason = `Site policy: ${policy.sitePattern}`;
        break;
      }
      
      if (policy.type === 'url' && lowerUrl === lowerPattern) {
        filterResult.blocked = policy.action === 'BLOCK';
        filterResult.action = policy.action;
        filterResult.reason = `Site policy: ${policy.sitePattern}`;
        break;
      }
    }
    
    if (filterResult.blocked || filterResult.action === 'BLOCK') {
      logBlockedAttempt({
        childId: activeChild.id,
        url,
        action: filterResult.action,
        category: filterResult.categoryId || 'unknown',
        contentType: filterResult.contentTypeId || 'unknown',
        reason: filterResult.reason,
      });
    }
    
    sendResponse(filterResult);
  } catch (error) {
    console.error('Error checking content:', error);
    sendResponse({ blocked: false, action: 'ALLOW', reason: 'Error processing request' });
  }
}

async function logBlockedAttempt(data) {
  try {
    // Validate data
    if (!data || !data.childId || !data.url) {
      console.error('Invalid blocked attempt data');
      return;
    }

    const result = await new Promise((resolve, reject) => {
      try {
        chrome.storage.sync.get(['blockedAttempts', 'auditLog'], (result) => {
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

    const blockedAttempts = Array.isArray(result.blockedAttempts) ? result.blockedAttempts : [];
    const auditLog = Array.isArray(result.auditLog) ? result.auditLog : [];
    
    const newAttempt = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      ...data,
      timestamp: new Date().toISOString(),
    };
    
    const newAuditEntry = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      childId: data.childId,
      timestamp: new Date().toISOString(),
      type: 'blocked_attempt',
      details: {
        url: data.url,
        category: data.category || 'unknown',
        contentType: data.contentType || 'unknown',
        action: data.action,
      },
    };
    
    // Limit to last 1000 entries
    const limitedAttempts = [newAttempt, ...blockedAttempts].slice(0, 1000);
    const limitedAuditLog = [newAuditEntry, ...auditLog].slice(0, 1000);
    
    await new Promise((resolve, reject) => {
      try {
        chrome.storage.sync.set({
          blockedAttempts: limitedAttempts,
          auditLog: limitedAuditLog,
        }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            return;
          }
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
    
    // Notify parent if notifications are enabled
    try {
      const childrenResult = await new Promise((resolve) => {
        chrome.storage.sync.get(['children'], (result) => {
          resolve(result);
        });
      });
      const children = Array.isArray(childrenResult.children) ? childrenResult.children : [];
      const child = children.find(c => c && c.id === data.childId);
      if (child && child.notificationEnabled) {
        try {
          const urlObj = new URL(data.url);
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'AgileWeb - Content Blocked',
            message: `Blocked attempt to access: ${urlObj.hostname}`,
          });
        } catch (urlError) {
          // Invalid URL, skip notification
          console.error('Invalid URL for notification:', urlError);
        }
      }
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
    }
  } catch (error) {
    console.error('Error logging blocked attempt:', error);
  }
}

// Handle web navigation to block before page loads
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return; // Only process main frame
  
  try {
    const result = await chrome.storage.sync.get(['children', 'activeChildId', 'sitePolicies']);
    const children = result.children || [];
    const activeChildId = result.activeChildId;
    const sitePolicies = result.sitePolicies || [];
    
    const activeChild = children.find(c => c.id === activeChildId);
    if (!activeChild) return;
    
    // Quick check for adult sites
    if (isAdultSite(details.url)) {
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL(`blocked.html?url=${encodeURIComponent(details.url)}&reason=adult-site`),
      });
      return;
    }
  } catch (error) {
    console.error('Error in navigation listener:', error);
  }
});

