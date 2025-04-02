import { PanelLeftClose } from "lucide-react";
import { motion } from "motion/react";
import { lazy, useEffect, useRef, useState } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";

import { MIN_SIZE_PANEL_IN_PIXEL } from "@/consts";
import { useDebounce } from "@/hooks/debounce";
import { useResize } from "@/hooks/resize";
import { cn } from "@/lib/utils";

import NavBar from "./navbar";
import TranslationList from "./translation-list";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "./ui/resizable";

const DropZone = lazy(() => import("./dropzone"));

type LayoutProps = { children?: React.ReactNode };

const Layout: React.FC<LayoutProps> = ({ children }: LayoutProps) => {
    const rightPanelRef = useRef<ImperativePanelHandle>(null);

    const { size } = useResize();
    const minSizePercentage = Math.floor(
        (MIN_SIZE_PANEL_IN_PIXEL / size.width) * 100
    );
    const navBarSizePercentage = Math.floor((60 / size.width) * 100);

    const [rightSize, setRightSize] = useState(() => {
        const resizableSize = localStorage.getItem(
            "react-resizable-panels:size"
        );
        if (!resizableSize) return minSizePercentage;

        const layouts = Object.values(JSON.parse(resizableSize));

        // @ts-expect-error TODO: must define type here to omit error
        const sizes = layouts[layouts.length - 1].layout as number[];

        return sizes[1];
    });
    const debouncedRightSize = useDebounce(rightSize, 250);
    const [isCollapsed, setIsCollapsed] = useState(true);

    const handleResize = (sizes: number[]): void => {
        setRightSize(sizes[1]);
    };

    const handleCollapse = (): void => {
        if (!rightPanelRef.current) {
            return;
        }

        if (!isCollapsed) {
            rightPanelRef.current.collapse();
        } else {
            rightPanelRef.current.resize(50);
        }

        setIsCollapsed(!isCollapsed);
    };

    useEffect(() => {
        setIsCollapsed(
            navBarSizePercentage + minSizePercentage > debouncedRightSize
        );
    }, [debouncedRightSize, minSizePercentage, navBarSizePercentage]);

    return (
        <>
            <ResizablePanelGroup
                autoSaveId="size"
                direction="horizontal"
                onLayout={handleResize}>
                <ResizablePanel
                    defaultSize={70}
                    order={1}>
                    {children}
                </ResizablePanel>

                <ResizableHandle />

                <ResizablePanel
                    ref={rightPanelRef}
                    collapsible
                    defaultSize={30}
                    maxSize={50}
                    order={2}
                    collapsedSize={minSizePercentage}
                    minSize={minSizePercentage}
                    className="relative flex flex-col">
                    <div
                        className={cn(
                            "flex gap-2 border-b-2 p-2",
                            isCollapsed
                                ? "flex-col items-center"
                                : "items-start justify-between"
                        )}>
                        <motion.button
                            animate={{ rotate: isCollapsed ? 0 : 180 }}
                            transition={{ duration: 0.3 }}
                            onClick={handleCollapse}
                            className="text-card-foreground hover:cursor-pointer">
                            <PanelLeftClose className="h-5 w-5" />
                        </motion.button>
                        <NavBar />
                    </div>

                    <TranslationList isCollapsed={isCollapsed} />
                </ResizablePanel>
            </ResizablePanelGroup>

            <DropZone />
        </>
    );
};

export default Layout;
