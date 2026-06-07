import uuid
import requests
import cv2
import numpy as np
import mediapipe as mp
from datetime import datetime, timezone
from fastapi import HTTPException
from firebase_config import db
from schemas.face_analysis import FaceAnalysisResponse

class FaceAnalysisEngine:
    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=2, # Set to 2 to detect multiple faces
            refine_landmarks=True,
            min_detection_confidence=0.5
        )

    def process_image(self, image_url: str):
        # 1. Download and decode image
        try:
            resp = requests.get(image_url, timeout=10)
            resp.raise_for_status()
            image_array = np.asarray(bytearray(resp.content), dtype=np.uint8)
            img = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
            if img is None:
                raise ValueError("Image decode failed")
        except Exception as e:
            raise HTTPException(status_code=400, detail="Invalid or corrupted image")
            
        h, w, _ = img.shape

        # 2. Image Quality Validation
        # Blur detection
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
        if blur_score < 100:
            raise HTTPException(status_code=400, detail="Image is too blurry for accurate analysis.")

        # 3. MediaPipe Face Mesh
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(img_rgb)
        
        # Validation: No face
        if not results.multi_face_landmarks:
            raise HTTPException(status_code=400, detail="No face detected in the image.")
            
        # Validation: Multiple faces
        if len(results.multi_face_landmarks) > 1:
            raise HTTPException(status_code=400, detail="Multiple faces detected. Please upload a solo selfie.")
            
        landmarks = results.multi_face_landmarks[0].landmark
        
        # Verify landmark count (MediaPipe with refine_landmarks=True returns 478, we use core 468)
        if len(landmarks) < 468:
            raise HTTPException(status_code=400, detail="Incomplete facial landmarks extracted.")
            
        # Extract pixel coordinates helper
        def get_pt(idx):
            lm = landmarks[idx]
            return np.array([lm.x * w, lm.y * h])

        # 4. Extract Key Landmarks
        top_head = get_pt(10)
        chin = get_pt(152)
        left_cheek = get_pt(234)
        right_cheek = get_pt(454)
        left_jaw = get_pt(132)
        right_jaw = get_pt(361)
        left_forehead = get_pt(68)
        right_forehead = get_pt(298)
        nose_tip = get_pt(1)

        # Validation: Side Profile / Hidden Face
        # Check if nose is relatively centered between cheeks
        dist_left_nose = np.linalg.norm(left_cheek - nose_tip)
        dist_right_nose = np.linalg.norm(right_cheek - nose_tip)
        ratio = dist_left_nose / dist_right_nose if dist_right_nose > 0 else 0
        if ratio < 0.4 or ratio > 2.5:
            raise HTTPException(status_code=400, detail="Side profile detected. Please face the camera directly.")

        # Calculate Distances
        face_length = np.linalg.norm(top_head - chin)
        cheek_width = np.linalg.norm(left_cheek - right_cheek)
        jaw_width = np.linalg.norm(left_jaw - right_jaw)
        forehead_width = np.linalg.norm(left_forehead - right_forehead)
        
        # 5. Face Shape Logic
        # Ratios
        l_to_w = face_length / cheek_width if cheek_width > 0 else 1
        j_to_c = jaw_width / cheek_width if cheek_width > 0 else 1
        f_to_c = forehead_width / cheek_width if cheek_width > 0 else 1
        
        if l_to_w > 1.5:
            face_shape = "Rectangle"
        elif l_to_w > 1.35:
            if j_to_c > 0.85 and f_to_c > 0.85:
                face_shape = "Square"
            elif j_to_c < 0.75 and f_to_c > 0.8:
                face_shape = "Heart"
            else:
                face_shape = "Oval"
        elif l_to_w < 1.2:
            if j_to_c > 0.85:
                face_shape = "Square"
            else:
                face_shape = "Round"
        else:
            if j_to_c < 0.75:
                if f_to_c > 0.8:
                    face_shape = "Heart"
                else:
                    face_shape = "Diamond"
            elif j_to_c > 0.9:
                face_shape = "Square"
            else:
                face_shape = "Round"
                
        # 6. Jawline Logic
        # Angle at the jaw hinge (landmark 132, 152, 361)
        # Using left jaw -> chin -> right jaw angle
        vec1 = left_jaw - chin
        vec2 = right_jaw - chin
        cosine_angle = np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))
        angle = np.degrees(np.arccos(np.clip(cosine_angle, -1.0, 1.0)))
        
        if angle < 110:
            jawline_type = "Sharp"
        elif angle < 125:
            jawline_type = "Angular"
        elif angle < 140:
            jawline_type = "Soft"
        else:
            jawline_type = "Rounded"
            
        # 7. Forehead Logic
        # Ratio of forehead height to total face height
        # Forehead top: 10, eyebrows approx: 9
        eyebrow_center = get_pt(9)
        forehead_height = np.linalg.norm(top_head - eyebrow_center)
        fh_ratio = forehead_height / face_length
        
        if fh_ratio < 0.25:
            forehead_type = "Narrow"
        elif fh_ratio < 0.33:
            forehead_type = "Average"
        else:
            forehead_type = "Wide"
            
        # 8. Symmetry Logic
        # We compare left and right distances to the vertical midline
        # Midline defined by top_head and chin
        midline_vec = chin - top_head
        midline_len = np.linalg.norm(midline_vec)
        midline_unit = midline_vec / midline_len if midline_len > 0 else np.array([0, 1])
        
        def dist_to_midline(pt):
            # Distance from point to line defined by top_head and midline_unit
            vec = pt - top_head
            proj = np.dot(vec, midline_unit)
            proj_pt = top_head + proj * midline_unit
            return np.linalg.norm(pt - proj_pt)
            
        left_cheek_dist = dist_to_midline(left_cheek)
        right_cheek_dist = dist_to_midline(right_cheek)
        left_jaw_dist = dist_to_midline(left_jaw)
        right_jaw_dist = dist_to_midline(right_jaw)
        left_eye = dist_to_midline(get_pt(33))
        right_eye = dist_to_midline(get_pt(263))
        
        diff_cheek = abs(left_cheek_dist - right_cheek_dist) / max(left_cheek_dist, right_cheek_dist, 1)
        diff_jaw = abs(left_jaw_dist - right_jaw_dist) / max(left_jaw_dist, right_jaw_dist, 1)
        diff_eye = abs(left_eye - right_eye) / max(left_eye, right_eye, 1)
        
        avg_diff = (diff_cheek + diff_jaw + diff_eye) / 3.0
        symmetry_score = max(0, min(100, int((1.0 - avg_diff) * 100)))

        return {
            "faceShape": face_shape,
            "jawlineType": jawline_type,
            "foreheadType": forehead_type,
            "symmetryScore": symmetry_score,
            "confidence": 0.95, # High confidence for deterministic MediaPipe
            "analyzedAt": datetime.now(timezone.utc)
        }

