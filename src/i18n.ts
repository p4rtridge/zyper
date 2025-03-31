import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enJson from "@/locales/en.json";
import viJson from "@/locales/vi.json";

i18n.use(initReactI18next).init({
    debug: false,
    fallbackLng: "en",
    resources: { en: enJson, vi: viJson },
});
