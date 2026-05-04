import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LocationState {
  coords: [number, number] | null;
  locationName: string;
  setCoords: (coords: [number, number]) => void;
  setLocationName: (name: string) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      coords: null,
      locationName: 'Jakarta Selatan',
      setCoords: (coords) => set({ coords }),
      setLocationName: (locationName) => set({ locationName }),
    }),
    {
      name: 'petshop-location-storage',
    },
  ),
);