# Singleton instance
engine = None

class FaceAnalysisService:
    @staticmethod
    def start_analysis(uid: str, image_url: str = None) -> FaceAnalysisResponse:
        global engine
        if engine is None:
            engine = FaceAnalysisEngine()
            
        if db is None:
            raise HTTPException(status_code=500, detail="Firebase DB not initialized")

        # 1. Resolve image url from active selfie if not provided
        if not image_url:
            selfies_ref = db.collection("users").document(uid).collection("selfies")
            active_selfies = selfies_ref.where("isActive", "==", True).limit(1).get()
            
            if not active_selfies:
                raise HTTPException(status_code=404, detail="No active selfie found")
                
            active_selfie_data = active_selfies[0].to_dict()
            image_url = active_selfie_data.get("imageUrl")
            
            if not image_url:
                raise HTTPException(status_code=400, detail="Active selfie missing image URL")
                
        # 2. Run Computer Vision processing
        analysis_id = str(uuid.uuid4())
        try:
            results = engine.process_image(image_url)
        except Exception as e:
            # Re-raise HTTPExceptions (like blur, multiple faces) so client knows
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=500, detail=f"Face analysis failed: {str(e)}")
            
        # 3. Format and save data
        data = {
            "analysisId": analysis_id,
            "status": "completed",
            "createdAt": datetime.now(timezone.utc),
            "faceShape": results["faceShape"],
            "jawlineType": results["jawlineType"],
            "foreheadType": results["foreheadType"],
            "symmetryScore": results["symmetryScore"],
            "confidence": results["confidence"],
            "analyzedAt": results["analyzedAt"]
        }
        
        db.collection("users").document(uid).collection("faceAnalysis").document(analysis_id).set(data)
        
        return FaceAnalysisResponse(
            status="completed",
            analysisId=analysis_id,
            **results
        )

    @staticmethod
    def get_analysis(uid: str, analysis_id: str) -> FaceAnalysisResponse:
        if db is None:
            return FaceAnalysisResponse(status="pending", analysisId=analysis_id)
            
        doc_ref = db.collection("users").document(uid).collection("faceAnalysis").document(analysis_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return FaceAnalysisResponse(status="not_found", analysisId=analysis_id)
            
        data = doc.to_dict()
        
        def parse_timestamp(ts_raw):
            if not ts_raw:
                return None
            ts = datetime.now()
            if hasattr(ts_raw, 'timestamp'):
                ts = datetime.fromtimestamp(ts_raw.timestamp())
            elif isinstance(ts_raw, str):
                try:
                    ts = datetime.fromisoformat(ts_raw.replace('Z', '+00:00'))
                except ValueError:
                    pass
            return ts
            
        return FaceAnalysisResponse(
            status=data.get("status", "pending"),
            analysisId=data.get("analysisId", analysis_id),
            faceShape=data.get("faceShape"),
            symmetryScore=data.get("symmetryScore"),
            foreheadType=data.get("foreheadType"),
            jawlineType=data.get("jawlineType"),
            confidence=data.get("confidence"),
            analyzedAt=parse_timestamp(data.get("analyzedAt"))
        )
