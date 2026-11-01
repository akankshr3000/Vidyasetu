let voices = [];

function loadVoices() {
    voices = window.speechSynthesis.getVoices();
    console.log("Loaded voices:", voices);
}

// Initial load
loadVoices();

window.speechSynthesis.onvoiceschanged = loadVoices;

export function cleanTextForSpeech(text) {
    if (!text) return "";
    return text
    .replace(/[*\•\-_]/g, '')
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getVoiceForLang(langCode) {
    // try exact match first
    let voice = voices.find(v => v.lang === langCode);
    
    if (voice) return voice;

    // fallback (partial match)
    voice = voices.find(v => v.lang.startsWith(langCode.split('-')[0]));
    
    return voice || voices[0]; // final fallback
}

export function speakText(text, selectedLang) {
    const langMap = {
        "English": "en-IN",
        "Hindi": "hi-IN",
        "Kannada": "kn-IN",
        "Telugu": "te-IN"
    };

    const cleaned = cleanTextForSpeech(text);
    const speech = new SpeechSynthesisUtterance(cleaned);

    const langCode = langMap[selectedLang] || selectedLang || "en-IN";
    speech.lang = langCode;
    
    // IMPORTANT: assign correct voice
    const selectedVoice = getVoiceForLang(langCode);
    if (selectedVoice) {
        speech.voice = selectedVoice;
    }

    speech.rate = 0.95;
    speech.pitch = 1;

    // stop any previous speech
    window.speechSynthesis.cancel();

    window.speechSynthesis.speak(speech);
}
