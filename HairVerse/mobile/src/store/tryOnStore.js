import { create } from 'zustand';
import axios from 'axios';

const BACKEND_BASE_URL = 'http://localhost:8000'; // Fallback to localhost for development

const DEFAULT_COLORS = [
  {"id": "black", "name": "Black", "hex": "#09090C", "gradient": ["#000000", "#1E1E24"], "popularity": 94, "skinCompatibility": "All Skin Tones", "trending": false, "recommended": true},
  {"id": "dark_brown", "name": "Dark Brown", "hex": "#3C2F2F", "gradient": ["#2B1E1E", "#4E3629"], "popularity": 88, "skinCompatibility": "Warm & Neutral", "trending": false, "recommended": true},
  {"id": "light_brown", "name": "Light Brown", "hex": "#8B5A2B", "gradient": ["#6A431D", "#A06B30"], "popularity": 82, "skinCompatibility": "Cool & Warm", "trending": true, "recommended": false},
  {"id": "blonde", "name": "Blonde", "hex": "#D4AF37", "gradient": ["#BFA054", "#F4DF4B"], "popularity": 79, "skinCompatibility": "Cool & Fair", "trending": true, "recommended": false},
  {"id": "burgundy", "name": "Burgundy", "hex": "#800020", "gradient": ["#4A0010", "#90002A"], "popularity": 85, "skinCompatibility": "Dark & Fair", "trending": true, "recommended": true},
  {"id": "silver", "name": "Silver", "hex": "#C0C0C0", "gradient": ["#9A9A9A", "#E0E0E0"], "popularity": 91, "skinCompatibility": "Cool & Neutral", "trending": true, "recommended": true}
];

const DEFAULT_BEARDS = [
  {"id": "clean_shave", "name": "Clean Shave", "compatibility": 95, "bestMatch": true, "thumbnail": "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=100&h=100&fit=crop"},
  {"id": "stubble", "name": "Stubble", "compatibility": 88, "bestMatch": false, "thumbnail": "https://images.unsplash.com/photo-1605497746444-ac9dbd39f4a5?w=100&h=100&fit=crop"},
  {"id": "short_beard", "name": "Short Beard", "compatibility": 82, "bestMatch": false, "thumbnail": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"},
  {"id": "full_beard", "name": "Full Beard", "compatibility": 75, "bestMatch": false, "thumbnail": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop"},
  {"id": "fade_beard", "name": "Fade Beard", "compatibility": 90, "bestMatch": true, "thumbnail": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"}
];

export const useTryOnStore = create((set, get) => ({
  selectedHairstyle: null,
  selectedColor: "Black",
  selectedBeardStyle: "Clean Shave",
  renderedImageURL: null,
  isRendering: false,
  hairColors: DEFAULT_COLORS,
  beardStyles: DEFAULT_BEARDS,
  isLoadingOptions: false,

  setSelectedHairstyle: (style) => set({ selectedHairstyle: style }),
  setSelectedColor: (color) => set({ selectedColor: color }),
  setSelectedBeardStyle: (beard) => set({ selectedBeardStyle: beard }),

  fetchColors: async () => {
    set({ isLoadingOptions: true });
    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/tryon/colors`);
      if (response.data && response.data.length > 0) {
        set({ hairColors: response.data, isLoadingOptions: false });
      } else {
        set({ hairColors: DEFAULT_COLORS, isLoadingOptions: false });
      }
    } catch (error) {
      console.warn('Failed to load hair colors from backend. Using offline default.');
      set({ hairColors: DEFAULT_COLORS, isLoadingOptions: false });
    }
  },

  fetchBeards: async () => {
    set({ isLoadingOptions: true });
    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/tryon/beards`);
      if (response.data && response.data.length > 0) {
        set({ beardStyles: response.data, isLoadingOptions: false });
      } else {
        set({ beardStyles: DEFAULT_BEARDS, isLoadingOptions: false });
      }
    } catch (error) {
      console.warn('Failed to load beard styles from backend. Using offline default.');
      set({ beardStyles: DEFAULT_BEARDS, isLoadingOptions: false });
    }
  },

  generateTryOn: async (image_base64) => {
    set({ isRendering: true });
    try {
      const response = await axios.post(`${BACKEND_BASE_URL}/tryon/generate`, {
        image_base64: image_base64,
        hairstyle_id: get().selectedHairstyle?.id || 'fade_01',
        hair_color: get().selectedColor || 'Black',
        beard_style: get().selectedBeardStyle || 'Clean Shave',
      });
      set({ renderedImageURL: response.data.rendered_image_url, isRendering: false });
      return response.data.rendered_image_url;
    } catch (error) {
      console.error('Try-on rendering failed', error);
      set({ isRendering: false });
      // simulated base64 fallback in case backend is down
      return null;
    }
  },

  resetTryOn: () => set({
    selectedHairstyle: null,
    selectedColor: "Black",
    selectedBeardStyle: "Clean Shave",
    renderedImageURL: null,
  })
}));

