// Background service worker for AgileWeb Chrome Extension

import { isAdultSite, getMatchedAdultSite } from './adultSiteBlocklist.js';

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('AgileWeb extension installed');
  
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
    
    // Get current settings
    const result = await chrome.storage.sync.get(['children', 'activeChildId', 'sitePolicies']);
    const children = result.children || [];
    const activeChildId = result.activeChildId;
    const sitePolicies = result.sitePolicies || [];
    
    // Find active child profile
    const activeChild = children.find(c => c.id === activeChildId);
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
    const result = await chrome.storage.sync.get(['blockedAttempts', 'auditLog']);
    const blockedAttempts = result.blockedAttempts || [];
    const auditLog = result.auditLog || [];
    
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
    
    await chrome.storage.sync.set({
      blockedAttempts: limitedAttempts,
      auditLog: limitedAuditLog,
    });
    
    // Notify parent if notifications are enabled
    const children = (await chrome.storage.sync.get(['children'])).children || [];
    const child = children.find(c => c.id === data.childId);
    if (child && child.notificationEnabled) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'AgileWeb - Content Blocked',
        message: `Blocked attempt to access: ${new URL(data.url).hostname}`,
      });
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

