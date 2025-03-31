import { getCurrentWindow } from "@tauri-apps/api/window";
import { platform } from "@tauri-apps/plugin-os";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Split string based on user's platform
 */
export function splitString(str: string): string[] {
    let splitted: string[] = [];

    switch (platform()) {
        case "windows":
            splitted = str.split("\\");
            break;
        case "linux":
        case "macos":
            splitted = str.split("/");
            break;
        default:
            console.error("not implmeneted");
            getCurrentWindow().destroy();
    }

    return splitted;
}

/**
 * djb2 hash algorithm for file path
 */
export function hash(str: string): string {
    let hash = 564485; // try google it

    for (let i = 0; i < str.length; i++) {
        hash = (hash * 33) ^ str.charCodeAt(i);
    }

    return (hash >>> 0).toString();
}
