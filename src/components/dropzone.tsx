import React, { memo, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type DropZoneProps = {
    acceptedFileTypes?: string[];
    onFilesAccepted: (files: File[]) => void;
};

const DropZone: React.FC<DropZoneProps> = ({
    acceptedFileTypes = ["text/plain"],
    onFilesAccepted,
}: DropZoneProps): React.JSX.Element => {
    const { t } = useTranslation();

    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnter = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!e.relatedTarget) {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback(
        (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();

            setIsDragging(false);

            if (!e.dataTransfer) {
                return;
            }

            const { files } = e.dataTransfer;

            if (!files.length) {
                return;
            }

            const acceptedFiles: File[] = [];

            for (const file of files) {
                if (acceptedFileTypes.includes(file.type)) {
                    acceptedFiles.push(file);
                }
            }

            onFilesAccepted(acceptedFiles);
        },
        [acceptedFileTypes, onFilesAccepted]
    );

    useEffect(() => {
        window.addEventListener("dragover", handleDragEnter);
        window.addEventListener("dragenter", handleDragEnter);
        window.addEventListener("dragleave", handleDragLeave);
        window.addEventListener("drop", handleDrop);

        return () => {
            window.removeEventListener("dragover", handleDragEnter);
            window.removeEventListener("dragenter", handleDragEnter);
            window.removeEventListener("dragleave", handleDragLeave);
            window.removeEventListener("drop", handleDrop);
        };
    }, [handleDragEnter, handleDragLeave, handleDrop]);

    return (
        <>
            {isDragging && (
                <div className="bg-background text-foreground border-foreground absolute top-0 right-0 bottom-0 left-0 z-[9999] flex items-center justify-center border-2 border-dashed">
                    {t("dropFiles")}
                </div>
            )}
        </>
    );
};

export default memo(DropZone);
