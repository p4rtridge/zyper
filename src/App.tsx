import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";

import Layout from "./components/layout";
import { Button } from "./components/ui/button";

function App() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [hintEnabled, setHintEnabled] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setHintEnabled(true);
        }, 10000);

        const previousSession = localStorage.getItem("previous_session");

        if (!previousSession) {
            return;
        }

        navigate(`/translations/${previousSession}`);

        return () => {
            clearTimeout(timeout);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Layout>
            {hintEnabled && (
                <div className="flex h-dvh flex-col items-center justify-center gap-2">
                    <p className="px-4">{t("hintLabel")}</p>
                    <Button
                        variant="link"
                        asChild>
                        <Link to="/translations">{t("hintText")}</Link>
                    </Button>
                </div>
            )}
        </Layout>
    );
}

export default App;
