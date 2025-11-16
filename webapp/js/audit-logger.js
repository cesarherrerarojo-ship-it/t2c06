// audit-logger.js - Frontend Audit Logging Utility
// Integrates with Firebase Cloud Functions for comprehensive audit tracking

import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const functions = getFunctions();

/**
 * Event Categories (must match Cloud Function validation)
 */
export const AuditCategories = {
  AUTH: 'auth',
  USER_ACTION: 'user_action',
  SECURITY: 'security',
  BUSINESS: 'business',
  PAYMENT: 'payment',
  ADMIN: 'admin',
  SYSTEM: 'system'
};

/**
 * Common Audit Actions
 */
export const AuditActions = {
  // Authentication
  LOGIN: 'login',
  LOGOUT: 'logout',
  REGISTER: 'user_registered',
  EMAIL_VERIFIED: 'email_verified',
  PASSWORD_CHANGED: 'password_changed',
  PASSWORD_RESET: 'password_reset_requested',

  // User Actions
  PROFILE_UPDATED: 'profile_updated',
  PHOTO_UPLOADED: 'photo_uploaded',
  PHOTO_DELETED: 'photo_deleted',
  THEME_CHANGED: 'theme_changed',
  LOCATION_UPDATED: 'location_updated',
  BIO_UPDATED: 'bio_updated',

  // Security
  USER_BLOCKED: 'user_blocked',
  USER_UNBLOCKED: 'user_unblocked',
  USER_REPORTED: 'user_reported',
  SOS_ACTIVATED: 'sos_activated',
  SOS_DEACTIVATED: 'sos_deactivated',
  FAILED_LOGIN: 'failed_login',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',

  // Business
  MATCH_REQUESTED: 'match_requested',
  MATCH_ACCEPTED: 'match_accepted',
  MATCH_REJECTED: 'match_rejected',
  MESSAGE_SENT: 'message_sent',
  DATE_PROPOSED: 'date_proposed',
  APPOINTMENT_CREATED: 'appointment_created',
  APPOINTMENT_CONFIRMED: 'appointment_confirmed',
  APPOINTMENT_CANCELED: 'appointment_canceled',
  APPOINTMENT_COMPLETED: 'appointment_completed',
  QR_VALIDATED: 'qr_validated',

  // Payment
  SUBSCRIPTION_CREATED: 'subscription_created',
  SUBSCRIPTION_RENEWED: 'subscription_renewed',
  SUBSCRIPTION_CANCELED: 'subscription_canceled',
  INSURANCE_PURCHASED: 'insurance_purchased',
  INSURANCE_CAPTURED: 'insurance_captured',
  PAYMENT_FAILED: 'payment_failed',

  // Admin
  USER_BANNED: 'user_banned',
  USER_UNBANNED: 'user_unbanned',
  ROLE_CHANGED: 'role_changed',
  REPORT_REVIEWED: 'report_reviewed',
  MANUAL_OVERRIDE: 'manual_override',
  CONCIERGE_APPROVED: 'concierge_approved',
  CONCIERGE_REJECTED: 'concierge_rejected',

  // VIP Events
  VIP_EVENT_CREATED: 'vip_event_created',
  VIP_EVENT_UPDATED: 'vip_event_updated',
  VIP_EVENT_CANCELED: 'vip_event_canceled',
  VIP_APPLICATION_SUBMITTED: 'vip_application_submitted',
  VIP_APPLICATION_SELECTED: 'vip_application_selected'
};

/**
 * AuditLogger Class
 * Provides methods to create and retrieve audit logs
 */
class AuditLogger {
  constructor() {
    this.createLogFunction = httpsCallable(functions, 'createAuditLog');
    this.getLogsFunction = httpsCallable(functions, 'getUserAuditLogs');
    this.getStatsFunction = httpsCallable(functions, 'getAuditLogStats');
  }

  /**
   * Create an audit log entry
   * @param {string} category - Event category (use AuditCategories constants)
   * @param {string} action - Action performed (use AuditActions constants)
   * @param {object} metadata - Additional event data (optional)
   * @param {string} targetUserId - Target user ID for admin actions (optional)
   * @returns {Promise<object>} - { success, logId, timestamp }
   */
  async log(category, action, metadata = {}, targetUserId = null) {
    try {
      const result = await this.createLogFunction({
        category,
        action,
        metadata,
        targetUserId
      });

      console.log(`[AuditLogger] Log created: ${category}/${action}`, result.data);
      return result.data;
    } catch (error) {
      console.error(`[AuditLogger] Error creating log:`, error);
      // Don't throw - audit logging should not break user workflows
      return { success: false, error: error.message };
    }
  }

  /**
   * Log authentication events
   */
  async logAuth(action, metadata = {}) {
    return this.log(AuditCategories.AUTH, action, metadata);
  }

  /**
   * Log user actions
   */
  async logUserAction(action, metadata = {}) {
    return this.log(AuditCategories.USER_ACTION, action, metadata);
  }

  /**
   * Log security events
   */
  async logSecurity(action, metadata = {}) {
    return this.log(AuditCategories.SECURITY, action, metadata);
  }

