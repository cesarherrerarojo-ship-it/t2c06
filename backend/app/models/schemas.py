"""
Pydantic schemas for API requests and responses
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, validator


# ========== User Models ==========

class UserBase(BaseModel):
    """Base user model"""
    email: EmailStr
    alias: str
    gender: str = Field(..., pattern="^(masculino|femenino|otro)$")
    birth_date: str  # YYYY-MM-DD


class UserProfile(UserBase):
    """Complete user profile"""
    uid: str
    city: Optional[str] = None
    bio: Optional[str] = None
    interests: List[str] = []
    profession: Optional[str] = None
    photo_url: Optional[str] = None
    user_role: str = "regular"
    has_active_subscription: bool = False
    has_anti_ghosting_insurance: bool = False
    reputation: str = "BRONCE"
    created_at: Optional[datetime] = None


# ========== Recommendation Models ==========

class RecommendationRequest(BaseModel):
    """Request for user recommendations"""
    user_id: str
    limit: int = Field(default=10, ge=1, le=50)
    filters: Optional[Dict[str, Any]] = None


class RecommendationScore(BaseModel):
    """Single recommendation with score"""
    user_id: str
    score: float = Field(..., ge=0, le=1)
    reasons: List[str] = []
    user_data: Optional[Dict[str, Any]] = None


class RecommendationResponse(BaseModel):
    """Response with recommendations"""
    user_id: str
    recommendations: List[RecommendationScore]
    algorithm: str
    generated_at: datetime


# ========== Photo Verification Models ==========

class PhotoVerificationRequest(BaseModel):
    """Request to verify a photo"""
    image_url: str
    user_id: str
    claimed_age: Optional[int] = None


class PhotoVerificationResult(BaseModel):
    """Photo verification results"""
    is_real_person: bool
    has_excessive_filters: bool
    is_appropriate: bool
    estimated_age: Optional[int] = None
    confidence: float = Field(..., ge=0, le=1)
    faces_detected: int
    warnings: List[str] = []


# ========== Analytics Models ==========

class RevenueData(BaseModel):
    """Revenue data point"""
    date: datetime
    amount: float
    source: str  # 'subscription', 'insurance', 'concierge'


class RevenueForecast(BaseModel):
    """Revenue forecast"""
    date: datetime
    predicted_amount: float
    lower_bound: float
    upper_bound: float
    confidence: float = 0.95


class ChurnPrediction(BaseModel):
    """Churn risk prediction"""
    user_id: str
    churn_probability: float = Field(..., ge=0, le=1)
    risk_level: str  # 'low', 'medium', 'high'
    contributing_factors: List[str] = []
    suggested_actions: List[str] = []


class UserLTV(BaseModel):
    """User Lifetime Value calculation"""
    user_id: str
    ltv: float
    monthly_value: float
    retention_months: int
    breakdown: Dict[str, float]


# ========== Fraud Detection Models ==========

class FraudCheckRequest(BaseModel):
    """Request to check for fraudulent behavior"""
    user_id: str
    action: str
    metadata: Optional[Dict[str, Any]] = None


class FraudCheckResult(BaseModel):
    """Fraud detection result"""
    is_suspicious: bool
    risk_score: float = Field(..., ge=0, le=1)
    flags: List[str] = []
    recommended_action: str  # 'allow', 'review', 'block'
    details: Optional[Dict[str, Any]] = None


# ========== Message Moderation Models ==========

class MessageModerationRequest(BaseModel):
    """Request to moderate a message"""
    message_text: str
    sender_id: str
    receiver_id: str


class MessageModerationResult(BaseModel):
    """Message moderation result"""
    should_block: bool
    is_toxic: bool
    contains_personal_info: bool
    is_spam: bool
    sentiment: str  # 'positive', 'neutral', 'negative'
    warnings: List[str] = []
    suggested_edit: Optional[str] = None


# ========== Geolocation Models ==========

class Location(BaseModel):
    """Geographic location"""
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)


class MeetingSpotRequest(BaseModel):
    """Request for meeting spot suggestions"""
    user1_location: Location
    user2_location: Location
    preferences: Optional[Dict[str, Any]] = None


class MeetingSpot(BaseModel):
    """Suggested meeting spot"""
    name: str
    location: Location
    address: str
    rating: float
    review_count: int
    types: List[str] = []
    distance_user1: float  # meters
    distance_user2: float  # meters


class LocationVerificationRequest(BaseModel):
    """Request to verify user is at location"""
    claimed_location: Location
    user_gps: Location
    tolerance_meters: int = 250


class LocationVerificationResult(BaseModel):
    """Location verification result"""
    is_verified: bool
    distance: float  # meters
    within_tolerance: bool


# ========== Notification Models ==========

class NotificationRequest(BaseModel):
    """Request to send notification"""
    user_id: str
    notification_type: str
    data: Dict[str, Any]
    priority: str = "normal"  # 'low', 'normal', 'high'


class NotificationSchedule(BaseModel):
    """Scheduled notification"""
    user_id: str
    best_time_hour: int = Field(..., ge=0, le=23)
    timezone: str = "Europe/Madrid"
    send_at: Optional[datetime] = None


# ========== VIP Events Models (for Concierge) ==========

class VIPEventCreate(BaseModel):
    """Create VIP event"""
    title: str = Field(..., min_length=5, max_length=100)
    description: str = Field(..., min_length=20, max_length=1000)
    event_type: str = Field(..., pattern="^(dinner|party|travel|networking|other)$")
    event_date: datetime
    city: str
    address: str
    compensation: float = Field(..., gt=0)
    spots_available: int = Field(..., ge=1, le=50)
    min_age: int = Field(..., ge=18, le=100)
    max_age: int = Field(..., ge=18, le=100)
    dresscode: Optional[str] = None
    requirements: Optional[str] = None

    @validator('max_age')
    def validate_age_range(cls, v, values):
        if 'min_age' in values and v < values['min_age']:
            raise ValueError('max_age must be greater than or equal to min_age')
        return v


class VIPEventApplication(BaseModel):
    """Application to VIP event"""
    event_id: str
    user_id: str
    motivation: str = Field(..., min_length=50, max_length=500)
    availability_confirmed: bool = True


# ========== Generic Response Models ==========

class SuccessResponse(BaseModel):
    """Generic success response"""
    success: bool = True
    message: str
    data: Optional[Dict[str, Any]] = None


class ErrorResponse(BaseModel):
    """Generic error response"""
    success: bool = False
    error: str
    details: Optional[Dict[str, Any]] = None


class HealthCheck(BaseModel):
    """Health check response"""
    status: str = "healthy"
    version: str
    timestamp: datetime
    services: Dict[str, str] = {}
