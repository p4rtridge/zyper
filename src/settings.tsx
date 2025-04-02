import React from "react";
import ReactDOM from "react-dom/client";

import "./main.css";
import "./i18n";
import Settings from "./components/Settings";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <Settings />
    </React.StrictMode>
);
