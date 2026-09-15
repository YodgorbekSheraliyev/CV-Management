import { useTranslation } from "react-i18next";

const languages = [
  { code: "en", name: "English" },
  { code: "uz", name: "O'zbekcha" },
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
  };

  return (
    <select
      className="form-select"
      value={i18n.language}
      onChange={(e) => changeLanguage(e.target.value)}
      style={{ width: "auto" }}
    >
      {languages.map((language) => (
        <option key={language.code} value={language.code}>
          {language.name}
        </option>
      ))}
    </select>
  );
};

export default LanguageSelector;