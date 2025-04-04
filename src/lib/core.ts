import { invoke } from "@tauri-apps/api/core";
import { message } from "@tauri-apps/plugin-dialog";
import { cache } from "react";
import { useTranslation } from "react-i18next";

import { ACCEPTED_FILE_EXTS } from "@/consts";

import { splitString } from "./utils";

const decoder = new TextDecoder("utf-8");

const processFile = cache(async (path: string): Promise<Translation | null> => {
    try {
        const splittedStr = splitString(path);

        const fileName = splittedStr[splittedStr.length - 1];
        const fileExt = fileName.split(".").at(1);

        if (!fileExt || !ACCEPTED_FILE_EXTS.includes(fileExt)) {
            return null;
        }

        const buf = await invoke<ArrayBuffer>("process_file", { path });

        return JSON.parse(decoder.decode(buf)) as Translation;
    } catch (error) {
        if (typeof error === "string") {
            const { t } = useTranslation();

            await message(t(error), { kind: "error" });

            return null;
        }

        console.error("Uncaught error: ", error);

        return null;
    }
});

const getFile = cache(
    async (hash: string, path: string): Promise<ParsedTranslation[] | null> => {
        try {
            const buf = await invoke<ArrayBuffer>("get_file", { hash, path });

            return JSON.parse(decoder.decode(buf)) as ParsedTranslation[];
        } catch (error) {
            if (typeof error === "string") {
                const { t } = useTranslation();
                await message(t(error), { kind: "error" });

                return null;
            }

            console.error("Uncaught error: ", error);
            return null;
        }
    }
);

const writeToClipboardAndMacro = async (line: string) => {
    await invoke("send_key_events", { line });
};

export { processFile, getFile, writeToClipboardAndMacro };
