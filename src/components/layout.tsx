import { PanelLeftClose } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";

import { MIN_SIZE_PANEL_IN_PIXEL } from "@/consts";
import { useDebounce } from "@/hooks/debounce";
import { useResize } from "@/hooks/resize";
import { cn } from "@/lib/utils";

import NavBar from "./navbar";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "./ui/resizable";

type LayoutProps = { children?: React.ReactNode };

const Layout: React.FC<LayoutProps> = ({ children }: LayoutProps) => {
    const rightPanelRef = useRef<ImperativePanelHandle>(null);

    const [isCollapsed, setIsCollapsed] = useState(false);
    const [rightSize, setRightSize] = useState(30);
    const debouncedRightSize = useDebounce(rightSize, 300);
    const { size } = useResize();

    const minSizePercentage = (MIN_SIZE_PANEL_IN_PIXEL / size.width) * 100;

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
            rightPanelRef.current.expand();
        }

        setIsCollapsed(!isCollapsed);
    };

    useEffect(() => {
        setIsCollapsed(
            4 + minSizePercentage < debouncedRightSize ? false : true
        );
    }, [debouncedRightSize, minSizePercentage]);

    return (
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
                collapsedSize={minSizePercentage}
                defaultSize={30}
                maxSize={50}
                minSize={minSizePercentage}
                order={2}>
                <div
                    className={cn(
                        "flex gap-2 p-1",
                        isCollapsed
                            ? "flex-col items-center"
                            : "items-start justify-between"
                    )}>
                    <motion.button
                        animate={{ rotate: isCollapsed ? 0 : 180 }}
                        transition={{ duration: 0.3 }}
                        onClick={handleCollapse}>
                        <PanelLeftClose className="h-5 w-5" />
                    </motion.button>
                    <NavBar />
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
};

export default Layout;
