import { useState } from "react";

type Locale = "en" | "uz";

export function useLocale() {
  const [locale, setLocale] = useState<Locale>(
    (localStorage.getItem("locale") as Locale) || "en"
  );

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem("locale", newLocale);
  };

  return { locale, changeLocale };
}