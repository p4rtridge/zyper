import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, redirect, RouterProvider } from "react-router";

import "./main.css";
import "./i18n";
import About from "./About";
import App from "./App";
import Translation from "./Translation";

const router = createBrowserRouter([
    { path: "/", element: <App /> },
    {
        path: "/translations",
        children: [
            { index: true, element: <About /> },
            {
                path: ":translationId",
                loader: ({ params }) => {
                    const translationId = params.translationId;
                    if (!translationId) return redirect("/");

                    return { translationId };
                },
                element: <Translation />,
            },
        ],
    },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
