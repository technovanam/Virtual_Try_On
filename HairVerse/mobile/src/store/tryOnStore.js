import { create } from 'zustand';
import axios from 'axios';

const BACKEND_BASE_URL = 'http://localhost:8000'; // Fallback to localhost for development

export const useTryOnStore = create((set, get) => ({
  selectedHairstyle: null,
  selectedColor: null,
  selectedBeardStyle: null,
  renderedImageURL: null,
  isRendering: false,

  setSelectedHairstyle: (style) => set({ selectedHairstyle: style }),
  setSelectedColor: (color) => set({ selectedColor: color }),
  setSelectedBeardStyle: (beard) => set({ selectedBeardStyle: beard }),

  generateTryOn: async (imageId) => {
    set({ isRendering: true });
    try {
      const response = await axios.post(`${BACKEND_BASE_URL}/tryon/generate`, {
        image_id: imageId,
        hairstyle_id: get().selectedHairstyle?.id || 'default_fade',
        hair_color: get().selectedColor || 'Black',
        beard_style: get().selectedBeardStyle || 'Clean Shave',
      });
      set({ renderedImageURL: response.data.rendered_image_url, isRendering: false });
    } catch (error) {
      console.error('Try-on rendering failed', error);
      set({ isRendering: false });
    }
  },

  resetTryOn: () => set({
    selectedHairstyle: null,
    selectedColor: null,
    selectedBeardStyle: null,
    renderedImageURL: null,
  })
}));
