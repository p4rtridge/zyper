import { CirclePlus, Pin, PinOff, Settings } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { ACCEPTED_FILE_EXTS } from "@/consts";
import { processFile } from "@/lib/core";
import useTranslationStore from "@/stores/translation";

const NavBar: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const addTranslation = useTranslationStore((state) => state.addTranslation);

    const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false);

    const addTranslationHandler = async () => {
        const { open } = await import("@tauri-apps/plugin-dialog");

        const filePaths = await open({
            multiple: true,
            directory: false,
            filters: [
                { name: t("dialogName"), extensions: ACCEPTED_FILE_EXTS },
            ],
        });
        if (!filePaths || !filePaths.length) {
            return;
        }

        filePaths.forEach(async (path, index, arr) => {
            const response = await processFile(path);
            if (!response) {
                return;
            }

            addTranslation({
                hash: response.hash,
                file_name: response.file_name,
                path,
            });

            if (index === arr.length - 1) {
                navigate(`/translations/${response.hash}`);
            }
        });
    };

    const setAlwaysOnTopHandler = async () => {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");

        try {
            const currentWindow = getCurrentWindow();
            const isAlwaysOnTop = await currentWindow.isAlwaysOnTop();

            await currentWindow.setAlwaysOnTop(!isAlwaysOnTop);
            setIsAlwaysOnTop(!isAlwaysOnTop);
        } catch (error) {
            console.error("Uncaught error: ", error);
        }
    };

    const openSettingsHanlder = async () => {
        const { invoke } = await import("@tauri-apps/api/core");
        const { message } = await import("@tauri-apps/plugin-dialog");

        try {
            await invoke("create_new_window");
        } catch (error) {
            if (typeof error === "string") {
                await message(t(error), { kind: "error" });
                return;
            }

            console.error("Uncaught error: ", error);
        }
    };

    return (
        <>
            <button
                onClick={setAlwaysOnTopHandler}
                className="text-card-foreground hover:cursor-pointer">
                {isAlwaysOnTop ? (
                    <PinOff className="h-5 w-5 lg:h-7 lg:w-7" />
                ) : (
                    <Pin className="h-5 w-5 lg:h-7 lg:w-7" />
                )}
            </button>

            <button
                onClick={openSettingsHanlder}
                className="text-card-foreground hover:cursor-pointer">
                <Settings className="h-5 w-5 lg:h-7 lg:w-7" />
            </button>

            <button
                onClick={addTranslationHandler}
                className="text-card-foreground hover:cursor-pointer">
                <CirclePlus className="h-5 w-5 lg:h-7 lg:w-7" />
            </button>
        </>
    );
};

export default NavBar;
