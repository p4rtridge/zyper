import { CircleHelp } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import useSettingsStore from "@/stores/settings";

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

    useEffect(() => {
        if (isLoading) {
            document.body.style.cursor = "wait";
        } else {
            document.body.style.cursor = "default";
        }
    }, [isLoading]);

    if (!settings) {
        return null;
    }

    return (
        <TooltipProvider>
            <section className="h-dvh w-dvw px-2">
                <div className="grid grid-cols-[1fr_0.3fr] items-center justify-between border-t-2 py-3">
                    <div className="flex items-center gap-x-0.5">
                        <p>{t("settings.theme")}</p>
                        <Tooltip>
                            <TooltipTrigger>
                                <CircleHelp className="h-4 w-4" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-dvw break-words">
                                {t("settings.themeHint")}
                            </TooltipContent>
                        </Tooltip>
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

                <div className="grid grid-cols-[1fr_0.3fr] items-center justify-between border-t-2 py-3">
                    <div className="flex items-center gap-x-0.5">
                        <p>{t("settings.language")}</p>
                        <Tooltip>
                            <TooltipTrigger>
                                <CircleHelp className="h-4 w-4" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-dvw break-words">
                                {t("settings.languageHint")}
                            </TooltipContent>
                        </Tooltip>
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

                <div className="grid grid-cols-[1fr_0.3fr] items-center justify-between border-t-2 py-3">
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

                            const newSettings = {
                                cache_cap: e.target.valueAsNumber,
                                cache_ttl: settings.cache_ttl,
                                detect_pagination: settings.detect_pagination,
                            };

                            if (newSettings !== settings) {
                                updateSettings(newSettings);
                            }
                        }}
                    />
                </div>

                <div className="grid grid-cols-[1fr_0.3fr] items-center justify-between border-t-2 py-3">
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

                            const newSettings = {
                                cache_cap: settings.cache_cap,
                                cache_ttl: e.target.valueAsNumber,
                                detect_pagination: settings.detect_pagination,
                            };

                            if (newSettings !== settings) {
                                updateSettings(newSettings);
                            }
                        }}
                    />
                </div>

                <div className="grid grid-cols-[1fr_0.3fr] items-center justify-between border-t-2 py-3">
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

                            const newSettings = {
                                cache_cap: settings.cache_cap,
                                cache_ttl: settings.cache_ttl,
                                detect_pagination: e.target.value,
                            };

                            if (newSettings !== settings) {
                                updateSettings(newSettings);
                            }
                        }}
                    />
                </div>
            </section>
        </TooltipProvider>
    );
};

export default Settings;
