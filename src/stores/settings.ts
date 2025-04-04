import { invoke } from "@tauri-apps/api/core";
import { create } from "zustand";

export type Settings = {
    cache_cap: number;
    cache_ttl: number;
    detect_pagination: string;
    intercept_input: boolean;
    next_line_key: string[];
    prev_line_key: string[];
    detect_comment: string | null;
    special_line: { [key: string]: string } | null;
};

type SettingsStore = {
    settings: Settings | null;
    loading: boolean;
    fetchSettings: () => Promise<void>;
    updateSettings: (settings: Settings) => Promise<void | string>;
};

const useSettingsStore = create<SettingsStore>((set) => ({
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
            return error as string;
        } finally {
            set({ loading: false });
        }
    },
}));

export default useSettingsStore;
