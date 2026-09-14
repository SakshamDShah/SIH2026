// app.js - Master Orchestrator, Routing, Multi-Language Localization & Farmer Voice Reader
import { ChatController } from "./chat.js";
import { AIEngine } from "./aiEngine.js";
import { HistoryManager } from "./history.js";
import { ScannerController } from "./scanner.js";
import { DashboardController } from "./dashboard.js";

// Regional Language Localization Dictionary (4 Languages)
const I18N = {
  en: {
    tagline: "AI-powered crop health at your fingertips",
    scanCTA: "Scan Your Crop",
    navHome: "Home",
    navToday: "Today's Plan",
    navDetect: "Disease Detection",
    navInsights: "Farm Insights",
    navHistory: "History",
    navAbout: "About & Model",
    uploadTitle: "Upload Crop Image",
    uploadSubtitle: "Take a clear photo of a leaf or crop to detect possible diseases.",
    btnUpload: "Upload Image",
    btnCamera: "Use Camera",
    dropPrompt: "Drag & Drop leaf photo here",
    dropSub: "Supports JPG, PNG, WebP up to 10MB",
    btnAnalyze: "Analyze Crop",
    whyDetected: "Why did AI detect this?",
    whatYouCanDo: "What you can do",
    consultWarning: "Consult a local agricultural expert before applying pesticides or treatments.",
    
    // Hero & Advisory
    heroTitle: "Welcome to AgriSmart AI 🌾",
    heroSub: "Real-time AI diagnostic monitoring for sustainable agriculture. Scan leaves, track moisture, and prevent disease outbreaks before they spread.",
    btnScanNow: "Scan Leaf Now",
    btnViewIrrigation: "View Irrigation Advisor",
    advisoryText: "Microclimate Advisory: Cover tomato and potato beds with waterproof tarpaulins or plastic sheets to prevent waterlogging and fungal infection during the thunderstorm. Avoid additional irrigation, apply a foliar fungicide if blight signs appear, and ensure good field drainage before the rain subsides.",
    btnInspectCrop: "Inspect Crop",

    // Dashboard Cards
    cardCropHealth: "OVERALL CROP HEALTH",
    cardDiseaseRisk: "DISEASE RISK",
    cardSoilMoisture: "SOIL MOISTURE",
    cardWeather: "WEATHER & CLIMATE",
    promptScanHealth: "Please scan image to see overall crop health!",
    basedOnScans: "Based on {count} recent zone scans",

    // Recent Scans Table
    recentScansTitle: "Recent Crop Scans",
    recentScansSub: "Click any row to inspect complete visual heatmap",
    btnViewAllScans: "View All Scans →",
    thDate: "DATE",
    thCrop: "CROP",
    thResult: "RESULT",
    thConfidence: "CONFIDENCE",
    thStatus: "STATUS",

    // Advisors
    smartIrrigationTitle: "Smart Irrigation Advisor",
    sustainabilityTitle: "SUSTAINABILITY SCORE (BONUS D)"
  },

  hi: {
    tagline: "आपकी उंगलियों पर AI-संचालित फसल स्वास्थ्य",
    scanCTA: "अपनी फसल स्कैन करें",
    navHome: "होम",
    navToday: "आज की योजना",
    navDetect: "रोग पहचान (स्कैन)",
    navInsights: "खेत की जानकारी",
    navHistory: "स्कैन इतिहास",
    navAbout: "मॉडल विवरण",
    uploadTitle: "फसल की पत्ती की फोटो अपलोड करें",
    uploadSubtitle: "संभावित रोगों का पता लगाने के लिए पत्ती या फसल की स्पष्ट फोटो लें।",
    btnUpload: "फोटो चुनें",
    btnCamera: "कैमरा खोलें",
    dropPrompt: "यहाँ पत्ती की तस्वीर खींचकर डालें",
    dropSub: "JPG, PNG, WebP प्रारूप समर्थित (10MB तक)",
    btnAnalyze: "फसल का विश्लेषण करें",
    whyDetected: "AI ने यह रोग क्यों पहचाना?",
    whatYouCanDo: "आप क्या कदम उठा सकते हैं",
    consultWarning: "कीटनाशक या रासायनिक उपचार का उपयोग करने से पहले स्थानीय कृषि विशेषज्ञ से सलाह लें।",

    // Hero & Advisory
    heroTitle: "एग्रीस्मार्ट AI में आपका स्वागत है 🌾",
    heroSub: "सतत कृषि के लिए वास्तविक समय एआई नैदानिक निगरानी। पत्तियों को स्कैन करें, नमी को ट्रैक करें और बीमारी को फैलने से रोकें।",
    btnScanNow: "अब पत्ती स्कैन करें",
    btnViewIrrigation: "सिंचाई सलाहकार देखें",
    advisoryText: "सूक्ष्म जलवायु सलाह: तूफान के दौरान जलभराव और कवक संक्रमण को रोकने के लिए टमाटर और आलू की क्यारियों को वॉटरप्रूफ तिरपाल या प्लास्टिक शीट से ढकें।",
    btnInspectCrop: "फसल का निरीक्षण करें",

    // Dashboard Cards
    cardCropHealth: "कुल फसल स्वास्थ्य",
    cardDiseaseRisk: "बीमारी का जोखिम",
    cardSoilMoisture: "मिट्टी की नमी",
    cardWeather: "मौसम और जलवायु",
    promptScanHealth: "कुल फसल स्वास्थ्य देखने के लिए कृपया चित्र स्कैन करें!",
    basedOnScans: "हाल के {count} ज़ोन स्कैन पर आधारित",

    // Recent Scans Table
    recentScansTitle: "हाल के फसल स्कैन",
    recentScansSub: "पूरा विजुअल हीटमैप देखने के लिए किसी भी पंक्ति पर क्लिक करें",
    btnViewAllScans: "सभी स्कैन देखें →",
    thDate: "दिनांक",
    thCrop: "फसल",
    thResult: "परिणाम",
    thConfidence: "विश्वसनीयता",
    thStatus: "स्थिति",

    // Advisors
    smartIrrigationTitle: "स्मार्ट सिंचाई सलाहकार",
    sustainabilityTitle: "स्थिरता स्कोर (बोनस D)"
  },

  gu: {
    tagline: "તમારી આંગળીના ટેરવે AI આધારિત પાક સ્વાસ્થ્ય",
    scanCTA: "તમારો પાક સ્કેન કરો",
    navHome: "હોમ",
    navToday: "આજનો પ્લાન",
    navDetect: "રોગ તપાસ",
    navInsights: "ખેતી માહિતી",
    navHistory: "ઇતિહાસ",
    navAbout: "મોડેલ વિગત",
    uploadTitle: "પાકના પાંદડાનો ફોટો અપલોડ કરો",
    uploadSubtitle: "સંભવિત રોગોની જાણકારી મેળવવા પાંદડાનો સ્પષ્ટ ફોટો લો.",
    btnUpload: "ફોટો પસંદ કરો",
    btnCamera: "કેમેરા વાપરો",
    dropPrompt: "અહીં પાંદડાનો ફોટો ખેંચીને મૂકો",
    dropSub: "JPG, PNG, WebP ફોર્મેટ (10MB સુધી)",
    btnAnalyze: "પાકનું વિશ્લેષણ કરો",
    whyDetected: "AI એ આ રોગ કેમ ઓળખ્યો?",
    whatYouCanDo: "તમે શું પગલાં લઈ શકો",
    consultWarning: "જંતુનાશક કે રાસાયણિક ઉપચાર વાપરતા પહેલા સ્થાનિક કૃષિ નિષ્ણાતની સલાહ લો.",

    // Hero & Advisory
    heroTitle: "એગ્રીસ્માર્ટ AI માં સ્વાગત છે 🌾",
    heroSub: "ટકાઉ ખેતી માટે રિઅલ-ટાઇમ AI નિદાન મોનિટરિંગ. પાંદડા સ્કેન કરો, ભેજ ટ્રેક કરો અને રોગ ફેલાતા પહેલા અટકાવો.",
    btnScanNow: "હવે પાંદડું સ્કેન કરો",
    btnViewIrrigation: "સિંચાઈ સલાહકાર જુઓ",
    advisoryText: "માઇક્રોક્લાઇમેટ સલાહ: વાવાઝોડા દરમિયાન પાણી ભરાઈ જવા અને ફૂગના ચેપને રોકવા માટે ટામેટાં અને બટાકાના રોપાને વોટરપ્રૂફ તાડપત્રીથી ઢાંકો.",
    btnInspectCrop: "પાક તપાસો",

    // Dashboard Cards
    cardCropHealth: "સમગ્ર પાક સ્વાસ્થ્ય",
    cardDiseaseRisk: "રોગનું જોખમ",
    cardSoilMoisture: "જમીનનો ભેજ",
    cardWeather: "હવામાન અને આબોહવા",
    promptScanHealth: "સમગ્ર પાક સ્વાસ્થ્ય જોવા માટે કૃપા કરીને ઈમેજ સ્કેન કરો!",
    basedOnScans: "તાજેતરના {count} ઝોન સ્કેન પર આધારિત",

    // Recent Scans Table
    recentScansTitle: "તાજેતરના પાક સ્કેન",
    recentScansSub: "સંપૂર્ણ વિઝ્યુઅલ હીટમેપ જોવા માટે કોઈ પણ રો પર ક્લિક કરો",
    btnViewAllScans: "બધા સ્કેન જુઓ →",
    thDate: "તારીખ",
    thCrop: "પાક",
    thResult: "પરિણામ",
    thConfidence: "વિશ્વાસ સ્તર",
    thStatus: "સ્થિતિ",

    // Advisors
    smartIrrigationTitle: "સ્માર્ટ સિંચાઈ સલાહકાર",
    sustainabilityTitle: "ટકાઉપણું સ્કોર (બોનસ D)"
  },

  pa: {
    tagline: "ਤੁਹਾਡੀਆਂ ਉਂਗਲਾਂ 'ਤੇ AI-ਸੰਚਾਲਿਤ ਫਸਲ ਦੀ ਸਿਹਤ",
    scanCTA: "ਆਪਣੀ ਫਸਲ ਸਕੈਨ ਕਰੋ",
    navHome: "ਹੋਮ",
    navToday: "ਅੱਜ ਦੀ ਯੋਜਨਾ",
    navDetect: "ਬੀਮਾਰੀ ਦੀ ਪਛਾਣ",
    navInsights: "ਖੇਤੀ ਦੀ ਜਾਣਕਾਰੀ",
    navHistory: "ਇਤਿਹਾਸ",
    navAbout: "ਮਾਡਲ ਵੇਰਵਾ",
    uploadTitle: "ਫਸਲ ਦੀ ਤਸਵੀਰ ਅਪਲੋਡ ਕਰੋ",
    uploadSubtitle: "ਸੰਭਾਵੀ ਬਿਮਾਰੀਆਂ ਦਾ ਪਤਾ ਲਗਾਉਣ ਲਈ ਪੱਤੇ ਜਾਂ ਫਸਲ ਦੀ ਸਾਫ਼ ਤਸਵੀਰ ਲਓ।",
    btnUpload: "ਤਸਵੀਰ ਅਪਲੋਡ ਕਰੋ",
    btnCamera: "ਕੈਮਰਾ ਵਰਤੋ",
    dropPrompt: "ਇੱਥੇ ਪੱਤੇ ਦੀ ਤਸਵੀਰ ਖਿੱਚ ਕੇ ਪਾਓ",
    dropSub: "JPG, PNG, WebP ਫਾਰਮੈਟ (10MB ਤੱਕ)",
    btnAnalyze: "ਫਸਲ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ",
    whyDetected: "AI ਨੇ ਇਹ ਬਿਮਾਰੀ ਕਿਉਂ ਲੱਭੀ?",
    whatYouCanDo: "ਤੁਸੀਂ ਕੀ ਕਰ ਸਕਦੇ ਹੋ",
    consultWarning: "ਕੀਟਨਾਸ਼ਕਾਂ ਜਾਂ ਰਸਾਇਣਾਂ ਦੀ ਵਰਤੋਂ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਸਥਾਨਕ ਖੇਤੀਬਾੜੀ ਮਾਹਰ ਨਾਲ ਸਲਾਹ ਕਰੋ।",

    // Hero & Advisory
    heroTitle: "ਐਗਰੀਸਮਾਰਟ AI ਵਿੱਚ ਜੀ ਆਇਆਂ ਨੂੰ 🌾",
    heroSub: "ਟਿਕਾਊ ਖੇਤੀਬਾੜੀ ਲਈ ਰੀਅਲ-ਟਾਈਮ AI ਨਿਦਾਨ ਨਿਗਰਾਨੀ। ਪੱਤਿਆਂ ਨੂੰ ਸਕੈਨ ਕਰੋ, ਨਮੀ ਨੂੰ ਟਰੈਕ ਕਰੋ ਅਤੇ ਬਿਮਾਰੀ ਦੇ ਫੈਲਣ ਤੋਂ ਪਹਿਲਾਂ ਰੋਕੋ।",
    btnScanNow: "ਹੁਣੇ ਪੱਤਾ ਸਕੈਨ ਕਰੋ",
    btnViewIrrigation: "ਸਿੰਚਾਈ ਸਲਾਹਕਾਰ ਦੇਖੋ",
    advisoryText: "ਮਾਈਕ੍ਰੋਕਲਾਈਮੇਟ ਸਲਾਹ: ਤੂਫਾਨ ਦੌਰਾਨ ਪਾਣੀ ਭਰਨ ਅਤੇ ਫੰਗਲ ਇਨਫੈਕਸ਼ਨ ਨੂੰ ਰੋਕਣ ਲਈ ਟਮਾਟਰ ਅਤੇ ਆਲੂ ਦੀਆਂ ਕਿਆਰੀਆਂ ਨੂੰ ਵਾਟਰਪ੍ਰੂਫ ਤਰਪਾਲ ਨਾਲ ਢੱਕੋ।",
    btnInspectCrop: "ਫਸਲ ਦੀ ਜਾਂਚ ਕਰੋ",

    // Dashboard Cards
    cardCropHealth: "ਕੁੱਲ ਫਸਲ ਦੀ ਸਿਹਤ",
    cardDiseaseRisk: "ਬਿਮਾਰੀ ਦਾ ਖਤਰਾ",
    cardSoilMoisture: "ਮਿੱਟੀ ਦੀ ਨਮੀ",
    cardWeather: "ਮੌਸਮ ਅਤੇ ਜਲਵਾਯੂ",
    promptScanHealth: "ਕੁੱਲ ਫਸਲ ਦੀ ਸਿਹਤ ਦੇਖਣ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਤਸਵੀਰ ਸਕੈਨ ਕਰੋ!",
    basedOnScans: "ਹਾਲ ਹੀ ਦੇ {count} ਜ਼ੋਨ ਸਕੈਨਾਂ 'ਤੇ ਅਧਾਰਤ",

    // Recent Scans Table
    recentScansTitle: "ਹਾਲ ਹੀ ਦੇ ਫਸਲ ਸਕੈਨ",
    recentScansSub: "ਪੂਰਾ ਵਿਜ਼ੂਅਲ ਹੀਟਮੈਪ ਦੇਖਣ ਲਈ ਕਿਸੇ ਵੀ ਰੋਅ 'ਤੇ ਕਲਿੱਕ ਕਰੋ",
    btnViewAllScans: "ਸਾਰੇ ਸਕੈਨ ਦੇਖੋ →",
    thDate: "ਮਿਤੀ",
    thCrop: "ਫਸਲ",
    thResult: "ਨਤੀਜਾ",
    thConfidence: "ਭਰੋਸਾ",
    thStatus: "ਸਥਿਤੀ",

    // Advisors
    smartIrrigationTitle: "ਸਮਾਰਟ ਸਿੰਚਾਈ ਸਲਾਹਕਾਰ",
    sustainabilityTitle: "ਟਿਕਾਊਤਾ ਸਕੋਰ (ਬੋਨਸ D)"
  }
};

