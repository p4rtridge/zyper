import { listen } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";

const useDropZone = () => {
    const [dragIn, setDragIn] = useState(false);
    const [drops, setDrops] = useState<Pick<TauriDragEvent, "paths"> | null>(
        null
    );

    useEffect(() => {
        const dragOverUnlisten = listen<TauriDragEvent>(
            "tauri://drag-over",
            () => {
                setDragIn(true);
            }
        );
        const dragLeaveUnlisten = listen<TauriDragEvent>(
            "tauri://drag-leave",
            () => {
                setDragIn(false);
            }
        );

        const dragDropUnlisten = listen<TauriDragEvent>(
            "tauri://drag-drop",
            (e) => {
                setDragIn(false);
                setDrops(e.payload);
            }
        );

        return () => {
            dragOverUnlisten.then((unlistenFn) => {
                unlistenFn();
            });

            dragLeaveUnlisten.then((unlistenFn) => {
                unlistenFn();
            });

            dragDropUnlisten.then((unlistenFn) => {
                unlistenFn();
            });
        };
    }, []);

    return { dragIn, drops };
};

export { useDropZone };
