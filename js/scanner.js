// scanner.js - Camera Capture, Drag-and-Drop, Image Quality Gate & AI Flow Coordinator
import { ImageQualityChecker } from "./qualityCheck.js";

export class ScannerController {
  constructor(aiEngine, historyManager, app) {
    this.aiEngine = aiEngine;
    this.historyManager = historyManager;
    this.app = app;

    this.currentImage = null;       // Base64 Data URL or Image Source
    this.currentFileName = "";
    this.currentFileSize = "";
    this.cameraStream = null;
    this.currentPrediction = null;
    this.isHeatmapActive = true;

    this.initDOMElements();
    this.bindEvents();
  }

  initDOMElements() {
    this.dropzone = document.getElementById("dropzone");
    this.fileInput = document.getElementById("fileInput");
    this.btnUploadImage = document.getElementById("btnUploadImage");
    this.btnUseCamera = document.getElementById("btnUseCamera");
    this.uploadCard = document.getElementById("uploadCard");
    this.previewCard = document.getElementById("previewCard");
    this.previewImg = document.getElementById("previewImg");
    this.previewFileName = document.getElementById("previewFileName");
    this.previewFileSize = document.getElementById("previewFileSize");
    this.btnAnalyze = document.getElementById("btnAnalyze");
    this.btnChangeImage = document.getElementById("btnChangeImage");

    // Quality Alert Elements
    this.qualityAlertCard = document.getElementById("qualityAlertCard");
    this.qualityIssuesList = document.getElementById("qualityIssuesList");
    this.brightProgress = document.getElementById("brightProgress");
    this.brightVal = document.getElementById("brightVal");
    this.sharpProgress = document.getElementById("sharpProgress");
    this.sharpVal = document.getElementById("sharpVal");
    this.frameProgress = document.getElementById("frameProgress");
    this.frameVal = document.getElementById("frameVal");
    this.btnUploadAnother = document.getElementById("btnUploadAnother");
    this.btnForceAnalyze = document.getElementById("btnForceAnalyze");

    // Scanner Animation Elements
    this.scannerOverlay = document.getElementById("scannerOverlay");
    this.scannerStepMsg = document.getElementById("scannerStepMsg");
    this.scannerProgressFill = document.getElementById("scannerProgressFill");

    // Result Screen Elements
    this.resultContainer = document.getElementById("resultContainer");
    this.resultHeaderBanner = document.getElementById("resultHeaderBanner");
    this.resultStateIcon = document.getElementById("resultStateIcon");
    this.resultTitle = document.getElementById("resultTitle");
    this.resultCropSubtitle = document.getElementById("resultCropSubtitle");
    this.healthBadge = document.getElementById("healthBadge");
    this.gaugeProgressCircle = document.getElementById("gaugeProgressCircle");
    this.gaugePercentText = document.getElementById("gaugePercentText");

    // Visual Leaf & Heatmap
    this.resultLeafImg = document.getElementById("resultLeafImg");
    this.heatmapCanvas = document.getElementById("heatmapCanvas");
    this.heatmapToggle = document.getElementById("heatmapToggle");
    this.indicatorLegendList = document.getElementById("indicatorLegendList");
    this.aiExplanationText = document.getElementById("aiExplanationText");

    // Precautions & Audio
    this.precautionCard = document.getElementById("precautionCard");
    this.precautionList = document.getElementById("precautionList");
    this.btnListenAudio = document.getElementById("btnListenAudio");
    this.btnSaveHistory = document.getElementById("btnSaveHistory");
    this.btnExportReport = document.getElementById("btnExportReport");
    this.btnScanAnother = document.getElementById("btnScanAnother");

    // Camera Modal
    this.cameraModal = document.getElementById("cameraModal");
    this.cameraVideo = document.getElementById("cameraVideo");
    this.cameraShutter = document.getElementById("cameraShutter");
    this.btnSwitchCamera = document.getElementById("btnSwitchCamera");
    this.btnCloseCamera = document.getElementById("btnCloseCamera");
  }

