import { listen } from "@tauri-apps/api/event";
import { useEffect } from "react";

export enum TriggerEvent {
    NextLine = "NextLine",
    PrevLine = "PrevLine",
}

const useTrigger = (callback: (event: TriggerEvent) => void) => {
    useEffect(() => {
        const unlisten = listen<TriggerEvent>("key_trigger", (event) => {
            callback(event.payload);
        });

        return () => {
            unlisten.then((unlistenFn) => unlistenFn());
        };
    }, [callback]);
};

export { useTrigger };
