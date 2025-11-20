/**
 * Integration Test Suite for TuCitaSegura
 * Tests the complete flow: Frontend → Firebase → Backend → Payments
 */

import { apiService } from './js/api-service.js';
import { runFirebaseDiagnostic } from './js/diagnostic.js';

class IntegrationTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
  }

  /**
   * Add test result
   */
  addTest(name, status, details = '', error = null) {
    this.results.tests.push({
      name,
      status,
      details,
      error: error ? error.message : null,
      timestamp: new Date().toISOString()
    });

    this.results.summary.total++;
    if (status === 'passed') this.results.summary.passed++;
    if (status === 'failed') this.results.summary.failed++;
    if (status === 'warning') this.results.summary.warnings++;

    const icon = status === 'passed' ? '✅' : status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${name}: ${status}${details ? ` - ${details}` : ''}`);
    if (error) {
      console.error('   Error:', error);
    }
  }

  /**
   * Test Firebase configuration
   */
  async testFirebaseConfig() {
    try {
      console.log('\n🔥 Testing Firebase Configuration...');
      
      // Test diagnostic
      const diagnostic = await runFirebaseDiagnostic();
      const errors = diagnostic.tests.filter(t => t.status === 'error');
      
      if (errors.length === 0) {
        this.addTest('Firebase Configuration', 'passed', 'All Firebase components configured correctly');
      } else {
        this.addTest('Firebase Configuration', 'failed', `${errors.length} configuration errors found`);
      }
      
    } catch (error) {
      this.addTest('Firebase Configuration', 'failed', '', error);
    }
  }

  /**
   * Test authentication flow
   */
  async testAuthentication() {
    try {
      console.log('\n🔐 Testing Authentication Flow...');
      
      const user = firebase.auth().currentUser;
      
      if (!user) {
        this.addTest('User Authentication', 'warning', 'No user logged in - testing with demo mode');
        return;
      }
      
      // Test email verification
      if (user.emailVerified) {
        this.addTest('Email Verification', 'passed', 'Email is verified');
      } else {
        this.addTest('Email Verification', 'failed', 'Email not verified');
      }
      
      // Test token generation
      try {
        const token = await user.getIdToken();
        if (token) {
          this.addTest('Token Generation', 'passed', 'Firebase token generated successfully');
        } else {
          this.addTest('Token Generation', 'failed', 'No token generated');
        }
      } catch (error) {
        this.addTest('Token Generation', 'failed', '', error);
      }
      
    } catch (error) {
      this.addTest('Authentication Flow', 'failed', '', error);
    }
  }

  /**
   * Test backend connection
   */
  async testBackendConnection() {
    try {
      console.log('\n🚀 Testing Backend Connection...');
      
      // Test health check
      try {
        const health = await apiService.healthCheck();
        if (health.status === 'healthy') {
          this.addTest('Backend Health', 'passed', 'Backend is healthy and running');
        } else {
          this.addTest('Backend Health', 'failed', 'Backend returned unhealthy status');
        }
      } catch (error) {
        this.addTest('Backend Connection', 'failed', 'Cannot connect to backend at localhost:8000', error);
        return;
      }
      
      // Test auth endpoint
      try {
        const user = firebase.auth().currentUser;
        if (user) {
          const token = await user.getIdToken();
          apiService.setToken(token);
          
          const authStatus = await apiService.checkAuthStatus();
          this.addTest('Backend Authentication', 'passed', 'Backend auth endpoint working');
        } else {
          this.addTest('Backend Authentication', 'warning', 'No user logged in - cannot test auth');
        }
      } catch (error) {
        this.addTest('Backend Authentication', 'failed', '', error);
      }
      
    } catch (error) {
      this.addTest('Backend Connection', 'failed', '', error);
    }
  }

  /**
   * test payment integration
   */
  async testPaymentIntegration() {
    try {
      console.log('\n💳 Testing Payment Integration...');
      
      // Test Stripe configuration
      if (window.Stripe) {
        this.addTest('Stripe.js', 'passed', 'Stripe.js library loaded');
      } else {
        this.addTest('Stripe.js', 'failed', 'Stripe.js not loaded');
      }
      
      // Test Firebase functions
      try {
        const functions = firebase.functions();
        if (functions) {
          this.addTest('Firebase Functions', 'passed', 'Firebase Functions SDK available');
          
          // Test specific functions
          const testFunctions = [
            'createStripeSubscription',
            'updateStripePaymentMethod', 
            'cancelStripeSubscription'
          ];
          
          for (const funcName of testFunctions) {
            try {
              const func = functions.httpsCallable(funcName);
              if (func) {
                this.addTest(`Function: ${funcName}`, 'passed', 'Function callable');
              }
            } catch (error) {
              this.addTest(`Function: ${funcName}`, 'failed', '', error);
            }
          }
          
        }
      } catch (error) {
        this.addTest('Firebase Functions', 'failed', '', error);
      }
      
    } catch (error) {
      this.addTest('Payment Integration', 'failed', '', error);
    }
  }

  /**
   * Test profile completion
   */
  async testProfileCompletion() {
    try {
      console.log('\n👤 Testing Profile Completion...');
      
      const user = firebase.auth().currentUser;
      if (!user) {
        this.addTest('Profile Check', 'warning', 'No user logged in');
        return;
      }
      
      // Get user document
      const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
      
      if (!userDoc.exists) {
        this.addTest('Profile Check', 'failed', 'User document not found');
        return;
      }
      
      const userData = userDoc.data();
      const requiredFields = ['alias', 'birth_date', 'gender', 'city', 'profession', 'bio'];
      const missingFields = [];
      
      for (const field of requiredFields) {
        if (!userData[field]) {
          missingFields.push(field);
        }
      }
      
      // Check bio length
      if (userData.bio) {
        const wordCount = userData.bio.split(/\s+/).length;
        if (wordCount < 120) {
          missingFields.push('bio_min_words');
        }
      }
      
      // Check photos
      const photos = userData.photos || [];
      if (photos.length < 3) {
        missingFields.push('min_photos');
      }
      
      if (missingFields.length === 0) {
        this.addTest('Profile Completion', 'passed', 'Profile is complete');
      } else {
        this.addTest('Profile Completion', 'failed', `Missing: ${missingFields.join(', ')}`);
      }
      
    } catch (error) {
      this.addTest('Profile Completion', 'failed', '', error);
    }
  }

  /**
   * Test membership status
   */
  async testMembershipStatus() {
    try {
      console.log('\n⭐ Testing Membership Status...');
      
      const user = firebase.auth().currentUser;
      if (!user) {
        this.addTest('Membership Check', 'warning', 'No user logged in');
        return;
      }
      
      // Get user document
      const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
      const userData = userDoc.data();
      
      if (userData.hasActiveSubscription) {
        this.addTest('Membership Status', 'passed', 'User has active subscription');
        
        // Check subscription status
        const status = userData.subscriptionStatus;
        if (status === 'active' || status === 'trialing') {
          this.addTest('Subscription Status', 'passed', `Subscription is ${status}`);
        } else {
          this.addTest('Subscription Status', 'failed', `Subscription status: ${status}`);
        }
      } else {
        this.addTest('Membership Status', 'failed', 'No active subscription');
      }
      
    } catch (error) {
      this.addTest('Membership Status', 'failed', '', error);
    }
  }

  /**
   * Test ML recommendations
   */
  async testMLRecommendations() {
    try {
      console.log('\n🤖 Testing ML Recommendations...');
      
      const user = firebase.auth().currentUser;
      if (!user) {
        this.addTest('ML Recommendations', 'warning', 'No user logged in');
        return;
      }
      
      try {
        const recommendations = await apiService.getRecommendations({
          location: 'Madrid',
          age_range: '25-35'
        });
        
        if (recommendations.recommendations && recommendations.recommendations.length > 0) {
          this.addTest('ML Recommendations', 'passed', `${recommendations.recommendations.length} recommendations generated`);
        } else {
          this.addTest('ML Recommendations', 'warning', 'No recommendations generated');
        }
        
      } catch (error) {
        this.addTest('ML Recommendations', 'failed', 'Backend ML service error', error);
      }
      
    } catch (error) {
      this.addTest('ML Recommendations', 'failed', '', error);
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🧪 Starting TuCitaSegura Integration Tests...\n');
    
    await this.testFirebaseConfig();
    await this.testAuthentication();
    await this.testBackendConnection();
    await this.testPaymentIntegration();
    await this.testProfileCompletion();
    await this.testMembershipStatus();
    await this.testMLRecommendations();
    
    this.printSummary();
    
    return this.results;
  }

  /**
   * Print test summary
   */
  printSummary() {
    const { summary } = this.results;
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 INTEGRATION TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${summary.total}`);
    console.log(`✅ Passed: ${summary.passed}`);
    console.log(`❌ Failed: ${summary.failed}`);
    console.log(`⚠️  Warnings: ${summary.warnings}`);
    
    if (summary.failed === 0) {
      console.log('\n🎉 All tests passed! System is properly integrated.');
    } else {
      console.log(`\n⚠️  ${summary.failed} tests failed. Check the details above.`);
      console.log('🔧 Recommended actions:');
      
      if (summary.failed > 0) {
        const failedTests = this.results.tests.filter(t => t.status === 'failed');
        failedTests.forEach(test => {
          console.log(`   - Fix: ${test.name}`);
        });
      }
    }
    
    console.log('\n📝 Full test results available in results object');
  }
}

