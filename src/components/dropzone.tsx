import { motion } from "motion/react";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useDropZone } from "@/hooks/dropzone";
import cache from "@/lib/cache";
import { getFileContent } from "@/lib/core";
import { hash } from "@/lib/utils";
import useTranslationStore from "@/stores/translation";

const DropZone: React.FC = (): React.JSX.Element => {
    const { t } = useTranslation();
    const { dragIn, drops } = useDropZone();
    const addTranslation = useTranslationStore((state) => state.addTranslation);

    useEffect(() => {
        if (!drops || !drops.paths.length) {
            return;
        }

        drops.paths.forEach(async (path) => {
            const contentBuf = await getFileContent(path);
            if (!contentBuf) {
                return;
            }

            const hashed = hash(path);

            cache.set(hashed, contentBuf);

            addTranslation({ hash: hashed, path });
        });
    }, [drops, addTranslation]);

    return (
        <>
            {dragIn && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    className="bg-background text-foreground border-foreground absolute top-0 right-0 bottom-0 left-0 z-[9999] flex items-center justify-center border-2 border-dashed">
                    {t("dropFiles")}
                </motion.div>
            )}
        </>
    );
};

export default DropZone;
