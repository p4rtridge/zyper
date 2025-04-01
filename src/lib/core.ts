import { invoke } from "@tauri-apps/api/core";
import { cache } from "react";

import { ACCEPTED_FILE_EXTS } from "@/consts";

import { splitString } from "./utils";

const decoder = new TextDecoder("utf-8");

const processFile = cache((path: string): Promise<Translation> | null => {
    const splittedStr = splitString(path);

    const fileName = splittedStr[splittedStr.length - 1];
    const fileExt = fileName.split(".").at(1);

    if (!fileExt || !ACCEPTED_FILE_EXTS.includes(fileExt)) {
        return null;
    }

    return invoke<ArrayBuffer>("process_file", { path }).then((buf) => {
        const decoded = JSON.parse(decoder.decode(buf)) as Translation;

        return decoded;
    });
});

export { processFile };
