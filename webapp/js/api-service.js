/**
 * API Service for TuCitaSegura
 * Connects frontend with FastAPI backend
 */

export class APIService {
  constructor() {
    this.baseURL = 'http://localhost:8000';
    this.token = null;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Set authentication token
   * @param {string} token - Firebase ID token
   */
  setToken(token) {
    this.token = token;
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Clear authentication token
   */
  clearToken() {
    this.token = null;
    delete this.headers['Authorization'];
  }

  /**
   * Make HTTP request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method: 'GET',
      headers: this.headers,
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
      }
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url);
  }

  /**
   * POST request
   */
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // AUTHENTICATION ENDPOINTS
  // ============================================================================

  /**
   * Check authentication status with backend
   * @returns {Promise<Object>} Auth status
   */
  async checkAuthStatus() {
    return this.get('/api/v1/auth/status');
  }

  /**
   * Get user profile from backend
   * @returns {Promise<Object>} User profile
   */
  async getUserProfile() {
    return this.get('/api/v1/users/me');
  }

  /**
   * Update user profile
   * @param {Object} profileData - Profile data
   * @returns {Promise<Object>} Updated profile
   */
  async updateUserProfile(profileData) {
    return this.put('/api/v1/users/me', profileData);
  }

  // ============================================================================
  // MEMBERSHIP ENDPOINTS
  // ============================================================================

  /**
   * Check membership status
   * @returns {Promise<Object>} Membership status
   */
  async checkMembershipStatus() {
    return this.get('/api/v1/membership/status');
  }

  /**
   * Get subscription plans
   * @returns {Promise<Array>} Subscription plans
   */
  async getSubscriptionPlans() {
    return this.get('/api/v1/membership/plans');
  }

  /**
   * Create subscription
   * @param {Object} subscriptionData - Subscription data
   * @returns {Promise<Object>} Created subscription
   */
  async createSubscription(subscriptionData) {
    return this.post('/api/v1/membership/subscribe', subscriptionData);
  }

  /**
   * Cancel subscription
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelSubscription() {
    return this.post('/api/v1/membership/cancel');
  }

  // ============================================================================
  // RECOMMENDATIONS ENDPOINTS
  // ============================================================================

  /**
   * Get user recommendations
   * @param {Object} filters - Search filters
   * @returns {Promise<Array>} User recommendations
   */
  async getRecommendations(filters = {}) {
    return this.post('/api/v1/recommendations', {
      user_id: this.getCurrentUserId(),
      limit: 20,
      filters: filters
    });
  }

  /**
   * Get matches for user
   * @returns {Promise<Array>} User matches
   */
  async getMatches() {
    return this.get('/api/v1/matches');
  }

  // ============================================================================
  // CHAT ENDPOINTS
  // ============================================================================

  /**
   * Get conversations
   * @returns {Promise<Array>} User conversations
   */
  async getConversations() {
    return this.get('/api/v1/chat/conversations');
  }

  /**
   * Get messages for conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<Array>} Messages
   */
  async getMessages(conversationId) {
    return this.get(`/api/v1/chat/conversations/${conversationId}/messages`);
  }

  /**
   * Send message
   * @param {string} conversationId - Conversation ID
   * @param {string} message - Message content
   * @returns {Promise<Object>} Sent message
   */
  async sendMessage(conversationId, message) {
    return this.post(`/api/v1/chat/conversations/${conversationId}/messages`, {
      content: message
    });
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * Get current user ID from token
   * @returns {string|null} User ID
   */
  getCurrentUserId() {
    if (!this.token) return null;
    
    try {
      // Decode JWT token to get user ID
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      return payload.user_id || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Health check
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    return this.get('/health');
  }

  /**
   * Check if backend is available
   * @returns {Promise<boolean>} Backend availability
   */
  async isBackendAvailable() {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      console.warn('Backend not available:', error);
      return false;
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const apiService = new APIService();

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Handle API errors
 * @param {Error} error - API error
 * @param {Function} onError - Error callback
 */
export function handleAPIError(error, onError = null) {
  console.error('API Error:', error);
  
  let message = 'Error de conexión con el servidor';
  
  if (error.message.includes('Failed to fetch')) {
    message = 'No se pudo conectar con el servidor. Por favor, verifica tu conexión.';
  } else if (error.message.includes('401')) {
    message = 'No autorizado. Por favor, inicia sesión nuevamente.';
  } else if (error.message.includes('403')) {
    message = 'Acceso denegado. Verifica tu membresía.';
  } else if (error.message.includes('404')) {
    message = 'Recurso no encontrado.';
  } else if (error.message.includes('500')) {
    message = 'Error del servidor. Por favor, intenta más tarde.';
  } else {
    message = error.message;
  }

  if (onError) {
    onError(message);
  } else {
    // Show toast notification
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast(message, 'error');
    } else {
      alert(message);
    }
  }
}

export default apiService;