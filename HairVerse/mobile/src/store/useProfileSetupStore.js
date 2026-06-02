import { create } from 'zustand';

const initialData = {
  gender: '',
  age: '',
  country: '',
  hairLength: '',
  hairType: '',
  hairColor: '',
  hairConcerns: [],
  preferredStyles: [],
  goals: [],
  beardStatus: '',
  beardPreference: '',
};

export const useProfileSetupStore = create((set, get) => ({
  data: initialData,
  currentStep: 1,
  totalSteps: 5,

  updateData: (fields) =>
    set((state) => ({
      data: { ...state.data, ...fields },
    })),

  nextStep: () => {
    const { currentStep, data } = get();
    // Skip Step 5 if Female
    if (currentStep === 4 && data.gender === 'Female') {
      // Logic for skipping beard step or marking complete
      // If female, step 5 is skipped, so next step after 4 is completion.
      return;
    }
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, state.totalSteps),
    }));
  },

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 1),
    })),

  reset: () => set({ data: initialData, currentStep: 1 }),

  isValidCurrentStep: () => {
    const { currentStep, data } = get();
    switch (currentStep) {
      case 1:
        return !!data.gender && !!data.age;
      case 2:
        // No explicitly required fields mentioned, but good practice
        return true;
      case 3:
        // Multi-select, can be empty
        return true;
      case 4:
        // Multi-select, can be empty
        return true;
      case 5:
        return true;
      default:
        return true;
    }
  },
}));
