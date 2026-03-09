import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAppStore } from '../store';
import { db } from './firebase';

export const syncToCloud = async (uid: string) => {
    try {
        const state = useAppStore.getState();
        const docRef = doc(db, 'users', uid);

        await setDoc(docRef, {
            history: state.history,
            settings: state.settings,
            customPouches: state.customPouches,
            lastSynced: new Date().toISOString()
        });

        return { success: true };
    } catch (error) {
        console.error("Error syncing to cloud", error);
        return { success: false, error };
    }
};

export const syncFromCloud = async (uid: string) => {
    try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const store = useAppStore.getState();

            if (data.history) store.clearHistory(); // Replace or merge depending on logic
            if (data.history) {
                // We push them backwards or directly set via update to avoid reverse loops,
                // For simplicity let's just use update settings mechanism
                useAppStore.setState({
                    history: data.history || [],
                    settings: data.settings || store.settings,
                    customPouches: data.customPouches || []
                });
            }
            return { success: true };
        } else {
            console.log("No data in cloud to restore.");
            return { success: true, empty: true };
        }
    } catch (error) {
        console.error("Error syncing from cloud", error);
        return { success: false, error };
    }
};
