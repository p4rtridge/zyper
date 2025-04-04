import { motion } from "motion/react";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { useDropZone } from "@/hooks/dropzone";
import { processFile } from "@/lib/core";
import useTranslationStore from "@/stores/translation";

const DropZone: React.FC = (): React.JSX.Element => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { dragIn, drops } = useDropZone();
    const addTranslation = useTranslationStore((state) => state.addTranslation);

    useEffect(() => {
        if (!drops || !drops.paths.length) {
            return;
        }

        drops.paths.forEach(async (path, index, arr) => {
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
    }, [drops, addTranslation, navigate]);

    return (
        <>
            {dragIn && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-background text-foreground border-foreground absolute top-0 right-0 bottom-0 left-0 z-[9999] flex items-center justify-center border-2 border-dashed">
                    {t("dropFiles")}
                </motion.div>
            )}
        </>
    );
};

export default DropZone;