  bindEvents() {
    // File upload triggers
    this.btnUploadImage?.addEventListener("click", () => this.fileInput.click());
    this.dropzone?.addEventListener("click", () => this.fileInput.click());

    this.fileInput?.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) this.handleSelectedFile(file);
    });

    // Drag & Drop
    ["dragenter", "dragover"].forEach((event) => {
      this.dropzone?.addEventListener(event, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dropzone.classList.add("drag-over");
      });
    });

    ["dragleave", "drop"].forEach((event) => {
      this.dropzone?.addEventListener(event, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dropzone.classList.remove("drag-over");
      });
    });

    this.dropzone?.addEventListener("drop", (e) => {
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        this.handleSelectedFile(file);
      }
    });

    // Camera Modal triggers
    this.btnUseCamera?.addEventListener("click", () => this.openCameraModal());
    this.btnCloseCamera?.addEventListener("click", () => this.closeCameraModal());
    this.cameraShutter?.addEventListener("click", () => this.captureCameraSnapshot());
    this.btnSwitchCamera?.addEventListener("click", () => this.toggleCameraFacing());

    // Preview actions
    this.btnChangeImage?.addEventListener("click", () => this.resetScanner());
    this.btnAnalyze?.addEventListener("click", () => this.startQualityCheckAndInference());

    // Quality Alert actions
    this.btnUploadAnother?.addEventListener("click", () => this.resetScanner());
    this.btnForceAnalyze?.addEventListener("click", () => this.executeAIAnalysis());

    // Heatmap switch
    this.heatmapToggle?.addEventListener("change", (e) => {
      this.isHeatmapActive = e.target.checked;
      this.redrawHeatmap();
    });

    // Result actions
    this.btnListenAudio?.addEventListener("click", () => this.speakDiagnosis());
    this.btnScanAnother?.addEventListener("click", () => this.resetScanner());
    this.btnSaveHistory?.addEventListener("click", () => {
      this.saveCurrentToHistory(true);
      if (this.app.showToast) this.app.showToast("✓ Saved to Scan History!");
    });
    this.btnExportReport?.addEventListener("click", () => window.print());
  }

  handleSelectedFile(file) {
    this.currentFileName = file.name;
    this.currentFileSize = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.currentImage = e.target.result;
      this.showPreview();
    };
    reader.readAsDataURL(file);
  }

  showPreview() {
    this.uploadCard.style.display = "none";
    this.qualityAlertCard.style.display = "none";
    this.resultContainer.style.display = "none";
    this.previewCard.style.display = "flex";

    this.previewImg.src = this.currentImage;
    this.previewFileName.textContent = this.currentFileName;
    this.previewFileSize.textContent = this.currentFileSize;
  }

  resetScanner() {
    this.currentImage = null;
    this.currentFileName = "";
    this.currentFileSize = "";
    this.currentPrediction = null;

    if (this.fileInput) this.fileInput.value = "";
    this.previewCard.style.display = "none";
    this.qualityAlertCard.style.display = "none";
    this.resultContainer.style.display = "none";
    this.scannerOverlay.style.display = "none";
    this.uploadCard.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // --- Image Quality Check Gate ---
  async startQualityCheckAndInference() {
    this.scannerOverlay.style.display = "flex";
    this.scannerStepMsg.textContent = "Verifying image quality & leaf framing...";
    this.scannerProgressFill.style.width = "20%";

    // Run automated quality inspection if ImageQualityChecker exists
    let qualityResult = { pass: true, brightness: 80, sharpness: 80, framing: 80, issues: [] };
    if (ImageQualityChecker && ImageQualityChecker.analyze) {
      qualityResult = await ImageQualityChecker.analyze(this.currentImage);
    }

    setTimeout(() => {
      this.scannerOverlay.style.display = "none";
      if (!qualityResult.pass) {
        this.showQualityFailure(qualityResult);
      } else {
        this.executeAIAnalysis();
      }
    }, 450);
  }

  showQualityFailure(quality) {
    this.previewCard.style.display = "none";
    this.qualityAlertCard.style.display = "block";

    this.brightVal.textContent = `${quality.brightness}%`;
    this.brightProgress.style.width = `${quality.brightness}%`;
    this.brightProgress.className = `quality-progress-fill ${quality.brightness >= 45 ? "pass" : "fail"}`;

    this.sharpVal.textContent = `${quality.sharpness}%`;
    this.sharpProgress.style.width = `${quality.sharpness}%`;
    this.sharpProgress.className = `quality-progress-fill ${quality.sharpness >= 40 ? "pass" : "fail"}`;

    this.frameVal.textContent = `${quality.framing}%`;
    this.frameProgress.style.width = `${quality.framing}%`;
    this.frameProgress.className = `quality-progress-fill ${quality.framing >= 35 ? "pass" : "fail"}`;

    this.qualityIssuesList.innerHTML = (quality.issues || [])
      .map((issue) => `<li>• ${issue}</li>`)
      .join("");

    if (this.app.showToast) this.app.showToast("⚠️ Image Quality Too Low for accurate diagnosis", "warning");
  }

  // --- Send Image to Python Flask Backend ---
async fetchPredictionFromBackend(base64Image) {
    const endpoint = localStorage.getItem("agrismart_api_endpoint") || "/api/predict";
    const userStr = localStorage.getItem("agrismart_user") || sessionStorage.getItem("agrismart_user");
    const userObj = userStr ? JSON.parse(userStr) : { userId: "guest_session" };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
          image: base64Image,
          userId: userObj.userId // Attach the specific user ID
      })
    });

    if (!response.ok) throw new Error(`HTTP: ${response.status}`);
    return await response.json();
  }

  // --- Stepped AI Scanning Animation & Inference ---
  async executeAIAnalysis() {
    this.qualityAlertCard.style.display = "none";
    this.previewCard.style.display = "flex";
    this.scannerOverlay.style.display = "flex";

    // Step 1: Scanning animation
    this.scannerStepMsg.textContent = "AI is analyzing your crop...";
    this.scannerProgressFill.style.width = "35%";
    await this.delay(650);

    // Step 2: Communication animation
    this.scannerStepMsg.textContent = "Sending image to Python Flask Backend...";
    this.scannerProgressFill.style.width = "70%";
    await this.delay(600);

    // Step 3: Fetch result from Python Flask Server
    this.scannerStepMsg.textContent = "Processing model response...";
    this.scannerProgressFill.style.width = "95%";

    try {
      const prediction = await this.fetchPredictionFromBackend(this.currentImage);

      // Map API fields if optional values are missing from model output
      prediction.crop = prediction.crop || "Tomato";
      prediction.scientific_name = prediction.scientific_name || "Solanum lycopersicum";
      prediction.pathogen = prediction.pathogen || "Alternaria solani";
      prediction.heatmapRegions = prediction.heatmapRegions || [];

      this.currentPrediction = prediction;

      await this.delay(400);
      this.scannerOverlay.style.display = "none";
      this.renderResultScreen(prediction);
      this.saveCurrentToHistory(false); // Silent auto-save to history

      if (this.app.chatbot) {
        this.app.chatbot.injectScanContext(prediction);
      }
    } catch (error) {
      console.error("Error connecting to Python backend:", error);
      this.scannerOverlay.style.display = "none";
      if (this.app.showToast) {
        this.app.showToast("❌ Unable to connect to Python Flask backend. Make sure app.py is running on port 5000.", "error");
      }
    }
  }

  renderResultScreen(pred) {
    this.previewCard.style.display = "none";
    this.resultContainer.style.display = "flex";

    // Set leaf image
    this.resultLeafImg.src = this.currentImage;

    // Configure Confidence Gauge (Circumference of r=36 is ~226.2)
    const confidencePct = Math.round(pred.confidence * 100);
    const circumference = 226.2;
    const offset = circumference - (confidencePct / 100) * circumference;

    this.gaugePercentText.textContent = `${confidencePct}%`;
    this.gaugeProgressCircle.style.strokeDasharray = circumference;
    this.gaugeProgressCircle.style.strokeDashoffset = offset;

    // Reset element classes using setAttribute for SVG safety
    this.resultHeaderBanner.className = "result-header-banner";
    this.gaugeProgressCircle.setAttribute("class", "gauge-progress-circle");
    this.resultTitle.className = "result-state-title";

    // Distinct Result States (Disease, Healthy, Uncertain)
    if (pred.health_status === "Healthy") {
      this.resultHeaderBanner.classList.add("healthy");
      this.gaugeProgressCircle.classList.add("healthy");
      this.resultTitle.classList.add("healthy");
      this.resultStateIcon.textContent = "✅";
      this.resultTitle.textContent = "Crop Appears Healthy";
      this.resultCropSubtitle.textContent = `${pred.crop} (${pred.scientific_name})`;
      this.healthBadge.className = "badge badge-healthy";
      this.healthBadge.textContent = "Healthy";
    } else if (pred.health_status === "Uncertain" || pred.confidence < 0.35) {
      this.resultHeaderBanner.classList.add("uncertain");
      this.gaugeProgressCircle.classList.add("uncertain");
      this.resultTitle.classList.add("uncertain");
      this.resultStateIcon.textContent = "⚠️";
      this.resultTitle.textContent = "Uncertain Result";
      this.resultCropSubtitle.textContent = "AI could not confidently identify the crop condition";
      this.healthBadge.className = "badge badge-uncertain";
      this.healthBadge.textContent = "Low Confidence";
    } else {
      // Disease Detected
      this.resultHeaderBanner.classList.add("disease");
      this.gaugeProgressCircle.classList.add("disease");
      this.resultTitle.classList.add("disease");
      this.resultStateIcon.textContent = "🦠";
      this.resultTitle.textContent = pred.class;
      this.resultCropSubtitle.textContent = `${pred.crop} • Pathogen: ${pred.pathogen} (${pred.scientific_name})`;
      this.healthBadge.className = "badge badge-risk";
      this.healthBadge.textContent = "Health Status: At Risk";
    }

    // Visual Explanation Indicators
    this.indicatorLegendList.innerHTML = (pred.explanation || [])
      .map(
        (exp) => `
        <div class="legend-item">
          <span class="legend-dot" style="background-color: ${exp.color}; box-shadow: 0 0 8px ${exp.color};"></span>
          <div>
            <div>${exp.label}</div>
            <div style="font-size: 0.78rem; font-weight: normal; color: var(--text-muted);">${exp.description}</div>
          </div>
        </div>
      `
      )
      .join("");

    this.aiExplanationText.textContent = pred.text_explanation || "";

    // Precautions List
    this.precautionList.innerHTML = (pred.precautions || [])
      .map(
        (p) => `
        <li class="precaution-item">
          <span class="precaution-icon">🌱</span>
          <span>${p}</span>
        </li>
      `
      )
      .join("");

    // Scroll to results smoothly
    this.resultContainer.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  redrawHeatmap() {
    if (!this.currentPrediction) return;
    this.heatmapCanvas.width = this.resultLeafImg.clientWidth || 400;
    this.heatmapCanvas.height = this.resultLeafImg.clientHeight || 320;
    if (this.aiEngine && this.aiEngine.renderHeatmap) {
      this.aiEngine.renderHeatmap(
        this.heatmapCanvas,
        this.resultLeafImg,
        this.currentPrediction.heatmapRegions || [],
        this.isHeatmapActive
      );
    }
  }

  speakDiagnosis() {
    if (!this.currentPrediction) return;
    const precautionsText = (this.currentPrediction.precautions || []).join(". ");
    const textToSpeak = `${this.currentPrediction.class}. Confidence ${Math.round(this.currentPrediction.confidence * 100)} percent. Status: ${this.currentPrediction.health_status}. Recommended actions: ${precautionsText}. Always consult a local agricultural officer before applying chemical treatments.`;
    if (this.app.speak) this.app.speak(textToSpeak, this.btnListenAudio);
  }

  saveCurrentToHistory(isUserAction = false) {
    if (!this.currentPrediction) return;
    const record = {
      id: "scan_" + Date.now(),
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      crop: this.currentPrediction.crop,
      result: this.currentPrediction.class,
      confidence: Math.round(this.currentPrediction.confidence * 100),
      status: this.currentPrediction.health_status,
      image: this.currentImage,
      prediction: this.currentPrediction
    };

    if (this.historyManager && this.historyManager.addRecord) {
      this.historyManager.addRecord(record);
    }

    // Immediately trigger score calculation on the dashboard controller
    const dashboard = this.app?.dashboardController || this.app?.dashboard;
    if (dashboard && typeof dashboard.updateOverallCropHealth === "function") {
      dashboard.updateOverallCropHealth();
    }
  }

  // --- Live Camera Management ---
  async openCameraModal() {
    this.cameraModal.classList.add("open");
    try {
      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      this.cameraVideo.srcObject = this.cameraStream;
    } catch (err) {
      console.warn("Camera access unavailable:", err);
      if (this.app.showToast) this.app.showToast("Camera access unavailable. Please upload an image file instead.", "info");
    }
  }

  closeCameraModal() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach((track) => track.stop());
      this.cameraStream = null;
    }
    this.cameraModal.classList.remove("open");
  }

  captureCameraSnapshot() {
    const canvas = document.createElement("canvas");
    canvas.width = this.cameraVideo.videoWidth || 640;
    canvas.height = this.cameraVideo.videoHeight || 480;
    const ctx = canvas.getContext("2d");

    if (this.cameraStream && this.cameraVideo.videoWidth) {
      ctx.drawImage(this.cameraVideo, 0, 0, canvas.width, canvas.height);
      this.currentImage = canvas.toDataURL("image/jpeg", 0.9);
      this.currentFileName = `camera_leaf_${Date.now().toString().slice(-4)}.jpg`;
      this.currentFileSize = "1.8 MB";

      this.closeCameraModal();
      this.showPreview();
    }
  }

  toggleCameraFacing() {
    this.closeCameraModal();
    setTimeout(() => this.openCameraModal(), 200);
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}