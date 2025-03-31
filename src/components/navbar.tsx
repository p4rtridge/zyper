import { open } from "@tauri-apps/plugin-dialog";
import { CirclePlus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ACCEPTED_FILE_EXTS } from "@/consts";
import cache from "@/lib/cache";
import { getFileContent } from "@/lib/core";
import { hash } from "@/lib/utils";
import useTranslationStore from "@/stores/translation";

const NavBar: React.FC = () => {
    const { t } = useTranslation();
    const addTranslation = useTranslationStore((state) => state.addTranslation);

    return (
        <>
            <button
                onClick={() => {
                    open({
                        multiple: true,
                        directory: false,
                        filters: [
                            {
                                name: t("dialogName"),
                                extensions: ACCEPTED_FILE_EXTS,
                            },
                        ],
                    }).then((filePaths) => {
                        if (!filePaths || !filePaths.length) {
                            return;
                        }

                        filePaths.forEach(async (path) => {
                            const contentBuf = await getFileContent(path);
                            if (!contentBuf) {
                                return;
                            }

                            const hashed = hash(path);

                            cache.set(hashed, contentBuf);

                            addTranslation({ hash: hashed, path });
                        });
                    });
                }}>
                <CirclePlus className="text-destructive h-5 w-5" />
            </button>
        </>
    );
};

export default NavBar;
