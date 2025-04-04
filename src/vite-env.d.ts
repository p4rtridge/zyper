/// <reference types="vite/client" />

declare global {
    type TranslationContent = {
        is_comment: boolean;
        color: string | null;
        text: string;
    };

    type ParsedTranslation = {
        page: string | null;
        index: number;
        content: TranslationContent;
    };

    type TauriDragEvent = {
        paths: string[];
        position: { x: number; y: number };
    };

    type TauriResizeEvent = { height: number; width: number };

    type Translation = { hash: string; file_name?: string };
}

export {};
