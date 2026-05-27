import cv2
import numpy as np
import base64
import os

def render_tryon_composition(image_bytes: bytes, hairstyle_id: str, hair_color: str, beard_style: str) -> str:
    """
    Renders a composite image by overlaying a hairstyle and beard on the user's face.
    For the MVP: Dynamically draws / generates a stylized face try-on result as base64 to display real visual updates.
    """
    try:
        # Load user image from bytes
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            # Fallback to a black canvas if the uploaded image is invalid
            img = np.zeros((500, 500, 3), dtype=np.uint8) + 15  # Near black
            
        h, w, c = img.shape
        
        # Create a copy to edit
        canvas = img.copy()
        
        # Simple face detection / central area positioning
        center_x = w // 2
        center_y = h // 2
        face_radius = min(w, h) // 4
        
        # Map colors to BGR values
        color_map = {
            "Black": (10, 10, 10),
            "Dark Brown": (20, 40, 60),
            "Light Brown": (40, 80, 120),
            "Blonde": (120, 220, 240),
            "Burgundy": (40, 10, 100),
            "Silver": (200, 200, 200)
        }
        bgr_color = color_map.get(hair_color, (10, 10, 10))
        
        # 1. Simulate Hairstyle Overlay
        # Let's draw an arch / shape representing the hair at the top of the head
        hair_y = center_y - face_radius
        
        if "fade" in hairstyle_id.lower():
            # Draw short crop on top
            cv2.ellipse(canvas, (center_x, hair_y), (face_radius, face_radius // 2), 0, 180, 360, bgr_color, -1)
        elif "korean" in hairstyle_id.lower():
            # Draw bangs/textured down sweep
            cv2.ellipse(canvas, (center_x, hair_y + 10), (face_radius + 10, face_radius // 2 + 10), 0, 180, 360, bgr_color, -1)
            # Bangs details
            cv2.ellipse(canvas, (center_x, hair_y + 20), (face_radius - 20, 20), 0, 0, 180, bgr_color, -1)
        else:
            # Standard styled hair top
            cv2.ellipse(canvas, (center_x, hair_y), (face_radius, face_radius // 2), 0, 180, 360, bgr_color, -1)

        # 2. Simulate Beard Options
        if beard_style and "clean" not in beard_style.lower():
            beard_color = (40, 40, 40) if "silver" not in hair_color.lower() else (180, 180, 180)
            if "stubble" in beard_style.lower():
                # Stubble is short and thin
                cv2.ellipse(canvas, (center_x, center_y + face_radius // 2), (face_radius - 10, face_radius // 2), 0, 0, 180, beard_color, 6)
            elif "fade" in beard_style.lower():
                # Fade beard has a faded cheekline and styled chin
                cv2.ellipse(canvas, (center_x, center_y + face_radius // 2), (face_radius - 15, face_radius // 2), 0, 0, 180, beard_color, 5)
                # Drawing elegant faded side sideburns lines
                cv2.line(canvas, (center_x - face_radius + 5, center_y - 20), (center_x - face_radius + 20, center_y + 30), beard_color, 4)
                cv2.line(canvas, (center_x + face_radius - 5, center_y - 20), (center_x + face_radius - 20, center_y + 30), beard_color, 4)
            elif "short" in beard_style.lower():
                # Short beard is medium thickness
                cv2.ellipse(canvas, (center_x, center_y + face_radius // 2), (face_radius - 10, face_radius // 2), 0, 0, 180, beard_color, 12)
            else:
                # Full Beard is thick
                cv2.ellipse(canvas, (center_x, center_y + face_radius // 2), (face_radius - 8, face_radius // 2), 0, 0, 180, beard_color, 24)

        # Encode resulting image to base64 so it can be sent directly to the client without disk storage issues
        _, encoded_img = cv2.imencode('.png', canvas)
        base64_str = base64.b64encode(encoded_img).decode('utf-8')
        
        return f"data:image/png;base64,{base64_str}"
        
    except Exception as e:
        print(f"Error compiling AI try-on composition: {e}")
        # Standard mock fallback URL if rendering breaks entirely
        return "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=500"
