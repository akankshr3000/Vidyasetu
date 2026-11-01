import os
from dotenv import load_dotenv

load_dotenv()

SUPPORTED_LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "kn": "Kannada",
    "te": "Telugu",
    "ta": "Tamil",
    "mr": "Marathi"
}





def translate_to_english(text: str, source_lang: str) -> str:
    if source_lang == "en":
        return text
    try:
        from deep_translator import GoogleTranslator
        translated = GoogleTranslator(source=source_lang, target="en").translate(text)
        return translated or text
    except Exception as e:
        print(f"Translation error: {e}")
        return text


def translate_from_english(text: str, target_lang: str) -> str:
    if target_lang == "en":
        return text
    try:
        from deep_translator import GoogleTranslator
        # Split into chunks if too long (Google has a 5000 char limit)
        if len(text) > 4500:
            chunks = [text[i:i+4500] for i in range(0, len(text), 4500)]
            translated_chunks = []
            for chunk in chunks:
                t = GoogleTranslator(source="en", target=target_lang).translate(chunk)
                translated_chunks.append(t or chunk)
            return " ".join(translated_chunks)
        translated = GoogleTranslator(source="en", target=target_lang).translate(text)
        return translated or text
    except Exception as e:
        print(f"Translation error: {e}")
        return text


def get_language_name(code: str) -> str:
    return SUPPORTED_LANGUAGES.get(code, "English")
