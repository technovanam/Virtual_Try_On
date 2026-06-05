from services.hair_analysis_service import HairAnalysisEngine
print("Testing HairAnalysisEngine initialization...")
try:
    engine = HairAnalysisEngine()
    print("Engine initialized successfully.")
except Exception as e:
    print(f"Error initializing engine: {e}")
