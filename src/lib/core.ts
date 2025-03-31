import { invoke } from "@tauri-apps/api/core";
import { cache } from "react";

import { ACCEPTED_FILE_EXTS } from "@/consts";

import { splitString } from "./utils";

const decoder = new TextDecoder("utf-8");

const getFileContent = cache((filePath: string): Promise<string> | null => {
    const splittedStr = splitString(filePath);

    const fileName = splittedStr[splittedStr.length - 1];
    const fileExt = fileName.split(".").at(1);

    if (!fileExt || !ACCEPTED_FILE_EXTS.includes(fileExt)) {
        return null;
    }

    return invoke<ArrayBuffer>("read_file", { path: filePath }).then(
        (contentBuf) => decoder.decode(contentBuf)
    );
});

export { getFileContent };
