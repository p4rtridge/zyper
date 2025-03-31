import { listen } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";

const useResize = () => {
    const [size, setSize] = useState<TauriResizeEvent>({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        const resizedUnlisten = listen<TauriResizeEvent>(
            "tauri://resize",
            () => {
                setSize({
                    width: window.innerWidth,
                    height: window.innerHeight,
                });
            }
        );

        return () => {
            resizedUnlisten.then((unlistenFn) => {
                unlistenFn();
            });
        };
    }, []);

    return { size };
};

export { useResize };
