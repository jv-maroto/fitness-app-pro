import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WeightEntry, UserProfile, GoalType } from '../types';
import { v4 as uuidv4 } from '../utils/uuid';

interface WeightStore {
  entries: WeightEntry[];
  profile: UserProfile | null;

  // Profile actions
  createProfile: (data: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt' | 'currentWeight'>) => void;
  updateProfile: (data: Partial<UserProfile>) => void;

  // Entry actions
  addEntry: (entry: Omit<WeightEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEntry: (id: string, data: Partial<WeightEntry>) => void;
  deleteEntry: (id: string) => void;

  // Bulk operations
  importEntries: (entries: WeightEntry[]) => void;
  clearAllData: () => void;
}

export const useWeightStore = create<WeightStore>()(
  persist(
    (set) => ({
      entries: [],
      profile: null,

      createProfile: (data) => set((state) => {
        const profile: UserProfile = {
          ...data,
          id: uuidv4(),
          currentWeight: data.startWeight,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return { profile };
      }),

      updateProfile: (data) => set((state) => {
        if (!state.profile) return state;
        return {
          profile: {
            ...state.profile,
            ...data,
            updatedAt: new Date(),
          }
        };
      }),

      addEntry: (entryData) => set((state) => {
        const entry: WeightEntry = {
          ...entryData,
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const newEntries = [...state.entries, entry].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Update current weight in profile
        const latestWeight = newEntries[0].weight;
        const updatedProfile = state.profile ? {
          ...state.profile,
          currentWeight: latestWeight,
          updatedAt: new Date(),
        } : null;

        return {
          entries: newEntries,
          profile: updatedProfile,
        };
      }),

      updateEntry: (id, data) => set((state) => ({
        entries: state.entries.map(entry =>
          entry.id === id
            ? { ...entry, ...data, updatedAt: new Date() }
            : entry
        ),
      })),

      deleteEntry: (id) => set((state) => ({
        entries: state.entries.filter(entry => entry.id !== id),
      })),

      importEntries: (entries) => set(() => ({
        entries: entries.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
      })),

      clearAllData: () => set(() => ({
        entries: [],
        profile: null,
      })),
    }),
    {
      name: 'weight-tracker-storage',
      version: 1,
    }
  )
);
