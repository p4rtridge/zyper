import { CirclePlus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ACCEPTED_FILE_EXTS } from "@/consts";
import { processFile } from "@/lib/core";
import useTranslationStore from "@/stores/translation";

const NavBar: React.FC = () => {
    const { t } = useTranslation();
    const addTranslation = useTranslationStore((state) => state.addTranslation);

    const addTranslationHandler = async () => {
        const { open, message } = await import("@tauri-apps/plugin-dialog");

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

        filePaths.forEach(async (path) => {
            try {
                const response = await processFile(path);
                if (!response) {
                    return;
                }

                addTranslation({
                    hash: response.hash,
                    file_name: response.file_name,
                    path,
                });
            } catch (error) {
                if (typeof error === "string") {
                    await message(t(error), { kind: "error" });
                }

                console.error("Uncaught error: ", error);
            }
        });
    };

    return (
        <>
            <button
                onClick={addTranslationHandler}
                className="text-card-foreground hover:cursor-pointer">
                <CirclePlus className="h-5 w-5" />
            </button>
        </>
    );
};

export default NavBar;
