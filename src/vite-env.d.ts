/// <reference types="vite/client" />

declare global {
    type TauriDragEvent = {
        paths: string[];
        position: { x: number; y: number };
    };

    type TauriResizeEvent = { height: number; width: number };
}

export {};
