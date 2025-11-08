"""
Intelligent Recommendation Engine using Machine Learning
Suggests best matches based on multiple factors
"""
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
import logging

logger = logging.getLogger(__name__)


class MatchingEngine:
    """
    ML-powered matching engine for TuCitaSegura

    Uses hybrid approach:
    1. Content-based filtering (profile similarity)
    2. Collaborative filtering (behavior patterns)
    3. Random Forest classifier (success prediction)
    """

    def __init__(self, model_path: str = "./models"):
        self.model_path = model_path
        self.model: Optional[RandomForestClassifier] = None
        self.scaler: Optional[StandardScaler] = None
        self.load_or_initialize_model()

    def load_or_initialize_model(self):
        """Load existing model or initialize new one"""
        try:
            # TODO: Load model from disk
            # self.model = joblib.load(f"{self.model_path}/matching_model.pkl")
            # self.scaler = joblib.load(f"{self.model_path}/scaler.pkl")
            logger.info("Loaded existing matching model")
        except Exception as e:
            logger.info("Initializing new matching model")
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
            self.scaler = StandardScaler()

    def get_smart_recommendations(
        self,
        user_id: str,
        limit: int = 10,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Tuple[str, float, List[str]]]:
        """
        Get personalized recommendations for a user

        Args:
            user_id: User requesting recommendations
            limit: Number of recommendations to return
            filters: Additional filters (age, city, etc.)

        Returns:
            List of (candidate_id, score, reasons)
        """
        try:
            # Get user profile
            user_profile = self._get_user_profile(user_id)

            # Get potential candidates
            candidates = self._get_candidates(user_id, filters)

            if not candidates:
                return []

            # Calculate scores for each candidate
            scored_candidates = []
            for candidate in candidates:
                score, reasons = self._calculate_compatibility_score(
                    user_profile,
                    candidate
                )
                scored_candidates.append((candidate['uid'], score, reasons))

            # Sort by score and return top N
            scored_candidates.sort(key=lambda x: x[1], reverse=True)

            return scored_candidates[:limit]

        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
            return []

    def _calculate_compatibility_score(
        self,
        user: Dict[str, Any],
        candidate: Dict[str, Any]
    ) -> Tuple[float, List[str]]:
        """
        Calculate compatibility score between two users

        Factors considered:
        - Interest overlap (30%)
        - Age compatibility (20%)
        - Location proximity (20%)
        - Activity level match (15%)
        - Success history (15%)
        """
        score = 0.0
        reasons = []

        # 1. Interest Overlap (30%)
        user_interests = set(user.get('interests', []))
        candidate_interests = set(candidate.get('interests', []))

        if user_interests and candidate_interests:
            overlap = len(user_interests & candidate_interests)
            total = len(user_interests | candidate_interests)
            interest_score = (overlap / total) if total > 0 else 0
            score += interest_score * 0.30

            if interest_score > 0.5:
                common = user_interests & candidate_interests
                reasons.append(f"Intereses comunes: {', '.join(list(common)[:3])}")

        # 2. Age Compatibility (20%)
        user_age = self._calculate_age(user.get('birth_date'))
        candidate_age = self._calculate_age(candidate.get('birth_date'))

        if user_age and candidate_age:
            age_diff = abs(user_age - candidate_age)
            # Perfect match: 0-3 years difference
            # Good match: 3-7 years
            # Acceptable: 7-15 years
            if age_diff <= 3:
                age_score = 1.0
                reasons.append("Edades muy compatibles")
            elif age_diff <= 7:
                age_score = 0.7
            elif age_diff <= 15:
                age_score = 0.4
            else:
                age_score = 0.1

            score += age_score * 0.20

        # 3. Location Proximity (20%)
        if 'location' in user and 'location' in candidate:
            distance = self._calculate_distance(
                user['location'],
                candidate['location']
            )

            # Perfect: < 5km
            # Good: 5-15km
            # Acceptable: 15-50km
            if distance < 5:
                location_score = 1.0
                reasons.append("Muy cerca de ti")
            elif distance < 15:
                location_score = 0.7
                reasons.append(f"A {distance:.1f}km de distancia")
            elif distance < 50:
                location_score = 0.4
            else:
                location_score = 0.1

            score += location_score * 0.20

        # 4. Activity Level Match (15%)
        user_activity = self._get_activity_level(user['uid'])
        candidate_activity = self._get_activity_level(candidate['uid'])

        activity_diff = abs(user_activity - candidate_activity)
        activity_score = max(0, 1 - (activity_diff / 100))
        score += activity_score * 0.15

        if activity_score > 0.7:
            reasons.append("Nivel de actividad similar")

        # 5. Success History (15%)
        success_rate = self._get_success_rate(user['uid'], candidate['uid'])
        score += success_rate * 0.15

        if success_rate > 0.7:
            reasons.append("Alta probabilidad de match exitoso")

        # Ensure score is between 0 and 1
        score = min(1.0, max(0.0, score))

        return score, reasons

    def _calculate_age(self, birth_date: str) -> Optional[int]:
        """Calculate age from birth date (YYYY-MM-DD)"""
        try:
            birth = datetime.strptime(birth_date, "%Y-%m-%d")
            today = datetime.now()
            age = today.year - birth.year
            if today.month < birth.month or (today.month == birth.month and today.day < birth.day):
                age -= 1
            return age
        except:
            return None

    def _calculate_distance(self, loc1: Dict, loc2: Dict) -> float:
        """Calculate distance in km between two locations"""
        from geopy.distance import geodesic

        try:
            point1 = (loc1['lat'], loc1['lng'])
            point2 = (loc2['lat'], loc2['lng'])
            return geodesic(point1, point2).kilometers
        except:
            return 999  # Unknown distance

    def _get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """Get user profile from Firestore"""
        # TODO: Fetch from Firebase
        return {
            'uid': user_id,
            'interests': ['música', 'viajes', 'cine'],
            'birth_date': '1995-05-15',
            'location': {'lat': 40.4168, 'lng': -3.7038},  # Madrid
        }

    def _get_candidates(
        self,
        user_id: str,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Get potential match candidates"""
        # TODO: Fetch from Firebase with filters
        # - Opposite gender
        # - Not already matched/rejected
        # - Within age/location filters
        # - Active users only

        return []

    def _get_activity_level(self, user_id: str) -> float:
        """Get user activity level (0-100)"""
        # TODO: Calculate based on:
        # - Logins per week
        # - Messages sent
        # - Profile updates
        # - Responses to matches

        return 50.0  # Medium activity

    def _get_success_rate(self, user1_id: str, user2_id: str) -> float:
        """Predict success rate based on historical data"""
        # TODO: Use ML model to predict
        # Features:
        # - User engagement patterns
        # - Response rates
        # - Previous successful matches
        # - Compatibility factors

        return 0.5  # 50% success rate

    def extract_features(self, user1: Dict, user2: Dict) -> np.ndarray:
        """
        Extract feature vector for ML model

        Features:
        1. Interest overlap percentage
        2. Age difference
        3. Location distance
        4. Activity level difference
        5-10. Other behavioral features
        """
        features = []

        # Interest overlap
        interests1 = set(user1.get('interests', []))
        interests2 = set(user2.get('interests', []))
        overlap = len(interests1 & interests2) / max(len(interests1 | interests2), 1)
        features.append(overlap)

        # Age difference
        age1 = self._calculate_age(user1.get('birth_date', '2000-01-01'))
        age2 = self._calculate_age(user2.get('birth_date', '2000-01-01'))
        age_diff = abs(age1 - age2) if age1 and age2 else 0
        features.append(age_diff)

        # Distance
        if 'location' in user1 and 'location' in user2:
            distance = self._calculate_distance(user1['location'], user2['location'])
            features.append(distance)
        else:
            features.append(999)

        # Activity levels
        activity1 = self._get_activity_level(user1['uid'])
        activity2 = self._get_activity_level(user2['uid'])
        features.append(abs(activity1 - activity2))

        # TODO: Add more features
        # - Message response rate
        # - Profile completeness
        # - Subscription status
        # - Reputation score
        # - etc.

        return np.array(features)

    def train_model(self, training_data: pd.DataFrame):
        """
        Train the matching model with historical data

        training_data should have columns:
        - user1_id, user2_id
        - features (computed)
        - label (1 if successful match, 0 otherwise)
        """
        try:
            if len(training_data) < 100:
                logger.warning("Not enough data for training")
                return

            # Extract features
            X = training_data[['feature_1', 'feature_2', 'feature_3']].values
            y = training_data['success'].values

            # Scale features
            X_scaled = self.scaler.fit_transform(X)

            # Train model
            self.model.fit(X_scaled, y)

            # Save model
            # TODO: Save to disk
            # joblib.dump(self.model, f"{self.model_path}/matching_model.pkl")
            # joblib.dump(self.scaler, f"{self.model_path}/scaler.pkl")

            logger.info("Model trained successfully")

        except Exception as e:
            logger.error(f"Error training model: {e}")

    def predict_compatibility(self, user1: Dict, user2: Dict) -> float:
        """
        Use ML model to predict compatibility

        Returns probability of successful match (0-1)
        """
        if self.model is None:
            # Fallback to rule-based scoring
            score, _ = self._calculate_compatibility_score(user1, user2)
            return score

        try:
            features = self.extract_features(user1, user2)
            features_scaled = self.scaler.transform([features])
            probability = self.model.predict_proba(features_scaled)[0][1]
            return probability
        except Exception as e:
            logger.error(f"Error predicting compatibility: {e}")
            return 0.5


# ========== Collaborative Filtering ==========

class CollaborativeFiltering:
    """
    Collaborative filtering for recommendations
    "Users who liked X also liked Y"
    """

    def __init__(self):
        self.user_item_matrix = None

    def build_matrix(self, interactions: List[Dict]):
        """
        Build user-item interaction matrix

        interactions: List of {user_id, target_id, interaction_type, value}
        interaction_type: 'like', 'match', 'date', 'message'
        """
        # TODO: Implement
        pass

    def get_similar_users(self, user_id: str, top_n: int = 10) -> List[str]:
        """Find users with similar preferences"""
        # TODO: Implement using cosine similarity
        pass

    def recommend_based_on_similar_users(
        self,
        user_id: str,
        limit: int = 10
    ) -> List[str]:
        """Recommend profiles that similar users liked"""
        # TODO: Implement
        pass
