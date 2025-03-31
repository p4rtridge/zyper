import { create } from "zustand";
import {
    createJSONStorage,
    persist,
    PersistOptions,
    StateStorage,
} from "zustand/middleware";

type TranslationState = { hash: string; path: string };

type TranslationStore = {
    translations: TranslationState[];
    addTranslation: (translation: TranslationState) => void;
    removeTranslation: (hash: string) => void;
};

const persistentStorage: StateStorage = {
    getItem: (key: string): string => {
        return JSON.parse(localStorage.getItem(key) as string);
    },
    setItem: (key: string, newValue: string): void => {
        localStorage.setItem(key, JSON.stringify(newValue));
    },
    removeItem: (key: string): void => {},
};

const translationPersistOptions: PersistOptions<TranslationStore> = {
    name: "translation_store",
    storage: createJSONStorage<TranslationStore>(() => persistentStorage),
};

const useTranslationStore = create(
    persist<TranslationStore>(
        (set) => ({
            translations: [],
            addTranslation: (translation: TranslationState) =>
                set((state) => {
                    if (
                        !state.translations.some(
                            (trans) => trans.hash == translation.hash
                        )
                    ) {
                        return {
                            translations: [...state.translations, translation],
                        };
                    }

                    return { translations: state.translations };
                }),
            removeTranslation: (hash: string) =>
                set((state) => ({
                    translations: state.translations.filter(
                        (storedHash) => storedHash.hash !== hash
                    ),
                })),
        }),
        translationPersistOptions
    )
);

export default useTranslationStore;