// ============================================================================
// USAGE
// ============================================================================

/**
 * Run integration tests
 * Usage: await runIntegrationTests();
 */
export async function runIntegrationTests() {
  const tester = new IntegrationTester();
  return await tester.runAllTests();
}

/**
 * Quick connectivity test
 */
export async function quickConnectivityTest() {
  console.log('🔍 Running quick connectivity test...');
  
  const tests = [
    {
      name: 'Firebase Connection',
      test: async () => {
        return typeof firebase !== 'undefined' && firebase.apps.length > 0;
      }
    },
    {
      name: 'Backend Connection', 
      test: async () => {
        try {
          const response = await fetch('http://localhost:8000/');
          return response.ok;
        } catch {
          return false;
        }
      }
    },
    {
      name: 'Stripe.js',
      test: async () => {
        return typeof window.Stripe !== 'undefined';
      }
    }
  ];
  
  for (const { name, test } of tests) {
    try {
      const result = await test();
      const status = result ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${name}`);
    } catch (error) {
      console.log(`❌ FAIL ${name}: ${error.message}`);
    }
  }
}

// Auto-run if imported in browser
if (typeof window !== 'undefined') {
  window.runIntegrationTests = runIntegrationTests;
  window.quickConnectivityTest = quickConnectivityTest;
  
  console.log('🧪 Integration test suite loaded. Run runIntegrationTests() to start full tests.');
  console.log('🔍 Run quickConnectivityTest() for a quick system check.');
}