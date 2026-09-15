/**
 * ============================================================================
 * SPEECH RECOGNITION & SYNTHESIS UTILITY (Web Speech API)
 * ============================================================================
 * Tailored for Indian farmers with support for Hindi (hi-IN) and English (en-IN).
 * Provides:
 *  1. Voice Input (Speech-to-Text): Farmer speaks crop details
 *  2. Keyword & Number Parser: Extracts crop type & kilograms from speech
 *  3. Voice Read-Back (Text-to-Speech): Speaks instructions & confirmations aloud
 * ============================================================================
 */

// Check browser support
export const isSpeechRecognitionSupported = () => {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

export const isSpeechSynthesisSupported = () => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

/**
 * Starts listening to the microphone in the specified language.
 * @param {string} lang - 'hi-IN' (Hindi) or 'en-IN' (English)
 * @param {Function} onResult - Callback with transcript string
 * @param {Function} onError - Callback on recognition error
 * @param {Function} onEnd - Callback when listening finishes
 * @returns {object} Recognition instance with .stop() method
 */
export const startVoiceRecognition = (lang = 'hi-IN', onResult, onError, onEnd) => {
  if (!isSpeechRecognitionSupported()) {
    if (onError) onError('Speech Recognition is not supported in this browser. Please use Chrome or Edge.');
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.lang = lang;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  recognition.onresult = (event) => {
    if (event.results && event.results[0] && event.results[0][0]) {
      const transcript = event.results[0][0].transcript;
      if (onResult) onResult(transcript);
    }
  };

  recognition.onerror = (event) => {
    console.warn('Speech recognition error:', event.error);
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  try {
    recognition.start();
    return recognition;
  } catch (err) {
    if (onError) onError(err.message);
    return null;
  }
};

/**
 * Parses spoken speech text into structured crop fields (cropType & quantity).
 * Handles both Hindi and English colloquial agricultural phrasing.
 * Example inputs:
 *  - "500 किलो गेहूं" -> { cropType: "गेहूं (Wheat)", quantity: 500 }
 *  - "two hundred kg basmati rice" -> { cropType: "चावल (Rice)", quantity: 200 }
 *  - "मक्का 800" -> { cropType: "मक्का (Corn)", quantity: 800 }
 * 
 * @param {string} text - The raw speech transcript
 * @returns {object} { cropType: string|null, quantity: number|null, rawText: string }
 */
export const parseSpokenCrop = (text = '') => {
  const lower = text.toLowerCase();
  let cropType = null;
  let quantity = null;

  // 1. Identify Crop Variety
  if (lower.includes('गेहूं') || lower.includes('gehu') || lower.includes('gehun') || lower.includes('wheat')) {
    cropType = 'शरबती गेहूं (Wheat)';
  } else if (lower.includes('चावल') || lower.includes('chawal') || lower.includes('dhan') || lower.includes('धान') || lower.includes('rice') || lower.includes('basmati')) {
    cropType = 'बासमती चावल (Basmati Rice)';
  } else if (lower.includes('मक्का') || lower.includes('makka') || lower.includes('corn') || lower.includes('maize')) {
    cropType = 'पीली मक्का (Yellow Maize)';
  } else if (lower.includes('सरसों') || lower.includes('sarso') || lower.includes('sarson') || lower.includes('mustard')) {
    cropType = 'सरसों के बीज (Mustard)';
  } else if (lower.includes('आलू') || lower.includes('aloo') || lower.includes('alu') || lower.includes('potato')) {
    cropType = 'पहाड़ी आलू (Potato)';
  } else if (lower.includes('चना') || lower.includes('chana') || lower.includes('दाल') || lower.includes('dal') || lower.includes('pulse') || lower.includes('chickpea')) {
    cropType = 'देसी चना (Chickpeas)';
  } else if (lower.includes('गन्ना') || lower.includes('ganna') || lower.includes('sugarcane')) {
    cropType = 'गन्ना (Sugarcane)';
  } else if (lower.includes('बाजरा') || lower.includes('bajra') || lower.includes('millet')) {
    cropType = 'देसी बाजरा (Pearl Millet)';
  }

  // 2. Extract numeric quantity
  // Look for digits first: e.g. "500", "1200"
  const digitMatch = lower.match(/\b\d+\b/);
  if (digitMatch) {
    quantity = parseInt(digitMatch[0], 10);
  } else {
    // Check common Hindi spoken numerals
    if (lower.includes('पांच सौ') || lower.includes('paanch sau')) quantity = 500;
    else if (lower.includes('दो सौ') || lower.includes('do sau')) quantity = 200;
    else if (lower.includes('तीन सौ') || lower.includes('teen sau')) quantity = 300;
    else if (lower.includes('चार सौ') || lower.includes('chaar sau')) quantity = 400;
    else if (lower.includes('एक हजार') || lower.includes('ek hazaar') || lower.includes('hazar')) quantity = 1000;
    else if (lower.includes('दो हजार') || lower.includes('do hazaar')) quantity = 2000;
    else if (lower.includes('सौ') || lower.includes('sau') || lower.includes('hundred')) quantity = 100;
  }

  // If farmer spoke in Quintals (क्विंटल), multiply by 100 kg!
  if (lower.includes('क्विंटल') || lower.includes('quintal') || lower.includes('quntal')) {
    if (quantity && quantity < 100) {
      quantity = quantity * 100; // e.g. 5 quintals -> 500 kg
    }
  }

  return {
    cropType,
    quantity,
    rawText: text
  };
};

/**
 * Speaks text aloud using Text-To-Speech (SpeechSynthesis).
 * Useful for reading form instructions, labels, and confirmations to non-literate farmers.
 * 
 * @param {string} text - The text to speak aloud
 * @param {string} lang - 'hi-IN' or 'en-IN'
 */
export const speakText = (text, lang = 'hi-IN') => {
  if (!isSpeechSynthesisSupported()) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.92; // Slightly measured pace for easy comprehension
  utterance.pitch = 1.0;

  // Try to find a natural Hindi/Indian English voice
  const voices = window.speechSynthesis.getVoices();
  const targetVoice = voices.find(v => v.lang === lang || (lang.startsWith('hi') && v.lang.includes('hi')));
  if (targetVoice) {
    utterance.voice = targetVoice;
  }

  window.speechSynthesis.speak(utterance);
};
