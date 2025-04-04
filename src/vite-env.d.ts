/// <reference types="vite/client" />

declare global {
    type ParsedTranslation = {
        page: string | null;
        index: number;
        content: string;
    };

    type TauriDragEvent = {
        paths: string[];
        position: { x: number; y: number };
    };

    type TauriResizeEvent = { height: number; width: number };

    type Translation = { hash: string; file_name?: string };
}

export {};