class AgriSmartApp {
  constructor() {
    this.chatbot = new ChatController(this);
    this.currentLang = "en";
    this.synth = window.speechSynthesis || null;
    this.currentUtterance = null;

    this.initNavigation();
    this.initLanguageSelector();
    this.initToastContainer();
    this.initApiSettings();

    // Instantiate core modules
    this.aiEngine = new AIEngine();
    this.historyManager = new HistoryManager(this);
    window.__agriHistory = this.historyManager; // Expose for inline handlers
    this.scanner = new ScannerController(this.aiEngine, this.historyManager, this);
    this.dashboard = new DashboardController(this);

    // Initialize Daily Plan & Task History feature
    this.initDailyPlan();
    this.renderHistoryTab();
  }

  initNavigation() {
    this.navLinks = document.querySelectorAll("[data-target-tab]");
    this.tabViews = document.querySelectorAll(".tab-view");
    this.mobileMenuBtn = document.getElementById("mobileMenuBtn");
    this.mainNav = document.getElementById("mainNav");
    this.btnHeaderCTA = document.getElementById("btnHeaderCTA");
    this.brandHomeLink = document.getElementById("brandHomeLink");

    // NEW: Log Out Logic
    const btnLogout = document.getElementById("btnLogout");
    btnLogout?.addEventListener("click", () => {
      const userStr = localStorage.getItem("agrismart_user") || sessionStorage.getItem("agrismart_user");
      let isGuest = true;
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          if (u.role !== "guest" && u.userId !== "guest_session") {
            isGuest = false;
          }
        } catch (e) {}
      }

      if (isGuest) {
        sessionStorage.removeItem("agrismart_scan_history_guest_session");
        sessionStorage.removeItem("agrismart_scan_history_guest");
        localStorage.removeItem("agrismart_scan_history_guest_session");
        localStorage.removeItem("agrismart_scan_history_guest");
        localStorage.removeItem("farmTaskHistory");
        sessionStorage.clear();
      }

      // Clear both storages
      localStorage.removeItem("agrismart_user");
      sessionStorage.removeItem("agrismart_user");
      window.location.href = "/login";
    });

    this.navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const tabId = link.getAttribute("data-target-tab");
        this.switchTab(tabId);
        if (this.mainNav.classList.contains("mobile-open")) {
          this.mainNav.classList.remove("mobile-open");
        }
      });
    });

    this.btnHeaderCTA?.addEventListener("click", () => {
      this.switchTab("tabDetect");
    });

    this.brandHomeLink?.addEventListener("click", (e) => {
      e.preventDefault();
      this.switchTab("tabHome");
    });

    this.mobileMenuBtn?.addEventListener("click", () => {
      this.mainNav.classList.toggle("mobile-open");
    });
  }

  switchTab(tabId) {
    this.tabViews.forEach((view) => {
      view.classList.toggle("active", view.id === tabId);
    });
    this.navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("data-target-tab") === tabId);
    });

    if (tabId === "tabToday") {
      this.initDailyPlan();
    } else if (tabId === "tabHistory") {
      this.renderHistoryTab();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  initLanguageSelector() {
    this.langSelect = document.getElementById("languageSelect");
    this.langSelect?.addEventListener("change", (e) => {
      this.setLanguage(e.target.value);
    });
  } 

  setLanguage(langCode) {
    // 1. Normalize language code (e.g., handles "gu-IN", "gu", or "gujarati" as "gu")
    let code = (langCode || "").toLowerCase();
    if (code.includes("hi")) code = "hi";
    else if (code.includes("gu")) code = "gu";
    else if (code.includes("pa")) code = "pa";
    else code = "en";

    this.currentLang = code;
    const dict = I18N[code] || I18N.en;

    // 2. Apply dictionary translations to all elements with data-i18n attributes
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    // 3. Trigger Google Translate for full-page automatic text translation (dynamic cards, sensor data, tasks)
    const googleSelect = document.querySelector(".goog-te-combo");
    if (googleSelect) {
      googleSelect.value = code;
      googleSelect.dispatchEvent(new Event("change"));
    }

    // 4. Re-render dynamic components so subtexts update immediately
    if (typeof this.updateOverallCropHealth === "function") {
      this.updateOverallCropHealth();
    } else if (typeof updateOverallCropHealth === "function") {
      updateOverallCropHealth();
    }

    // 5. Toast feedback
    if (this.langSelect && typeof this.showToast === "function") {
      const selectedText = this.langSelect.options[this.langSelect.selectedIndex]?.text || langCode;
      this.showToast(`Language set to ${selectedText}`);
    }
  }

  // Farmer-Friendly Voice Synthesizer
  speak(text, buttonEl = null) {
    if (!this.synth) {
      this.showToast("Voice speech is not supported on this browser.", "warning");
      return;
    }

    if (this.synth.speaking) {
      this.synth.cancel();
      if (buttonEl) {
        buttonEl.classList.remove("playing");
        buttonEl.innerHTML = `<span>🔊</span> <span>Listen in ${this.currentLang.toUpperCase()}</span>`;
      }
      return;
    }

    this.currentUtterance = new SpeechSynthesisUtterance(text);
    // Select appropriate regional language voice code
    const langCodes = { en: "en-IN", hi: "hi-IN", gu: "gu-IN", pa: "pa-IN" };
    this.currentUtterance.lang = langCodes[this.currentLang] || "en-US";
    this.currentUtterance.rate = 0.92; // Slightly slower, clearer tempo for farmers

    if (buttonEl) {
      buttonEl.classList.add("playing");
      buttonEl.innerHTML = `<span>⏹</span> <span>Stop Audio</span>`;
    }

    this.currentUtterance.onend = () => {
      if (buttonEl) {
        buttonEl.classList.remove("playing");
        buttonEl.innerHTML = `<span>🔊</span> <span>Listen in ${this.currentLang.toUpperCase()}</span>`;
      }
    };

    this.currentUtterance.onerror = () => {
      if (buttonEl) {
        buttonEl.classList.remove("playing");
        buttonEl.innerHTML = `<span>🔊</span> <span>Listen in ${this.currentLang.toUpperCase()}</span>`;
      }
    };

    this.synth.speak(this.currentUtterance);
  }

  initToastContainer() {
    this.toastContainer = document.createElement("div");
    this.toastContainer.id = "appToastContainer";
    this.toastContainer.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(this.toastContainer);
  }

  showToast(message, type = "success") {
    const toast = document.createElement("div");
    const bg = type === "warning" ? "#b45309" : type === "info" ? "#1d4ed8" : "#1b4332";
    toast.style.cssText = `
      background: ${bg};
      color: #ffffff;
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9rem;
      box-shadow: 0 4px 14px rgba(0,0,0,0.2);
      transition: all 0.3s ease;
      opacity: 0;
      transform: translateY(12px);
      pointer-events: auto;
    `;
    toast.textContent = message;
    this.toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  initApiSettings() {
    const btnOpenSettings = document.getElementById("btnOpenApiSettings");
    const modal = document.getElementById("apiSettingsModal");
    const btnClose = document.getElementById("btnCloseApiSettings");
    const btnSave = document.getElementById("btnSaveApiSettings");
    const inputEndpoint = document.getElementById("apiEndpointInput");
    const toggleLive = document.getElementById("toggleLiveApi");

    if (inputEndpoint) {
      inputEndpoint.value = localStorage.getItem("agrismart_api_endpoint") || "/api/predict";
    }
    if (toggleLive) {
      toggleLive.checked = localStorage.getItem("agrismart_use_live_api") === "true";
    }

    btnOpenSettings?.addEventListener("click", () => modal.classList.add("open"));
    btnClose?.addEventListener("click", () => modal.classList.remove("open"));
    btnSave?.addEventListener("click", () => {
      localStorage.setItem("agrismart_api_endpoint", inputEndpoint.value.trim());
      localStorage.setItem("agrismart_use_live_api", toggleLive.checked ? "true" : "false");
      this.aiEngine.apiEndpoint = inputEndpoint.value.trim();
      this.aiEngine.useLiveApi = toggleLive.checked;
      modal.classList.remove("open");
      this.showToast("✓ Model API Configuration Saved!");
    });
  }

  // --- Daily Farm Plan Logic ---
  initDailyPlan() {
    const todayDateEl = document.getElementById("todayDate");
    if (todayDateEl) {
      todayDateEl.innerText = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    }

    const checkboxes = document.querySelectorAll("#taskList .task-checkbox");
    checkboxes.forEach((checkbox) => {
      // 1. Restore state from browser storage
      const isChecked = localStorage.getItem(checkbox.id) === "true";
      checkbox.checked = isChecked;

      const parentCard = checkbox.closest(".task-card-item");
      if (parentCard) {
        parentCard.classList.toggle("is-completed", isChecked);
      }

      // 2. Clear old listener to prevent duplicates
      const freshCheckbox = checkbox.cloneNode(true);
      if (checkbox.parentNode) {
        checkbox.parentNode.replaceChild(freshCheckbox, checkbox);
      }

      // 3. Attach fresh event listener
      freshCheckbox.addEventListener("change", (e) => {
        const checked = e.target.checked;
        localStorage.setItem(e.target.id, checked);

        const card = e.target.closest(".task-card-item");
        if (card) {
          card.classList.toggle("is-completed", checked);
        }

        if (checked) {
          const titleEl = card?.querySelector(".task-title");
          if (titleEl) {
            this.logTaskToHistory(titleEl.textContent.trim());
          }
        }
      });
    });
  }

  // --- History Logging Logic ---
  logTaskToHistory(taskTitle) {
    const history = JSON.parse(localStorage.getItem("farmTaskHistory")) || [];
    const newEntry = {
      title: taskTitle,
      completedAt: new Date().toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short"
      })
    };

    history.unshift(newEntry);
    localStorage.setItem("farmTaskHistory", JSON.stringify(history));
    this.renderHistoryTab();
  }

  renderHistoryTab() {
    const historyContainer = document.getElementById("historyList");
    if (!historyContainer) return;

    const history = JSON.parse(localStorage.getItem("farmTaskHistory")) || [];

    if (history.length === 0) {
      historyContainer.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: #6b7280;">
          No completed tasks logged yet.
        </div>`;
      return;
    }

    historyContainer.innerHTML = history.map((item) => `
      <div class="task-card-item">
        <div class="task-left">
          <div class="task-details">
            <div class="task-time">Completed: ${item.completedAt}</div>
            <h4 class="task-title">${item.title}</h4>
          </div>
        </div>
        <div class="task-right">
          <span class="badge badge-healthy">Done</span>
        </div>
      </div>
    `).join("");
  }
}

// Initialize Application once DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.agriSmartApp = new AgriSmartApp();
});