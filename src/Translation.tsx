import { useEffect, useState } from "react";
import { redirect, useLoaderData } from "react-router";

import Layout from "./components/layout";
import { getFile } from "./lib/core";
import useTranslationStore from "./stores/translation";

const Translation: React.FC = () => {
    const { translationId } = useLoaderData();
    const [content, setContent] = useState<string | null>(null);

    const targetTranslation = useTranslationStore((state) =>
        state.getTranslation(translationId)
    );

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

    return (
        <Layout>
            <div className="scrollbar h-dvh overflow-y-scroll">
                {!!content &&
                    content
                        .split("\n")
                        .map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
            </div>
        </Layout>
    );
};

export default Translation;
