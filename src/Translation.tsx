import { motion } from "motion/react";
import { Fragment, useEffect, useState } from "react";
import { redirect, useLoaderData } from "react-router";

import Layout from "./components/layout";
import { getFile, parseTranslation } from "./lib/core";
import { cn } from "./lib/utils";
import useSettingsStore from "./stores/settings";
import useTranslationStore from "./stores/translation";

const Translation: React.FC = () => {
    const { translationId } = useLoaderData();

    const targetTranslation = useTranslationStore((state) =>
        state.getTranslation(translationId)
    );
    const settings = useSettingsStore((state) => state.settings);

    const [content, setContent] = useState<string | null>(null);
    const [current, setCurrent] = useState<string | null>(null);

    useEffect(() => {
        if (!targetTranslation) {
            redirect("/");

            return;
        }

        localStorage.setItem("previous_session", targetTranslation.hash);

        getFile(targetTranslation.hash, targetTranslation.path).then(
            (content) => setContent(content)
        );
    }, [targetTranslation]);

    if (!content || !settings) {
        return <Layout />;
    }

    return (
        <Layout>
            <motion.article
                variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
                }}
                initial="hidden"
                animate="show"
                className="scrollbar h-dvh overflow-x-hidden overflow-y-scroll text-sm">
                {parseTranslation(content, settings.detect_pagination).map(
                    ([page, paragraphs], index) => (
                        <Fragment key={`page-${page}-${index}`}>
                            <motion.div
                                variants={{
                                    hidden: { opacity: 0.5, translateX: -999 },
                                    show: { opacity: 1, translateX: 0 },
                                }}
                                transition={{ type: "tween" }}>
                                {(paragraphs as string[]).map(
                                    (paragraph, idx, arr) => (
                                        <div
                                            key={`paragraph-${idx}`}
                                            className={cn(
                                                "grid grid-cols-[40px_1fr] items-start transition-colors hover:cursor-pointer",
                                                current == `${index}:${idx}`
                                                    ? "bg-muted"
                                                    : "hover:bg-input/50"
                                            )}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();

                                                setCurrent(`${index}:${idx}`);
                                            }}>
                                            <p
                                                className={cn(
                                                    "text-center opacity-0",
                                                    current ===
                                                        `${index}:${idx}` &&
                                                        "opacity-100"
                                                )}>
                                                {page}:{idx + 1}
                                            </p>
                                            <p
                                                className={cn(
                                                    "border-muted border-l-[1px] py-0.5 pl-1",
                                                    idx === arr.length - 1 &&
                                                        "border-b-[1px]"
                                                )}>
                                                {paragraph}
                                            </p>
                                        </div>
                                    )
                                )}
                            </motion.div>
                        </Fragment>
                    )
                )}
            </motion.article>
        </Layout>
    );
};

export default Translation;
