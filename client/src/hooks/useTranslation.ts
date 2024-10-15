import { useState, useEffect, useCallback } from 'react';
import i18next from 'i18next';
import { useTranslation as useI18nTranslation } from 'react-i18next';

const useTranslation = () => {
  const { t: i18nT, i18n } = useI18nTranslation();
  const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({});

  const translate = useCallback(async (key: string, defaultValue: string) => {
    if (translatedTexts[key]) {
      return translatedTexts[key];
    }

    const translation = i18nT(key, defaultValue);
    if (translation === key) {
      try {
        const response = await fetch(
          `https://translation.googleapis.com/language/translate/v2?key=${process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY}&q=${encodeURIComponent(
            defaultValue
          )}&target=${i18n.language}`
        );
        const data = await response.json();
        const translatedText = data.data.translations[0].translatedText;
        i18n.addResource(i18n.language, 'translation', key, translatedText);
        setTranslatedTexts(prev => ({ ...prev, [key]: translatedText }));
        return translatedText;
      } catch (error) {
        console.error('Erro ao traduzir:', error);
        return defaultValue;
      }
    }
    setTranslatedTexts(prev => ({ ...prev, [key]: translation }));
    return translation;
  }, [i18nT, i18n]);

  return { t: translate, i18n };
};

export default useTranslation;
