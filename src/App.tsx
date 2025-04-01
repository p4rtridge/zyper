import { CirclePlus } from "lucide-react";
import { AnimatePresence, motion, Variants } from "motion/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Layout from "./components/layout";
import { cn } from "./lib/utils";

const textOrder = [
    "greeting",
    "introduction1",
    "introduction2",
    "useless",
    "explain1",
    "explain2",
    "explain3",
    "guide1",
    "guide2",
];

function App() {
    const { t } = useTranslation();
    const [currentIdx, setCurrentIdx] = useState(0);
    const reachEnd = currentIdx === textOrder.length - 2;

    const variants: Variants = {
        enter: { opacity: 0 },
        show: { opacity: 1 },
        exit: { opacity: 0 },
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            const nextIndex = currentIdx + 1;

            if (nextIndex < textOrder.length - 1) {
                setCurrentIdx(nextIndex);
            }
        }, 5000);

        return () => {
            clearTimeout(timeout);
        };
    }, [currentIdx]);

    let renderedText;
    if (reachEnd) {
        renderedText = (
            <>
                <p>
                    {t(`homepage.${textOrder[currentIdx]}`)}
                    <CirclePlus className="mx-1 inline h-5 w-5" />
                </p>
                <p>{t(`homepage.${textOrder[currentIdx + 1]}`)}</p>
            </>
        );
    } else {
        renderedText = <>{t(`homepage.${textOrder[currentIdx]}`)}</>;
    }

    return (
        <Layout>
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIdx}
                    variants={variants}
                    initial="enter"
                    animate="show"
                    exit="exit"
                    transition={{ duration: 0.5 }}
                    className={cn(
                        "flex h-dvh items-center justify-center p-1.5 text-center",
                        reachEnd && "flex-col gap-y-2"
                    )}>
                    {renderedText}
                </motion.div>
            </AnimatePresence>
        </Layout>
    );
}

export default App;