  /**
   * Log business events
   */
  async logBusiness(action, metadata = {}) {
    return this.log(AuditCategories.BUSINESS, action, metadata);
  }

  /**
   * Log payment events
   */
  async logPayment(action, metadata = {}) {
    return this.log(AuditCategories.PAYMENT, action, metadata);
  }

  /**
   * Log admin actions (requires admin role)
   */
  async logAdmin(action, metadata = {}, targetUserId = null) {
    return this.log(AuditCategories.ADMIN, action, metadata, targetUserId);
  }

  /**
   * Get audit logs for the current user
   * @param {object} options - { userId, category, limit, startAfter }
   * @returns {Promise<object>} - { success, logs, count, hasMore }
   */
  async getLogs(options = {}) {
    try {
      const result = await this.getLogsFunction(options);
      return result.data;
    } catch (error) {
      console.error(`[AuditLogger] Error getting logs:`, error);
      throw error;
    }
  }

  /**
   * Get audit log statistics (admin only)
   * @param {object} options - { startDate, endDate, category }
   * @returns {Promise<object>} - { success, stats, period }
   */
  async getStats(options = {}) {
    try {
      const result = await this.getStatsFunction(options);
      return result.data;
    } catch (error) {
      console.error(`[AuditLogger] Error getting stats:`, error);
      throw error;
    }
  }

  /**
   * Convenience method: Log login
   */
  async logLogin(method = 'email', metadata = {}) {
    return this.logAuth(AuditActions.LOGIN, {
      method,
      timestamp: new Date().toISOString(),
      ...metadata
    });
  }

  /**
   * Convenience method: Log logout
   */
  async logLogout() {
    return this.logAuth(AuditActions.LOGOUT, {
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Convenience method: Log profile update
   */
  async logProfileUpdate(changedFields = []) {
    return this.logUserAction(AuditActions.PROFILE_UPDATED, {
      changedFields,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Convenience method: Log photo upload
   */
  async logPhotoUpload(photoCount, photoURL) {
    return this.logUserAction(AuditActions.PHOTO_UPLOADED, {
      photoCount,
      photoURL,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Convenience method: Log user block
   */
  async logUserBlock(blockedUserId, reason) {
    return this.logSecurity(AuditActions.USER_BLOCKED, {
      blockedUserId,
      reason,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Convenience method: Log user report
   */
  async logUserReport(reportedUserId, reason, category) {
    return this.logSecurity(AuditActions.USER_REPORTED, {
      reportedUserId,
      reason,
      category,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Convenience method: Log SOS activation
   */
  async logSOSActivation(location, reason, appointmentId = null) {
    return this.logSecurity(AuditActions.SOS_ACTIVATED, {
      location,
      reason,
      appointmentId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Convenience method: Log match request
   */
  async logMatchRequest(receiverId, matchId) {
    return this.logBusiness(AuditActions.MATCH_REQUESTED, {
      receiverId,
      matchId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Convenience method: Log match acceptance
   */
  async logMatchAccepted(senderId, matchId) {
    return this.logBusiness(AuditActions.MATCH_ACCEPTED, {
      senderId,
      matchId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Convenience method: Log message sent
   */
  async logMessageSent(conversationId, messageType = 'text') {
    return this.logBusiness(AuditActions.MESSAGE_SENT, {
      conversationId,
      messageType,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Convenience method: Log appointment creation
   */
  async logAppointmentCreated(appointmentId, date, time, place) {
    return this.logBusiness(AuditActions.APPOINTMENT_CREATED, {
      appointmentId,
      date,
      time,
      place,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Convenience method: Log subscription creation
   */
  async logSubscriptionCreated(subscriptionId, plan, amount) {
    return this.logPayment(AuditActions.SUBSCRIPTION_CREATED, {
      subscriptionId,
      plan,
      amount,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Convenience method: Log insurance purchase
   */
  async logInsurancePurchase(paymentId, amount) {
    return this.logPayment(AuditActions.INSURANCE_PURCHASED, {
      paymentId,
      amount,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Convenience method: Log admin action - user ban
   */
  async logUserBan(targetUserId, reason, duration) {
    return this.logAdmin(
      AuditActions.USER_BANNED,
      { reason, duration, timestamp: new Date().toISOString() },
      targetUserId
    );
  }

  /**
   * Convenience method: Log admin action - role change
   */
  async logRoleChange(targetUserId, oldRole, newRole, reason) {
    return this.logAdmin(
      AuditActions.ROLE_CHANGED,
      { oldRole, newRole, reason, timestamp: new Date().toISOString() },
      targetUserId
    );
  }

  /**
   * Convenience method: Log VIP event creation
   */
  async logVIPEventCreated(eventId, title, date, maxApplicants) {
    return this.logBusiness(AuditActions.VIP_EVENT_CREATED, {
      eventId,
      title,
      date,
      maxApplicants,
      timestamp: new Date().toISOString()
    });
  }
}

// Create singleton instance
const auditLogger = new AuditLogger();

// Export singleton and class
export { auditLogger, AuditLogger };
export default auditLogger;
