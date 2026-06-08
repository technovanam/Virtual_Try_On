def build_tryon_prompt(
    face_shape: str,
    hair_density: str,
    hair_texture: str,
    hair_color: str,
    hairstyle_name: str,
    hairstyle_description: str
) -> str:
    """
    Constructs a comprehensive, provider-ready generation prompt for the Virtual Try-On.
    
    Args:
        face_shape: The user's face shape (e.g., 'Oval', 'Square').
        hair_density: The user's hair density (e.g., 'Thick', 'Thin').
        hair_texture: The user's hair texture (e.g., 'Straight', 'Curly').
        hair_color: The target or current hair color.
        hairstyle_name: The name of the selected hairstyle.
        hairstyle_description: Detailed description of the hairstyle.
        
    Returns:
        A detailed prompt string optimized for diffusion models.
    """
    
    # Handle defaults
    face_shape_str = f"with a {face_shape} face shape" if face_shape and face_shape.lower() != "unknown" else ""
    hair_density_str = f"{hair_density}" if hair_density and hair_density.lower() != "unknown" else ""
    hair_texture_str = f"{hair_texture}" if hair_texture and hair_texture.lower() != "unknown" else ""
    hair_color_str = f"colored {hair_color}" if hair_color and hair_color.lower() != "unknown" else ""
    
    hair_characteristics = []
    if hair_density_str: hair_characteristics.append(hair_density_str)
    if hair_texture_str: hair_characteristics.append(hair_texture_str)
    
    hair_type = " and ".join(hair_characteristics)
    if hair_type:
        hair_type = f"styled with {hair_type} hair"
        
    prompt = (
        f"A photorealistic, highly detailed portrait of a person {face_shape_str}, "
        f"wearing a {hairstyle_name} hairstyle. "
    )
    
    if hairstyle_description:
        prompt += f"The hairstyle is {hairstyle_description}. "
        
    if hair_type or hair_color_str:
        prompt += f"The hair is {hair_type} {hair_color_str}. "
        
    prompt += "High quality, 8k resolution, cinematic lighting, photorealistic."
    
    return prompt.strip()
