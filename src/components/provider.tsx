import { ThemeProvider } from "next-themes";
import { useEffect } from "react";

import useSettingsStore from "@/stores/settings";

type ProviderProps = { children: React.ReactNode };

const Provider: React.FC<ProviderProps> = ({ children }: ProviderProps) => {
    const fetchSettings = useSettingsStore((state) => state.fetchSettings);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    // useEffect(() => {
    //     const contextMenuHandler = (e: MouseEvent) => {
    //         e.preventDefault();

    //         return false;
    //     };

    //     window.addEventListener("contextmenu", contextMenuHandler, {
    //         capture: true,
    //     });

    //     return () => {
    //         window.removeEventListener("contextmenu", contextMenuHandler);
    //     };
    // }, []);

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            disableTransitionOnChange
            enableSystem={false}
            themes={["dark", "light", "yellow"]}>
            {children}
        </ThemeProvider>
    );
};

export default Provider;
