import { create } from 'zustand';
import axios from 'axios';
import { useAnalysisStore } from './analysisStore';

const BACKEND_BASE_URL = 'http://localhost:8000';

const MOCK_PROFILE_AVATARS = {
  sasi: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
  ananya: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
  guest: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop', // default guest silhouette placeholder
};

export const useProfileStore = create((set, get) => ({
  profiles: [
    {
      id: 'sasi',
      name: 'Sasi',
      avatarUrl: MOCK_PROFILE_AVATARS.sasi,
      selfieBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      analysisData: {
        face_shape: 'Oval',
        hair_type: 'Straight',
        hair_density: 'Medium',
        hair_texture: 'Smooth',
      },
      isGuest: false,
      lastUsedTime: 'Active Now'
    },
    {
      id: 'ananya',
      name: 'Ananya',
      avatarUrl: MOCK_PROFILE_AVATARS.ananya,
      selfieBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      analysisData: {
        face_shape: 'Heart',
        hair_type: 'Curly',
        hair_density: 'Thick',
        hair_texture: 'Wavy',
      },
      isGuest: false,
      lastUsedTime: '4 hours ago'
    },
    {
      id: 'guest',
      name: 'Guest User',
      avatarUrl: MOCK_PROFILE_AVATARS.guest,
      selfieBase64: null,
      analysisData: null,
      isGuest: true,
      lastUsedTime: '1 day ago'
    }
  ],
  activeProfileId: 'sasi',

  fetchProfiles: async () => {
    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/homepage/profiles`);
      if (response.data && response.data.length > 0) {
        set({ profiles: response.data });
        // Restore active profile bindings in analysis store
        const active = response.data.find(p => p.id === get().activeProfileId);
        if (active) {
          useAnalysisStore.setState({
            userSelfieBase64: active.selfieBase64,
            currentAnalysis: active.analysisData
          });
        }
      }
    } catch (error) {
      console.warn("Failed to fetch profiles from backend, using offline fallback.", error);
    }
  },

  setActiveProfile: (id) => {
    const profile = get().profiles.find(p => p.id === id);
    if (profile) {
      // Dynamic shift of lastUsedTime
      const updatedProfiles = get().profiles.map(p => {
        if (p.id === id) {
          return { ...p, lastUsedTime: 'Active Now' };
        } else if (p.id === get().activeProfileId) {
          return { ...p, lastUsedTime: 'Just Now' };
        }
        return p;
      });

      set({ 
        activeProfileId: id,
        profiles: updatedProfiles
      });

      // Update backend if possible
      const targetProfile = updatedProfiles.find(p => p.id === id);
      if (targetProfile) {
        axios.put(`${BACKEND_BASE_URL}/homepage/profiles/${id}`, targetProfile)
          .catch(err => console.warn("Failed to sync profile update on backend", err));
      }
      
      // Synchronize with existing analysis store
      useAnalysisStore.setState({
        userSelfieBase64: profile.selfieBase64,
        currentAnalysis: profile.analysisData
      });
    }
  },

  addProfile: async (name, selfieBase64 = null, analysisData = null) => {
    const newId = Date.now().toString();
    const newProfile = {
      id: newId,
      name,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7C5CFC&color=fff`,
      selfieBase64,
      analysisData,
      isGuest: false,
      lastUsedTime: 'Active Now'
    };

    // Save on backend dynamically
    try {
      await axios.post(`${BACKEND_BASE_URL}/homepage/profiles`, newProfile);
    } catch (error) {
      console.warn("Failed to push profile to backend, saving locally only.", error);
    }

    set(state => {
      // Mark other active profile as 'Just Now'
      const updatedExisting = state.profiles.map(p => {
        if (p.id === state.activeProfileId) {
          return { ...p, lastUsedTime: 'Just Now' };
        }
        return p;
      });
      return {
        profiles: [...updatedExisting, newProfile],
        activeProfileId: newId
      };
    });

    // Synchronize with existing analysis store
    useAnalysisStore.setState({
      userSelfieBase64: selfieBase64,
      currentAnalysis: analysisData
    });
  },

  updateActiveSelfie: async (selfieBase64, analysisData) => {
    const { activeProfileId, profiles } = get();
    let updatedProfile = null;
    const updatedProfiles = profiles.map(p => {
      if (p.id === activeProfileId) {
        // Also update avatarUrl to the selfie thumbnail if uploaded locally
        updatedProfile = {
          ...p,
          selfieBase64,
          analysisData,
          lastUsedTime: 'Active Now',
          avatarUrl: selfieBase64.startsWith('data:') ? selfieBase64 : p.avatarUrl
        };
        return updatedProfile;
      }
      return p;
    });

    if (updatedProfile) {
      // Save on backend dynamically
      try {
        await axios.put(`${BACKEND_BASE_URL}/homepage/profiles/${activeProfileId}`, updatedProfile);
      } catch (error) {
        console.warn("Failed to update profile selfie on backend, updating locally only.", error);
      }
    }

    set({ profiles: updatedProfiles });

    // Synchronize with existing analysis store
    useAnalysisStore.setState({
      userSelfieBase64: selfieBase64,
      currentAnalysis: analysisData
    });
  }
}));

// Initialize the initial active profile state in the analysisStore immediately upon load
const initialProfile = useProfileStore.getState().profiles.find(p => p.id === 'sasi');
if (initialProfile) {
  useAnalysisStore.setState({
    userSelfieBase64: initialProfile.selfieBase64,
    currentAnalysis: initialProfile.analysisData
  });
}
