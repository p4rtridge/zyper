import { invoke } from "@tauri-apps/api/core";
import { create } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";

type TranslationState = { hash: string; file_name?: string; path: string };

type TranslationStore = {
    translations: TranslationState[];
    addTranslation: (translation: TranslationState) => void;
    getTranslation: (hash: string) => TranslationState | null;
    getCurrentTranslation: () => TranslationState | null;
    removeTranslation: (hash: string) => void;
};

const translationPersistOptions: PersistOptions<TranslationStore> = {
    name: "translation_store",
};

const useTranslationStore = create(
    persist<TranslationStore>(
        (set, get) => ({
            translations: [],

            addTranslation: (translation: TranslationState) =>
                set((state) => {
                    const exists = state.translations.some(
                        (trans) => trans.hash == translation.hash
                    );

                    if (exists) {
                        return state;
                    }

                    return {
                        translations: [translation, ...state.translations],
                    };
                }),

            getTranslation: (hash: string): TranslationState | null => {
                const translation = get().translations.find(
                    (translation) => translation.hash === hash
                );

                if (!translation) {
                    return null;
                }

                return translation;
            },

            getCurrentTranslation: (): TranslationState | null => {
                const url = new URL(location.href);
                const splittedPath = url.pathname.split("/");

                const currentTranslation =
                    get().translations.find(
                        (translation) =>
                            translation.hash ==
                            splittedPath[splittedPath.length - 1]
                    ) ?? null;

                return currentTranslation;
            },

            removeTranslation: (hash: string) => {
                invoke("remove_file", { hash });

                set((state) => ({
                    translations: state.translations.filter(
                        (storedHash) => storedHash.hash !== hash
                    ),
                }));
            },
        }),
        translationPersistOptions
    )
);

export default useTranslationStore;
