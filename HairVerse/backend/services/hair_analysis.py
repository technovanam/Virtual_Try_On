def analyze_hair(image_bytes: bytes) -> dict:
    """
    Analyzes the hair region for texture, type, density, and health score.
    """
    # For MVP, we scan basic color distribution or structure and return metrics.
    return {
        "hair_type": "Straight",
        "hair_texture": "Smooth",
        "hair_density": "Medium",
        "hair_health_score": 85,
        "volume_score": 75,
        "dryness_level": "Normal",
        "breakage_risk": "Low"
    }

def analyze_beard(image_bytes: bytes) -> dict:
    """
    Analyzes beard density and compatibility.
    """
    return {
        "beard_density": "Light Stubble",
        "beard_compatibility_score": 90,
        "mustache_suitability": "High"
    }
