import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface PouchEntry {
    id: string;
    brand: string;
    name: string;
    mg: number;
    timestamp: string;
    localDate: string;
}

export interface CustomPouch {
    id: string;
    b: string;
    n: string;
    mg: number;
    isCustom: boolean;
}

interface AppState {
    history: PouchEntry[];
    settings: {
        currency: string;
        packPrice: number;
        pouchesPerPack: number;
        dailyLimit: number;
        goal: 'track' | 'quit';
        strategy?: 'smooth' | 'weekly' | 'cutoff';
        targetDate?: string;
        createdAt: number;
        onboarded?: boolean;
    };
    selection: any | null;
    customPouches: CustomPouch[];
    theme: 'light' | 'dark';

    addEntry: (entry: PouchEntry) => void;
    removeEntry: (id: string) => void;
    updateSettings: (newSettings: Partial<AppState['settings']>) => void;
    addCustomPouch: (pouch: CustomPouch) => void;
    setSelection: (selection: any) => void;
    setTheme: (theme: 'light' | 'dark') => void;
    clearHistory: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            history: [],
            settings: {
                currency: 'CZK',
                packPrice: 150,
                pouchesPerPack: 20,
                dailyLimit: 10,
                goal: 'track',
                createdAt: Date.now(),
            },
            selection: { b: 'Velo', n: 'Mint', mg: 10 },
            customPouches: [],
            theme: 'dark',

            addEntry: (entry) =>
                set((state) => ({ history: [entry, ...state.history] })),
            removeEntry: (id) =>
                set((state) => ({ history: state.history.filter((h) => h.id !== id) })),
            updateSettings: (newSettings) =>
                set((state) => ({ settings: { ...state.settings, ...newSettings } })),
            addCustomPouch: (pouch) =>
                set((state) => ({ customPouches: [pouch, ...state.customPouches] })),
            setSelection: (selection) => set({ selection }),
            setTheme: (theme) => set({ theme }),
            clearHistory: () => set({ history: [] }),
        }),
        {
            name: 'pouchlog-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
