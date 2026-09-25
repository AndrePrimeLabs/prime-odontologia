// @ts-nocheck
import { useEffect } from "react";
import { primeos } from "@/api/primeosClient";
import { v4 as uuidv4 } from 'uuid';

const SESSION_KEY = 'user_session_id';
const SESSION_START_KEY = 'session_start_time';

// Get or create session ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = uuidv4();
    sessionStorage.setItem(SESSION_KEY, sessionId);
    sessionStorage.setItem(SESSION_START_KEY, Date.now().toString());
  }
  return sessionId;
};

// Track page view
export const trackPageView = async (pageName) => {
  try {
    const user = await primeos.auth.me();
    const sessionId = getSessionId();
    
    await primeos.entities.UserEngagement.create({
      user_email: user.email,
      event_type: 'page_view',
      feature_name: pageName,
      session_id: sessionId,
      metadata: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    // Silently fail - don't disrupt user experience
    console.debug('Tracking error:', error);
  }
};

// Track feature usage
export const trackFeatureUse = async (featureName, metadata = {}) => {
  try {
    const user = await primeos.auth.me();
    const sessionId = getSessionId();
    
    await primeos.entities.UserEngagement.create({
      user_email: user.email,
      event_type: 'feature_use',
      feature_name: featureName,
      session_id: sessionId,
      metadata: { ...metadata, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    console.debug('Tracking error:', error);
  }
};

// Track conversion event
export const trackConversion = async (conversionStep, metadata = {}) => {
  try {
    const user = await primeos.auth.me();
    const sessionId = getSessionId();
    
    await primeos.entities.UserEngagement.create({
      user_email: user.email,
      event_type: 'conversion',
      conversion_step: conversionStep,
      session_id: sessionId,
      metadata: { ...metadata, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    console.debug('Tracking error:', error);
  }
};

// Calculate session duration
const calculateSessionDuration = () => {
  const startTime = sessionStorage.getItem(SESSION_START_KEY);
  if (!startTime) return 0;
  return Math.floor((Date.now() - parseInt(startTime)) / 1000);
};

// Track session end
export const trackSessionEnd = async () => {
  try {
    const user = await primeos.auth.me();
    const sessionId = getSessionId();
    const duration = calculateSessionDuration();
    
    await primeos.entities.UserEngagement.create({
      user_email: user.email,
      event_type: 'session_end',
      session_id: sessionId,
      duration_seconds: duration,
      metadata: { timestamp: new Date().toISOString() }
    });
    
    // Clear session
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_START_KEY);
  } catch (error) {
    console.debug('Tracking error:', error);
  }
};

// Hook to track page views automatically
export function usePageTracking(pageName) {
  useEffect(() => {
    trackPageView(pageName);
    
    // Track session end on page unload
    const handleUnload = () => {
      trackSessionEnd();
    };
    
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [pageName]);
}
