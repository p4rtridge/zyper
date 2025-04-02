import { invoke } from "@tauri-apps/api/core";
import { create } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";

type Settings = {
    cache_cap: number;
    cache_ttl: number;
    detect_pagination: string;
};

type SettingsStore = {
    settings: Settings | null;
    loading: boolean;
    fetchSettings: () => Promise<void>;
    updateSettings: (settings: Settings) => Promise<void>;
};

const translationPersistOptions: PersistOptions<SettingsStore> = {
    name: "settings_store",
};

const useSettingsStore = create(
    persist<SettingsStore>(
        (set) => ({
            settings: null,
            loading: false,

            fetchSettings: async () => {
                const settings = await invoke<Settings>("get_settings");

                set({ settings });
            },

            updateSettings: async (settings: Settings) => {
                set({ loading: true });

                try {
                    await invoke("set_settings", { payload: settings });
                } catch (error) {
                    console.log(error);
                } finally {
                    set({ loading: false });
                }
            },
        }),
        translationPersistOptions
    )
);

export default useSettingsStore;
