import sys
import os
import asyncio
from unittest.mock import MagicMock

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.selfie_service import selfie_service
from services.gemini_service import GeminiService
from services.recommendation_service import RecommendationService
from services.celebrity_match_service import CelebrityMatchService
from services.haircare_service import HairCareService
from services.tryon_service import TryOnService
from services.compare_service import CompareService
from services.ai_insights_service import AIInsightsService
from services.generation_queue import queue_manager
import services.recommendation_service as rec_svc
import services.celebrity_match_service as cel_svc
import services.haircare_service as hc_svc
import services.compare_service as cmp_svc
import services.gemini_service as gem_svc
import services.face_analysis_service as face_svc

# Mock api keys to bypass preliminary checks
rec_svc.api_key = "fake_key"
cel_svc.api_key = "fake_key"
hc_svc.api_key = "fake_key"
cmp_svc.api_key = "fake_key"
gem_svc.api_key = "fake_key"

import google.generativeai as genai
class MockResponse:
    def __init__(self, text):
        self.text = text

class MockModel:
    def generate_content(self, *args, **kwargs):
        # Depending on what is called, we return different JSON
        # Since it's a mock, we just return a valid empty JSON or a dummy depending on the call.
        # It's easier to just patch genai entirely or patch the services.
        pass

# Mock UploadFile
class MockUploadFile:
    def __init__(self, content, content_type):
        self.content = content
        self.content_type = content_type
    async def read(self):
        return self.content

