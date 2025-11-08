"""
Photo Verification using Computer Vision
Detects fake photos, filters, inappropriate content, and age estimation
"""
import cv2
import numpy as np
from typing import Dict, List, Optional, Tuple
import logging
from PIL import Image
import requests
from io import BytesIO

logger = logging.getLogger(__name__)


class PhotoVerification:
    """
    Verify photo authenticity using CV techniques

    Features:
    - Face detection
    - Age estimation
    - Filter detection
    - NSFW content detection
    - Quality assessment
    """

    def __init__(self):
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        # TODO: Load deep learning models for age estimation
        # self.age_model = load_model('age_estimation.h5')
        # self.nsfw_model = load_model('nsfw_detector.h5')

    def verify_photo(
        self,
        image_url: str,
        claimed_age: Optional[int] = None
    ) -> Dict:
        """
        Complete photo verification

        Returns:
            Dict with verification results
        """
        try:
            # Download image
            image = self._download_image(image_url)
            if image is None:
                return {
                    'is_real_person': False,
                    'has_excessive_filters': False,
                    'is_appropriate': False,
                    'estimated_age': None,
                    'confidence': 0.0,
                    'faces_detected': 0,
                    'warnings': ['Failed to download image']
                }

            results = {
                'is_real_person': False,
                'has_excessive_filters': False,
                'is_appropriate': True,
                'estimated_age': None,
                'confidence': 0.0,
                'faces_detected': 0,
                'warnings': []
            }

            # Detect faces
            faces = self._detect_faces(image)
            results['faces_detected'] = len(faces)

            if len(faces) == 0:
                results['warnings'].append("No se detectó ningún rostro")
                return results
            elif len(faces) > 1:
                results['warnings'].append("Se detectaron múltiples rostros")

            results['is_real_person'] = len(faces) >= 1

            # Estimate age
            if len(faces) > 0 and faces[0] is not None:
                estimated_age = self._estimate_age(image, faces[0])
                results['estimated_age'] = estimated_age

                # Verify age match
                if claimed_age and estimated_age:
                    age_diff = abs(estimated_age - claimed_age)
                    if age_diff > 10:
                        results['warnings'].append(
                            f"Gran diferencia entre edad declarada ({claimed_age}) "
                            f"y estimada ({estimated_age})"
                        )

            # Detect filters
            has_filters = self._detect_filters(image)
            results['has_excessive_filters'] = has_filters
            if has_filters:
                results['warnings'].append("Posibles filtros excesivos detectados")

            # Check image quality
            quality_score = self._assess_quality(image)
            results['confidence'] = quality_score

            if quality_score < 0.5:
                results['warnings'].append("Calidad de imagen baja")

            # NSFW detection
            is_appropriate = self._check_nsfw(image)
            results['is_appropriate'] = is_appropriate
            if not is_appropriate:
                results['warnings'].append("Contenido inapropiado detectado")

            return results

        except Exception as e:
            logger.error(f"Error verifying photo: {e}")
            return {
                'is_real_person': False,
                'has_excessive_filters': False,
                'is_appropriate': False,
                'estimated_age': None,
                'confidence': 0.0,
                'faces_detected': 0,
                'warnings': [f"Error: {str(e)}"]
            }

    def _download_image(self, url: str) -> Optional[np.ndarray]:
        """Download image from URL"""
        try:
            response = requests.get(url, timeout=10)
            image = Image.open(BytesIO(response.content))
            return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        except Exception as e:
            logger.error(f"Error downloading image: {e}")
            return None

    def _detect_faces(self, image: np.ndarray) -> List[Tuple]:
        """Detect faces in image using Haar Cascades"""
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(30, 30)
            )
            return faces
        except Exception as e:
            logger.error(f"Error detecting faces: {e}")
            return []

    def _estimate_age(
        self,
        image: np.ndarray,
        face_coordinates: Tuple
    ) -> Optional[int]:
        """
        Estimate age from face region

        TODO: Implement with deep learning model
        Currently returns placeholder
        """
        # Extract face region
        x, y, w, h = face_coordinates
        face_roi = image[y:y+h, x:x+w]

        # TODO: Use pre-trained age estimation model
        # age = self.age_model.predict(preprocess(face_roi))

        # Placeholder: analyze image properties
        # More sophisticated implementation would use deep learning
        brightness = np.mean(face_roi)

        # Very basic estimation (not accurate - just placeholder)
        estimated_age = int(25 + (brightness - 128) / 5)
        estimated_age = max(18, min(80, estimated_age))

        return estimated_age

    def _detect_filters(self, image: np.ndarray) -> bool:
        """
        Detect excessive filters (Snapchat, Instagram, etc.)

        Looks for:
        - Abnormal color saturation
        - Face distortion markers
        - Artificial smoothing
        """
        try:
            # Convert to HSV for saturation analysis
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            saturation = hsv[:, :, 1]

            # Check for abnormal saturation
            mean_saturation = np.mean(saturation)
            std_saturation = np.std(saturation)

            # High saturation + low variance = likely filtered
            if mean_saturation > 150 and std_saturation < 30:
                return True

            # Check for skin smoothing (blur detection)
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()

            # Very low variance = over-smoothed
            if laplacian_var < 50:
                return True

            return False

        except Exception as e:
            logger.error(f"Error detecting filters: {e}")
            return False

    def _assess_quality(self, image: np.ndarray) -> float:
        """
        Assess image quality (0-1)

        Factors:
        - Resolution
        - Sharpness
        - Lighting
        - Noise
        """
        try:
            score = 0.0

            # 1. Resolution check (25%)
            height, width = image.shape[:2]
            if width >= 800 and height >= 600:
                score += 0.25
            elif width >= 400 and height >= 300:
                score += 0.15

            # 2. Sharpness check (25%)
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            if laplacian_var > 100:
                score += 0.25
            elif laplacian_var > 50:
                score += 0.15

            # 3. Lighting check (25%)
            brightness = np.mean(image)
            if 80 < brightness < 180:  # Good lighting range
                score += 0.25
            elif 50 < brightness < 220:  # Acceptable
                score += 0.15

            # 4. Noise level (25%)
            noise = np.std(image)
            if noise < 50:  # Low noise
                score += 0.25
            elif noise < 80:
                score += 0.15

            return min(1.0, max(0.0, score))

        except Exception as e:
            logger.error(f"Error assessing quality: {e}")
            return 0.0

    def _check_nsfw(self, image: np.ndarray) -> bool:
        """
        Check for NSFW/inappropriate content

        TODO: Implement with NSFW detection model
        Currently placeholder
        """
        # TODO: Use NSFW detection model
        # result = self.nsfw_model.predict(preprocess(image))
        # return result['sfw'] > 0.8

        # Placeholder: assume appropriate
        return True

    def verify_age_match(
        self,
        image_url: str,
        claimed_age: int,
        tolerance: int = 5
    ) -> bool:
        """
        Verify that image age matches claimed age

        Args:
            image_url: URL of the image
            claimed_age: Age claimed by user
            tolerance: Acceptable difference in years

        Returns:
            True if ages match within tolerance
        """
        result = self.verify_photo(image_url, claimed_age=claimed_age)

        if not result['is_real_person']:
            return False

        estimated_age = result.get('estimated_age')
        if estimated_age is None:
            return False

        age_diff = abs(estimated_age - claimed_age)
        return age_diff <= tolerance
