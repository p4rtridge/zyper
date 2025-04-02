import { ThemeProvider } from "next-themes";
import { useEffect } from "react";

import useSettingsStore from "@/stores/settings";

type ProviderProps = { children: React.ReactNode };

const Provider: React.FC<ProviderProps> = ({ children }: ProviderProps) => {
    //const { i18n } = useTranslation();
    const fetchSettings = useSettingsStore((state) => state.fetchSettings);

    useEffect(() => {
        fetchSettings();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
