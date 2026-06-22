import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import frCommon from "@/locales/fr/common.json";
import sgCommon from "@/locales/sg/common.json";

i18n.use(initReactI18next).init({
  resources: {
    fr: { common: frCommon },
    sg: { common: sgCommon },
  },
  lng: "fr",
  fallbackLng: "fr",
  defaultNS: "common",
  interpolation: { escapeValue: false },
});

export default i18n;
