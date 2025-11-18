#!/usr/bin/env python3
"""
Test script to verify all schemas are correctly defined and importable.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_schema_imports():
    """Test that all schemas can be imported successfully."""
    try:
        from app.models.schemas import (
            # Basic schemas
            HealthCheck, SuccessResponse, ErrorResponse,
            
            # VIP Event schemas
            VIPEventCreateRequest, VIPEventSuggestionRequest, 
            VIPEventBookingRequest, VIPEventConfirmation,
            VIPEventListResponse, VIPEventDetailResponse,
            VIPEventUpdateRequest, VIPEventTicketRequest,
            VIPEventResponse, VIPEventTicketResponse,
            VIPEventStatistics, CuratedNetworkingEventRequest,
            
            # Video Call schemas
            VideoCallCreateRequest, VideoCallInvitationRequest,
            VideoCallInvitationResponse, VideoCallAcceptRequest,
            VideoCallInfo, VideoCallModerationRequest,
            VideoCallStatistics, VideoCallEndRequest,
            VideoCallRecordingRequest,
            
            # Analytics response schemas
            RevenueForecastResponse, ChurnRiskResponse, UserLTVResponse,
            
            # Other schemas
            RecommendationRequest, RecommendationResponse,
            PhotoVerificationRequest, PhotoVerificationResult,
            FraudCheckRequest, FraudCheckResult,
            MessageModerationRequest, MessageModerationResult,
            MeetingSpotRequest, MeetingSpot,
            LocationVerificationRequest, LocationVerificationResult,
            NotificationRequest, NotificationSchedule,
            VIPEventCreate, VIPEventApplication
        )
        
        print("✅ All schemas imported successfully!")
        
        # Test creating instances
        health_check = HealthCheck(status="healthy", version="1.0.0", timestamp="2024-01-01T00:00:00Z")
        print(f"✅ HealthCheck instance created: {health_check.status}")
        
        vip_request = VIPEventCreateRequest(
            event_type="dinner",
            location_data={"city": "Madrid", "address": "Calle Mayor 1"},
            date_time="2024-02-01T20:00:00Z",
            organizer_id="user123"
        )
        print(f"✅ VIPEventCreateRequest instance created: {vip_request.event_type}")
        
        video_request = VideoCallCreateRequest(user_id="user123", call_type="1v1")
        print(f"✅ VideoCallCreateRequest instance created: {video_request.call_type}")
        
        analytics_response = RevenueForecastResponse(
            forecast=[{"date": "2024-01", "amount": 1000}],
            algorithm="Prophet",
            confidence_interval="95%",
            total_projected_revenue=12000
        )
        print(f"✅ RevenueForecastResponse instance created: {analytics_response.algorithm}")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error creating schema instances: {e}")
        return False

if __name__ == "__main__":
    success = test_schema_imports()
    if success:
        print("\n🎉 All schema tests passed! The schemas are correctly defined.")
        sys.exit(0)
    else:
        print("\n❌ Schema tests failed.")
        sys.exit(1)