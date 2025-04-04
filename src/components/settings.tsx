import { CircleHelp, Minus, Plus } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import useSettingsStore, { Settings as SettingsType } from "@/stores/settings";

import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip";
import { Button } from "./ui/button";

function generateNewSettings<T extends Partial<SettingsType>>(
    settings: SettingsType,
    updates: T
): SettingsType {
    return { ...settings, ...updates };
}

const Settings: React.FC = () => {
    const { theme, themes, setTheme } = useTheme();
    const { t, i18n } = useTranslation();

    const [settings, isLoading, updateSettings] = useSettingsStore(
        useShallow((state) => [
            state.settings,
            state.loading,
            state.updateSettings,
        ])
    );
    const [lineDetectPrefix, setLineDetectPrefix] = useState<string>("");
    const [lineDetectColor, setLineDetectColor] = useState<string>("#000000");
    const [nextLineShortcut, setNextLineShortcut] = useState<string>("");
    const [prevLineShortcut, setPrevLineShortcut] = useState<string>("");

    useEffect(() => {
        if (isLoading) {
            document.body.style.cursor = "wait";
        } else {
            document.body.style.cursor = "default";
        }
    }, [isLoading]);

    useEffect(() => {
        if (!settings) {
            return;
        }

        setNextLineShortcut(settings.next_line_key.join("+"));
        setPrevLineShortcut(settings.prev_line_key.join("+"));
    }, [settings]);

    const sendUpdateFut = async (settings: SettingsType) => {
        try {
            await updateSettings(settings);
        } catch (error) {
            const { message } = await import("@tauri-apps/plugin-dialog");

            if (typeof error === "string") {
                await message(t(error), { kind: "error" });
            }

            console.error("Uncaught error: ", error);
        }
    };

    const nextLineKeyDownHandler = (e: React.KeyboardEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const keys = [];

        if (e.code == "ControlLeft") keys.push("ControlLeft");
        if (e.code == "ShiftLeft") keys.push("ShiftLeft");
        if (e.code == "Alt") keys.push("Alt");
        if (e.code == "Meta") keys.push("Meta");

        if (!["ControlLeft", "ShiftLeft", "Alt", "Meta"].includes(e.code)) {
            keys.push(e.code);
        }

        setNextLineShortcut(keys.join("+"));
    };

    const prevLineKeyDownHandler = (e: React.KeyboardEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const keys = [];

        if (e.code == "ControlLeft") keys.push("ControlLeft");
        if (e.code == "ShiftLeft") keys.push("ShiftLeft");
        if (e.code == "Alt") keys.push("Alt");
        if (e.code == "Meta") keys.push("Meta");

        if (!["ControlLeft", "ShiftLeft", "Alt", "Meta"].includes(e.code)) {
            keys.push(e.code);
        }

        setPrevLineShortcut(keys.join("+"));
    };

    if (!settings) {
        return null;
    }

    const lineDetectFormHandler = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!lineDetectPrefix || !lineDetectColor) {
            return;
        }

        const special_line = settings.special_line ?? {};
        special_line[lineDetectPrefix] = lineDetectColor;

        const newSettings = generateNewSettings(settings, { special_line });

        if (newSettings !== settings) {
            sendUpdateFut(newSettings).then(async () => {
                const { invoke } = await import("@tauri-apps/api/core");

                setLineDetectPrefix("");
                setLineDetectColor("#000000");

                invoke("flush_cache");
            });
        }
    };

    return (
        <TooltipProvider>
            <section className="scrollbar h-dvh w-dvw overflow-hidden overflow-y-scroll px-2">
                <div className="grid grid-cols-[1fr_0.4fr] items-center justify-between border-t-2 py-3">
                    <div className="flex items-center gap-x-0.5">
                        <p>{t("settings.theme")}</p>
                    </div>

                    <Select
                        defaultValue={theme}
                        onValueChange={(th) => setTheme(th)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("settings.theme")} />
                        </SelectTrigger>

                        <SelectContent>
                            {themes.map((th) => (
                                <SelectItem
                                    key={th}
                                    value={th}>
                                    {th}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-[1fr_0.4fr] items-center justify-between border-t-2 py-3">
                    <div className="flex items-center gap-x-0.5">
                        <p>{t("settings.language")}</p>
                    </div>

                    <Select
                        defaultValue={i18n.language}
                        onValueChange={(lng) => {
                            localStorage.setItem("language", lng);
                            i18n.changeLanguage(lng);
                        }}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("settings.language")} />
                        </SelectTrigger>

                        <SelectContent>
                            {[
                                ["en", "English"],
                                ["vi", "Vietnamese"],
                            ].map((lng) => (
                                <SelectItem
                                    key={lng[0]}
                                    value={lng[0]}>
                                    {lng[1]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-[1fr_0.4fr] items-center justify-between border-t-2 py-3">
                    <div className="flex items-center gap-x-0.5">
                        <p>{t("settings.cacheCap")}</p>
                        <Tooltip>
                            <TooltipTrigger>
                                <CircleHelp className="h-4 w-4" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-dvw break-words">
                                {t("settings.cacheCapHint")}
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    <Input
                        type="number"
                        className="w-full"
                        defaultValue={settings.cache_cap}
                        onBlur={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            const newSettings = generateNewSettings(settings, {
                                cache_cap: e.target.valueAsNumber,
                            });

                            if (newSettings !== settings) {
                                sendUpdateFut(newSettings).then(async () => {
                                    const { invoke } = await import(
                                        "@tauri-apps/api/core"
                                    );

                                    invoke("flush_cache");
                                });
                            }
                        }}
                    />
                </div>

                <div className="grid grid-cols-[1fr_0.4fr] items-center justify-between border-t-2 py-3">
                    <div className="flex items-center gap-x-0.5">
                        <p>{t("settings.cacheTtl")}</p>
                        <Tooltip>
                            <TooltipTrigger>
                                <CircleHelp className="h-4 w-4" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-dvw break-words">
                                {t("settings.cacheTtl")}
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    <Input
                        type="number"
                        className="w-full"
                        defaultValue={settings.cache_ttl}
                        onBlur={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            const newSettings = generateNewSettings(settings, {
                                cache_ttl: e.target.valueAsNumber,
                            });

                            if (newSettings !== settings) {
                                sendUpdateFut(newSettings);
                            }
                        }}
                    />
                </div>

                {/* here */}
                <div className="grid grid-cols-[1fr_0.4fr] items-center justify-between border-t-2 py-3">
                    <div className="flex items-center gap-x-0.5">
                        <p>{t("settings.interceptInput")}</p>
                        <Tooltip>
                            <TooltipTrigger>
                                <CircleHelp className="h-4 w-4" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-dvw break-words">
                                {t("settings.interceptInputHint")}
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    <div className="flex w-full justify-center">
                        <Checkbox
                            defaultChecked={settings.intercept_input}
                            onCheckedChange={(checked) => {
                                if (typeof checked === "boolean") {
                                    const newSettings = generateNewSettings(
                                        settings,
                                        { intercept_input: checked }
                                    );

                                    if (newSettings !== settings) {
                                        sendUpdateFut(newSettings);
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-[1fr_0.4fr] items-center justify-between border-t-2 py-3">
                    <div className="flex items-center gap-x-0.5">
                        <p>{t("settings.detectPagination")}</p>
                        <Tooltip>
                            <TooltipTrigger>
                                <CircleHelp className="h-4 w-4" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-dvw break-words">
                                {t("settings.detectPaginationHint")}
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    <Input
                        className="w-full"
                        defaultValue={settings.detect_pagination}
                        onBlur={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            const newSettings = generateNewSettings(settings, {
                                detect_pagination: e.target.value,
                            });

                            if (newSettings !== settings) {
                                sendUpdateFut(newSettings).then(async () => {
                                    const { invoke } = await import(
                                        "@tauri-apps/api/core"
                                    );

                                    invoke("flush_cache");
                                });
                            }
                        }}
                    />
                </div>

                <div className="grid grid-cols-[1fr_0.4fr] items-center justify-between border-t-2 py-3">
                    <div className="flex items-center gap-x-0.5">
                        <p>{t("settings.detectComment")}</p>
                        <Tooltip>
                            <TooltipTrigger>
                                <CircleHelp className="h-4 w-4" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-dvw break-words">
                                {t("settings.detectCommentHint")}
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    <Input
                        className="w-full"
                        defaultValue={settings.detect_comment ?? ""}
                        onBlur={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            const newSettings = generateNewSettings(settings, {
                                detect_comment: e.target.value ?? null,
                            });

                            if (newSettings !== settings) {
                                sendUpdateFut(newSettings).then(async () => {
                                    const { invoke } = await import(
                                        "@tauri-apps/api/core"
                                    );

                                    invoke("flush_cache");
                                });
                            }
                        }}
                    />
                </div>

                <div className="space-y-2.5 border-t-2 py-3">
                    <div className="flex items-center gap-x-0.5">
                        <p>{t("settings.lineDetect")}</p>
                        <Tooltip>
                            <TooltipTrigger>
                                <CircleHelp className="h-4 w-4" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-dvw break-words">
                                {t("settings.lineDetectHint")}
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    {!!settings.special_line && (
                        <div className="space-y-2.5">
                            {Object.entries(settings.special_line).map(
                                (line, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-end gap-x-4">
                                        <Button
                                            variant={"destructive"}
                                            className="hover:cursor-pointer"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();

                                                const special_line =
                                                    settings.special_line ?? {};
                                                delete special_line[line[0]];

                                                const newSettings =
                                                    generateNewSettings(
                                                        settings,
                                                        { special_line }
                                                    );

                                                if (newSettings !== settings) {
                                                    sendUpdateFut(newSettings);
                                                }
                                            }}>
                                            <Minus />
                                        </Button>
                                        <Input
                                            readOnly
                                            className="w-12"
                                            value={line[0]}
                                        />
                                        <Input
                                            disabled
                                            type="color"
                                            className="w-12"
                                            value={line[1]}
                                        />
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    <form
                        onSubmit={lineDetectFormHandler}
                        className="flex items-center justify-end gap-x-4">
                        <Button
                            type="submit"
                            variant={"outline"}
                            className="hover:cursor-pointer">
                            <Plus />
                        </Button>

                        <div className="flex items-center gap-x-4">
                            <Input
                                className="w-12"
                                value={lineDetectPrefix}
                                onChange={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();

                                    setLineDetectPrefix(e.target.value);
                                }}
                            />
                            <Input
                                type="color"
                                className="w-12"
                                value={lineDetectColor}
                                onChange={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();

                                    setLineDetectColor(e.target.value);
                                }}
                            />
                        </div>
                    </form>
                </div>

                <div className="grid grid-cols-[1fr_0.4fr] items-center justify-between border-t-2 py-3">
                    <div className="flex items-center gap-x-0.5">
                        <p>{t("settings.nextParagraphShortcut")}</p>
                    </div>

                    <Input
                        readOnly
                        className="w-full"
                        value={nextLineShortcut}
                        onKeyDown={nextLineKeyDownHandler}
                        onBlur={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            if (!nextLineShortcut) {
                                return;
                            }

                            const newSettings = generateNewSettings(settings, {
                                next_line_key: nextLineShortcut.split("+"),
                            });

                            if (newSettings !== settings) {
                                sendUpdateFut(newSettings);
                            }
                        }}
                    />
                </div>

                <div className="grid grid-cols-[1fr_0.4fr] items-center justify-between border-t-2 py-3">
                    <div className="flex items-center gap-x-0.5">
                        <p>{t("settings.prevParagraphShortcut")}</p>
                    </div>

                    <Input
                        readOnly
                        className="w-full"
                        value={prevLineShortcut}
                        onKeyDown={prevLineKeyDownHandler}
                        onBlur={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            if (!prevLineShortcut) {
                                return;
                            }

                            const newSettings = generateNewSettings(settings, {
                                prev_line_key: prevLineShortcut.split("+"),
                            });

                            if (newSettings !== settings) {
                                sendUpdateFut(newSettings);
                            }
                        }}
                    />
                </div>
            </section>
        </TooltipProvider>
    );
};

export default Settings;
