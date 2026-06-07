import uuid
import os
import urllib.request
from datetime import datetime, timezone
import requests
import cv2
import numpy as np
import mediapipe as mp
from fastapi import HTTPException
from firebase_config import db
from schemas.hair_analysis import HairAnalysisResponse

# Ensure model is downloaded
MODEL_PATH = "selfie_multiclass_256x256.tflite"
def ensure_model_exists():
    if not os.path.exists(MODEL_PATH):
        print("Downloading MediaPipe multiclass selfie model...")
        url = "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite"
        urllib.request.urlretrieve(url, MODEL_PATH)

class HairAnalysisEngine:
    def __init__(self):
        ensure_model_exists()
        BaseOptions = mp.tasks.BaseOptions
        ImageSegmenter = mp.tasks.vision.ImageSegmenter
        ImageSegmenterOptions = mp.tasks.vision.ImageSegmenterOptions
        VisionRunningMode = mp.tasks.vision.RunningMode

        options = ImageSegmenterOptions(
            base_options=BaseOptions(model_asset_path=MODEL_PATH),
            running_mode=VisionRunningMode.IMAGE,
            output_category_mask=True
        )
        self.segmenter = ImageSegmenter.create_from_options(options)

    def process_image(self, image_url: str):
        # Download image
        resp = requests.get(image_url)
        if resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Could not download image from URL")
        
        image_array = np.asarray(bytearray(resp.content), dtype=np.uint8)
        img = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid or corrupted image")
        
        # Convert BGR to RGB for MediaPipe
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_rgb)
        
        # Run segmentation
        segmentation_result = self.segmenter.segment(mp_image)
        category_mask = segmentation_result.category_mask.numpy_view()
        
        # Classes: 0: background, 1: hair, 2: body-skin, 3: face-skin, 4: clothes, 5: others
        hair_mask = (category_mask == 1).astype(np.uint8) * 255
        face_mask = (category_mask == 3).astype(np.uint8) * 255
        
        hair_area = np.sum(hair_mask > 0)
        face_area = np.sum(face_mask > 0)
        
        if hair_area < 500: # Threshold for no visible hair
            raise HTTPException(status_code=400, detail="No visible hair or hair covered by cap")
            
        if face_area < 500:
            raise HTTPException(status_code=400, detail="Face not clearly visible")

        # Calculations
        h, w = img.shape[:2]
        
        # 1. Density (ratio of hair area to face area)
        density_ratio = hair_area / face_area
        if density_ratio < 0.6:
            density = "Thin"
        elif density_ratio < 1.2:
            density = "Medium"
        else:
            density = "Thick"
            
        # 2. Length (y-coordinate extent)
        y_indices_hair, _ = np.where(hair_mask > 0)
        y_indices_face, _ = np.where(face_mask > 0)
        
        face_bottom_y = np.max(y_indices_face)
        face_height = np.max(y_indices_face) - np.min(y_indices_face)
        hair_bottom_y = np.max(y_indices_hair)
        
        # Compare hair bottom with face bottom
        if hair_bottom_y < face_bottom_y - (face_height * 0.2):
            length = "Very Short"
        elif hair_bottom_y < face_bottom_y + (face_height * 0.1):
            length = "Short"
        elif hair_bottom_y < face_bottom_y + (face_height * 0.6):
            length = "Medium"
        else:
            length = "Long"

        # 3. Texture (Variance of Laplacian on hair region)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        hair_gray = cv2.bitwise_and(gray, gray, mask=hair_mask)
        laplacian_var = cv2.Laplacian(hair_gray, cv2.CV_64F).var()
        
        # GLCM logic or variance logic
        # Straight hair tends to have smoother gradients, curly has high variance
        if laplacian_var < 500:
            texture = "Straight"
        elif laplacian_var < 1500:
            texture = "Wavy"
        elif laplacian_var < 3000:
            texture = "Curly"
        else:
            texture = "Coily"
            
        # 4. Color (K-Means on hair pixels)
        hair_pixels = img_rgb[hair_mask > 0]
        if len(hair_pixels) > 1000:
            # Subsample for performance
            indices = np.random.choice(len(hair_pixels), 1000, replace=False)
            sample_pixels = hair_pixels[indices]
        else:
            sample_pixels = hair_pixels
            
        sample_pixels = np.float32(sample_pixels)
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
        _, _, centers = cv2.kmeans(sample_pixels, 1, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
        dominant_color = centers[0] # RGB
        
        # Simple color mapping
        r, g, b = dominant_color
        if r > 150 and g < 100 and b < 100:
            color = "Red"
        elif r > 180 and g > 150 and b > 100:
            color = "Blonde"
        elif r < 60 and g < 60 and b < 60:
            color = "Black"
        elif abs(r-g) < 30 and abs(g-b) < 30 and r > 100:
            color = "Grey"
        elif r > g and r > b:
            color = "Brown"
        else:
            color = "Other"
            
        # 5. Health Score
        # Simple metric based on blurriness + contrast
        health_score = min(max(int((laplacian_var / 4000) * 100), 40), 98) # Normalize
        if health_score > 80:
            health_status = "Healthy"
        elif health_score > 60:
            health_status = "Moderate"
        else:
            health_status = "Needs Attention"
            
        # 6. Hairline Type
        # Compare top of face mask with top of hair mask
        face_top_y = np.min(y_indices_face)
        hair_top_y = np.min(y_indices_hair)
        
        if face_top_y - hair_top_y > face_height * 0.3:
            hairline_type = "Normal"
        elif face_top_y - hair_top_y < face_height * 0.15:
            hairline_type = "Receding"
        else:
            hairline_type = "Mature"
            
        return {
            "density": density,
            "thickness": density, # Map thickness to density for now
            "length": length,
            "texture": texture,
            "color": color,
            "healthScore": float(health_score),
            "hairlineType": hairline_type,
            "confidence": 0.92
        }

engine = None

class HairAnalysisService:
    @staticmethod
    def start_analysis(uid: str, image_url: str = None) -> HairAnalysisResponse:
        global engine
        if engine is None:
            engine = HairAnalysisEngine()
            
        if db is None:
            raise HTTPException(status_code=500, detail="Firebase DB not initialized")

        # Fetch active selfie
        selfies_ref = db.collection("users").document(uid).collection("selfies")
        active_selfies = selfies_ref.where("isActive", "==", True).limit(1).get()
        
        if not active_selfies:
            raise HTTPException(status_code=404, detail="No active selfie found")
            
        active_selfie_data = active_selfies[0].to_dict()
        target_image_url = active_selfie_data.get("imageUrl")
        
        if not target_image_url:
            raise HTTPException(status_code=400, detail="Active selfie missing image URL")
            
        # Run computer vision processing
        analysis_id = str(uuid.uuid4())
        results = engine.process_image(target_image_url)
        
        now = datetime.now(timezone.utc)
        data = {
            "analysisId": analysis_id,
            "status": "completed",
            "createdAt": now,
            "analyzedAt": now,
            "density": results["density"],
            "thickness": results["thickness"],
            "length": results["length"],
            "texture": results["texture"],
            "color": results["color"],
            "healthScore": results["healthScore"],
            "hairlineType": results["hairlineType"],
            "confidence": results["confidence"]
        }
        
        # Write to hairAnalysis
        db.collection("users").document(uid).collection("hairAnalysis").document(analysis_id).set(data)
            
        return HairAnalysisResponse(
            status="completed",
            analysisId=analysis_id,
            **results,
            analyzedAt=now
        )

    @staticmethod
    def get_analysis(uid: str, analysis_id: str) -> HairAnalysisResponse:
        if db is None:
            return HairAnalysisResponse(status="pending", analysisId=analysis_id)
            
        doc_ref = db.collection("users").document(uid).collection("hairAnalysis").document(analysis_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return HairAnalysisResponse(status="not_found", analysisId=analysis_id)
            
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
            
        return HairAnalysisResponse(
            status=data.get("status", "pending"),
            analysisId=data.get("analysisId", analysis_id),
            density=data.get("density"),
            thickness=data.get("thickness"),
            length=data.get("length"),
            texture=data.get("texture"),
            color=data.get("color"),
            healthScore=data.get("healthScore"),
            hairlineType=data.get("hairlineType"),
            confidence=data.get("confidence"),
            analyzedAt=parse_timestamp(data.get("analyzedAt"))
        )
