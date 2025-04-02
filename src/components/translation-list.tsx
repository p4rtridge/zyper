import { X } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { useShallow } from "zustand/react/shallow";

import { cn } from "@/lib/utils";
import useTranslationStore from "@/stores/translation";

type TranslationListProps = { isCollapsed: boolean };

const TranslationList: React.FC<TranslationListProps> = ({
    isCollapsed,
}: TranslationListProps) => {
    const [translations, currentTranslation, removeTranslation] =
        useTranslationStore(
            useShallow((state) => [
                state.translations,
                state.getCurrentTranslation,
                state.removeTranslation,
            ])
        );

    const removeTranslationHandler = (
        e: React.MouseEvent<HTMLButtonElement>,
        hash: string
    ) => {
        e.stopPropagation();

        removeTranslation(hash);
    };

    return (
        <motion.ul
            variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
            initial="hidden"
            animate="show"
            className="scrollbar m-2 mx-1 grow space-y-2 overflow-hidden overflow-y-scroll">
            {translations.map((translation) => (
                <motion.li
                    key={translation.hash}
                    variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
                    className={cn(
                        "bg-card flex items-center gap-x-1 rounded-sm transition-colors duration-200",
                        currentTranslation()?.hash == translation.hash
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-ring/25 hover:text-foreground"
                    )}>
                    <Link
                        to={`/translations/${translation.hash}`}
                        className={cn(
                            "block w-full overflow-hidden p-1 py-2 text-xs",
                            isCollapsed && "p-2.5"
                        )}>
                        {!isCollapsed && (translation.file_name ?? "")}
                    </Link>

                    {!isCollapsed && (
                        <button
                            className="text-destructive p-1 hover:cursor-pointer"
                            onClick={(e) =>
                                removeTranslationHandler(e, translation.hash)
                            }>
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </motion.li>
            ))}
        </motion.ul>
    );
};

export default TranslationList;
