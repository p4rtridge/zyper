import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { redirect, useLoaderData } from "react-router";

import Layout from "./components/layout";
import { TriggerEvent, useTrigger } from "./hooks/trigger";
import { getFile, writeToClipboardAndMacro } from "./lib/core";
import { cn } from "./lib/utils";
import useSettingsStore from "./stores/settings";
import useTranslationStore from "./stores/translation";

const getKey = (index: number) => {
    return `paragraph_${index}`;
};

const Translation: React.FC = () => {
    const { translationId } = useLoaderData();
    const { t } = useTranslation();

    const targetTranslation = useTranslationStore((state) =>
        state.getTranslation(translationId)
    );
    const settings = useSettingsStore((state) => state.settings);

    const lineRefs = useRef<{ [key: number]: HTMLTableRowElement | null }>({});

    const [content, setContent] = useState<ParsedTranslation[] | null>(null);
    const [current, setCurrent] = useState<number | null>(null);

    useTrigger((event) => {
        // hah, javascript
        if ((typeof current === "object" && current === null) || !content) {
            return;
        }

        let currentContent = content[current].content;

        writeToClipboardAndMacro(currentContent)
            .then(() => {
                let nextCurrent = null;

                let skip = currentContent.is_comment ? 2 : 1;

                if (event === TriggerEvent.NextLine) {
                    const next = current + skip;

                    if (next < content.length) {
                        nextCurrent = next;
                        setCurrent(next);
                    }
                }

                if (event === TriggerEvent.PrevLine) {
                    const prev = current - skip;

                    if (prev >= 0) {
                        nextCurrent = prev;
                        setCurrent(prev);
                    }
                }

                if (nextCurrent) {
                    lineRefs.current[nextCurrent]?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                }
            })
            .catch(async () => {
                const { message } = await import("@tauri-apps/plugin-dialog");

                await message(t("macroError"), { kind: "error" });
            });
    });

    useEffect(() => {
        if (!targetTranslation || !settings?.detect_pagination) {
            redirect("/");

            return;
        }

        localStorage.setItem("previous_session", targetTranslation.hash);

        getFile(targetTranslation.hash, targetTranslation.path).then(
            (content) => {
                if (!content) {
                    return;
                }

                setContent(content);
                setCurrent(0);
            }
        );
    }, [settings?.detect_pagination, targetTranslation]);

    const changeParagraphHandler = (
        e: React.MouseEvent<HTMLElement>,
        index: number
    ) => {
        e.preventDefault();
        e.stopPropagation();

        setCurrent(index);
    };

    if (!content) {
        return <Layout />;
    }

    return (
        <Layout>
            <article className="scrollbar h-dvh overflow-x-hidden overflow-y-scroll text-sm">
                <table className="table-fixed text-xs md:text-sm [&_tr>td:first-child]:text-end [&_tr>td:first-child]:align-top">
                    <motion.tbody
                        variants={{
                            hidden: { opacity: 0 },
                            show: {
                                opacity: 1,
                                transition: { staggerChildren: 0.02 },
                            },
                        }}
                        initial="hidden"
                        animate="show">
                        {content.map((line, index) => (
                            <motion.tr
                                key={getKey(index)}
                                ref={(ref) => {
                                    lineRefs.current[index] = ref;
                                }}
                                variants={{
                                    hidden: { opacity: 0, translateX: -999 },
                                    show: { opacity: 1, translateX: 0 },
                                }}
                                transition={{ type: "tween" }}>
                                {line.content.is_comment ? (
                                    <td
                                        className={cn(
                                            "comment-line-xs max-w-11 truncate border-r-[1px] pr-1 !align-middle hover:cursor-default md:max-w-13 md:border-r-2",
                                            current === index
                                                ? "opacity-100"
                                                : "opacity-30"
                                        )}>
                                        {t("commentLabel")}
                                    </td>
                                ) : (
                                    <td
                                        className={cn(
                                            "max-w-11 truncate border-r-[1px] px-1 hover:cursor-default md:max-w-13 md:border-r-2",
                                            current === index
                                                ? "opacity-100"
                                                : "opacity-30"
                                        )}
                                        onClick={(e) =>
                                            changeParagraphHandler(e, index)
                                        }>
                                        {line.page ?? "??"}:{line.index}
                                    </td>
                                )}
                                <td className="w-full pb-1.5">
                                    <p
                                        onClick={(e) =>
                                            changeParagraphHandler(e, index)
                                        }
                                        className={cn(
                                            "pl-1 hover:cursor-pointer",
                                            current === index
                                                ? "bg-card"
                                                : "hover:bg-input/50",
                                            line.content.is_comment &&
                                                "text-foreground/70"
                                        )}
                                        style={{
                                            backgroundColor: `${line.content.color}`,
                                        }}>
                                        {line.content.text}
                                    </p>
                                </td>
                            </motion.tr>
                        ))}
                    </motion.tbody>
                </table>
            </article>
        </Layout>
    );
};

export default Translation;