async def run_test():
    test_uid = "test_user_123"
    print(f"--- Starting Full Runtime Test for user: {test_uid} ---")
    
    # 1. Selfie
    print("\n[1] Testing Selfie Upload...")
    try:
        # We simulate a tiny valid image (just bytes, backend doesn't decode in selfie_service, only checks size)
        mock_file = MockUploadFile(b"fake_image_data_but_valid_size", "image/jpeg")
        selfie_res = await selfie_service.upload_selfie(test_uid, mock_file)
        image_id = selfie_res["imageId"]
        image_url = selfie_res["imageUrl"]
        print(f"PASS: Uploaded selfie. ID: {image_id}, URL: {image_url}")
    except Exception as e:
        print(f"FAIL: Selfie upload failed. {e}")
        return

    # 2. Gemini Analysis
    print("\n[2] Testing Gemini Analysis...")
    try:
        gem_svc.genai.upload_file = MagicMock()
        gem_svc.genai.GenerativeModel = lambda *args, **kwargs: MagicMock(generate_content=lambda *args, **kwargs: MockResponse('{"faceShape": "Oval", "recommendations": []}'))
        gemini_res = GeminiService.analyze_image(test_uid, image_url)
        print(f"PASS: Gemini Analysis triggered. Status: {gemini_res.status}")
        analysis_id = gemini_res.analysisId
    except Exception as e:
        print(f"FAIL: Gemini Analysis crashed. {e}")
        return

    # 2.5 Face Analysis
    print("\n[2.5] Testing Face Analysis...")
    try:
        from services.face_analysis_service import FaceAnalysisService
        # The FaceAnalysisEngine needs mediapipe. To avoid installing mediapipe and downloading model just for a pure script test,
        # we will mock the engine's process_image method, but we can verify it saves correctly.
        class MockFaceEngine:
            def process_image(self, url):
                return {
                    "faceShape": "Oval",
                    "jawlineType": "Sharp",
                    "foreheadType": "Average",
                    "symmetryScore": 95,
                    "confidence": 0.95,
                    "analyzedAt": __import__('datetime').datetime.now(__import__('datetime').timezone.utc)
                }
        face_svc.engine = MockFaceEngine()
        face_res = FaceAnalysisService.start_analysis(test_uid, image_url)
        print(f"PASS: Face Analysis triggered. Status: {face_res.status}, Shape: {face_res.faceShape}")
    except Exception as e:
        print(f"FAIL: Face Analysis crashed. {e}")
        return

    # 3. Recommendations
    print("\n[3] Testing Recommendations...")
    try:
        # Mock Gemini generate
        rec_svc.genai.GenerativeModel = lambda *args, **kwargs: MagicMock(generate_content=lambda *args, **kwargs: MockResponse('{"summary": "Test", "recommendations": [], "hairColors": [], "beards": [], "celebrities": [], "trending": []}'))
        rec_res = RecommendationService.generate_recommendations(test_uid, analysis_id)
        print(f"PASS: Recommendations generated. Found {len(rec_res.recommendations)} items.")
    except Exception as e:
        print(f"FAIL: Recommendations crashed. {e}")
        return

    # 4. Celebrity Match
    print("\n[4] Testing Celebrity Match...")
    try:
        cel_svc.genai.GenerativeModel = lambda *args, **kwargs: MagicMock(generate_content=lambda *args, **kwargs: MockResponse('{"matches": []}'))
        cel_res = CelebrityMatchService.generate_matches(test_uid, analysis_id)
        print(f"PASS: Celebrity match generated. Found {len(cel_res.matches)} matches.")
    except Exception as e:
        print(f"FAIL: Celebrity match crashed. {e}")
        return

    # 5. Hair Care
    print("\n[5] Testing Hair Care...")
    try:
        hc_svc.genai.GenerativeModel = lambda *args, **kwargs: MagicMock(generate_content=lambda *args, **kwargs: MockResponse('[]'))
        haircare_res = HairCareService.generate_suggestions(test_uid)
        print(f"PASS: Hair Care suggestions generated. Found {len(haircare_res.suggestions)} items.")
    except Exception as e:
        print(f"FAIL: Hair Care crashed. {e}")
        return

    # 6. Try-On
    print("\n[6] Testing Try-On Generation Queue...")
    try:
        # We need to mock the provider so we don't actually call Replicate
        import services.generation_queue as gq
        class MockProvider:
            async def generate_tryon(self, src, prompt, conf):
                return "https://fake_generated_url.com/image.jpg"
        
        gq.get_provider = lambda x: MockProvider()
        
        tryon_id = "test_tryon_123"
        hairstyle_id = "test_hairstyle_123"
        # Create dummy tryon document first so update works
        from firebase_config import db
        db.collection("users").document(test_uid).collection("tryons").document(tryon_id).set({"status": "pending"})
        db.collection("hairstyles").document(hairstyle_id).set({"name": "Test Style"})
        
        await queue_manager.process_tryon_job(test_uid, tryon_id, image_id, hairstyle_id, {})
        
        doc = db.collection("users").document(test_uid).collection("tryons").document(tryon_id).get()
        print(f"PASS: Try-On Job completed. Status: {doc.to_dict().get('status')}")
    except Exception as e:
        print(f"FAIL: Try-On generation crashed. {e}")
        return

    # 7. Comparison
    print("\n[7] Testing Comparison Generation...")
    try:
        req = CompareCreateRequest(
            comparisonType="Hair Color",
            items=[
                ComparedItem(id="img1", imageUrl="http://example.com/1.jpg"),
                ComparedItem(id="img2", imageUrl="http://example.com/2.jpg")
            ]
        )
        cmp_svc.genai.upload_file = MagicMock()
        cmp_svc.genai.GenerativeModel = lambda *args, **kwargs: MagicMock(generate_content=lambda *args, **kwargs: MockResponse('{"bestStyleId": "img1", "recommendationReason": "Test", "scores": []}'))
        comp_res = CompareService.create_comparison(test_uid, req)
        print(f"PASS: Comparison generated. Status: {comp_res.status}")
    except Exception as e:
        print(f"FAIL: Comparison generation crashed. {e}")

    # 8. AI Insights
    print("\n[8] Testing AI Insights Aggregation...")
    try:
        insights = AIInsightsService.get_user_insights(test_uid)
        print(f"PASS: AI Insights fetched. Status: {insights.status}")
        print(f"  Face keys: {list(insights.faceAnalysis.keys())}")
        print(f"  Hair keys: {list(insights.hairAnalysis.keys())}")
        print(f"  Gemini keys: {list(insights.geminiAnalysis.keys())}")
    except Exception as e:
        print(f"FAIL: AI Insights crashed. {e}")

if __name__ == "__main__":
    asyncio.run(run_test())
