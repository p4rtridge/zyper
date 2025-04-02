import React from "react";
import ReactDOM from "react-dom/client";

import "./main.css";
import "./i18n";

import Provider from "./components/provider";
import Settings from "./components/settings";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <Provider>
            <Settings />
        </Provider>
    </React.StrictMode>
);
