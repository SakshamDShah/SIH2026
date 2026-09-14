// dashboard.js - Farmer Dashboard & Hackathon Bonus Modules Advisor
// Implements Smart Irrigation (B), Sustainability Score (D), and Simulated IoT Telemetry (F)

export class DashboardController {
  constructor(app) {
    this.app = app;
    this.iotTimer = null;
    this.sparklineHistory = [32, 33, 31, 32, 34, 33, 32, 35, 34, 32];
    this.isRaining = false;

    this.fetchLiveWeather();
    this.initDOM();
    this.startIoTStream();
    this.updateOverallCropHealth();
    this.updateDiseaseRisk();
    this.updateSoilMoisture(32, "Loamy");
  }

  // Common Multi-source Scan History Extractor
 getScanHistory() {
  let history = [];

  // 1. Check historyManager in memory
  if (this.app?.historyManager) {
    if (typeof this.app.historyManager.getHistory === "function") {
      history = this.app.historyManager.getHistory() || [];
    } else if (Array.isArray(this.app.historyManager.history)) {
      history = this.app.historyManager.history;
    } else if (Array.isArray(this.app.historyManager.records)) {
      history = this.app.historyManager.records;
    }
  }

  // 2. Check localStorage if history is still empty
  if (!history || history.length === 0) {
    const keys = ["agri_scan_history", "scan_history", "agrismart_history", "agrismart_scan_history"];
    for (const key of keys) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            history = parsed;
            break;
          }
        }
      } catch (e) {}
    }
  }

  return history || [];
}

  fetchLiveWeather() {
    const defaultLat = 23.0225; // Default regional coordinates (Ahmedabad)
    const defaultLon = 72.5714;

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("📍 Location detected:", position.coords.latitude, position.coords.longitude);
          this.loadWeatherAdvisory(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("⚠️ Geolocation timeout or denied. Using regional fallback coordinates:", error.message);
          this.loadWeatherAdvisory(defaultLat, defaultLon);
        },
        { timeout: 4000, enableHighAccuracy: false, maximumAge: 60000 }
      );
    } else {
      this.loadWeatherAdvisory(defaultLat, defaultLon);
    }
  }

  async loadWeatherAdvisory(lat, lon) {
    const savedEndpoint = localStorage.getItem("agrismart_api_endpoint") || "/api/predict";
    const weatherUrl = savedEndpoint.replace("/predict", "/weather-advisory");

    try {
      const response = await fetch(weatherUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lon })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Failed to load weather");

      // Track live rain/thunderstorm status for Soil Moisture decisions
      const cond = (data.condition || "").toLowerCase();
      this.isRaining = (data.rain_chance > 50) || cond.includes("rain") || cond.includes("thunderstorm");

      // 1. Update Weather KPI Card
      const tempEl = document.getElementById("dashWeatherTemp");
      const descEl = document.getElementById("dashWeatherDesc");
      const detailsEl = document.getElementById("dashWeatherDetails");

      if (tempEl) tempEl.textContent = `${data.temperature}°C`;
      if (descEl) descEl.textContent = data.condition;
      if (detailsEl) detailsEl.textContent = `Humidity: ${data.humidity}% • Rain chance: ${data.rain_chance}%`;

      // 2. Update Active Warning Banner
      const warningEl = document.getElementById("liveWarningText");
      if (warningEl) {
        warningEl.innerHTML = `<strong>Microclimate Advisory:</strong> ${data.ai_advisory}`;
      }

     // 3. Update Smart Irrigation Card
const irrigationTitle = document.querySelector(".irrigation-rec-title");
const irrigationText = document.querySelector(".irrigation-rec-text");
if (irrigationTitle && irrigationText) {
  irrigationTitle.textContent = `${data.irrigation_action}: ${data.condition}`;
  irrigationText.textContent = this.isRaining 
    ? "Postpone all planned watering cycles due to imminent rainfall to prevent soil waterlogging and root rot."
    : (data.warning_banner || "Normal monitoring recommended. Maintain balanced field irrigation.");
}

      const currentMoisture = parseFloat(this.iotMoistureVal?.textContent || 32);
      this.updateSoilMoisture(currentMoisture, "Loamy");

      console.log("✅ Weather advisory updated successfully.");

    } catch (err) {
      console.error("❌ Weather advisory fetch failed:", err);

      const descEl = document.getElementById("dashWeatherDesc");
      const tempEl = document.getElementById("dashWeatherTemp");
      const detailsEl = document.getElementById("dashWeatherDetails");

      if (descEl) descEl.textContent = "Offline (Local)";
      if (tempEl && tempEl.textContent.includes("--")) tempEl.textContent = "28°C";
      if (detailsEl) detailsEl.textContent = "Humidity: 65% • Rain chance: 30%";
    }
  }

  initDOM() {
    this.iotCanvas = document.getElementById("iotSparklineCanvas");
    this.iotMoistureVal = document.getElementById("iotMoistureVal") || document.getElementById("soilMoistureValue");
    this.iotSoilTempVal = document.getElementById("iotSoilTempVal");
    this.iotHumidityVal = document.getElementById("iotHumidityVal");
    this.iotNitrogenVal = document.getElementById("iotNitrogenVal");

    this.weatherTemp = document.getElementById("dashWeatherTemp");
    this.weatherDesc = document.getElementById("dashWeatherDesc");
    this.irrigationStatusText = document.getElementById("irrigationStatusText");
    this.sustainabilityScoreNum = document.getElementById("sustainabilityScoreNum");
  }

  startIoTStream() {
    this.iotTimer = setInterval(() => {
      this.tickIoTTelemetry();
    }, 3500);
    this.drawSparkline();
  }

  tickIoTTelemetry() {
    const baseMoisture = 32;
    const delta = (Math.random() * 2 - 1).toFixed(1);
    const currentMoisture = (baseMoisture + parseFloat(delta)).toFixed(1);

    if (this.iotMoistureVal) {
      this.iotMoistureVal.textContent = `${currentMoisture}%`;
    }

    this.updateSoilMoisture(parseFloat(currentMoisture), "Loamy");

    const currentSoilTemp = (24.2 + (Math.random() * 0.6 - 0.3)).toFixed(1);
    if (this.iotSoilTempVal) {
      this.iotSoilTempVal.textContent = `${currentSoilTemp}°C`;
    }

    const currentHumidity = Math.round(68 + (Math.random() * 4 - 2));
    if (this.iotHumidityVal) {
      this.iotHumidityVal.textContent = `${currentHumidity}%`;
    }

    this.sparklineHistory.push(parseFloat(currentMoisture));
    if (this.sparklineHistory.length > 20) {
      this.sparklineHistory.shift();
    }

    this.drawSparkline();
  }

  drawSparkline() {
    if (!this.iotCanvas) return;
    const ctx = this.iotCanvas.getContext("2d");
    const w = this.iotCanvas.width = this.iotCanvas.clientWidth || 300;
    const h = this.iotCanvas.height = this.iotCanvas.clientHeight || 80;

    ctx.clearRect(0, 0, w, h);

    const data = this.sparklineHistory;
    const min = Math.min(...data) - 2;
    const max = Math.max(...data) + 2;
    const range = max - min || 1;

    ctx.strokeStyle = "#2d6a4f";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();

    data.forEach((val, i) => {
      const x = (i / (data.length - 1)) * (w - 20) + 10;
      const y = h - ((val - min) / range) * (h - 24) - 12;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgba(82, 183, 136, 0.25)");
    grad.addColorStop(1, "rgba(82, 183, 136, 0.0)");

    ctx.lineTo((w - 20) + 10, h);
    ctx.lineTo(10, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    const lastX = (w - 20) + 10;
    const lastY = h - ((data[data.length - 1] - min) / range) * (h - 24) - 12;
    ctx.fillStyle = "#1b4332";
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Calculate crop health dynamically based on up to 10 recent scans
  updateOverallCropHealth() {
    const healthValEl = document.getElementById("cropHealthValue");
    const healthStatusEl = document.getElementById("cropHealthStatus");
    const healthSubtextEl = document.getElementById("cropHealthSubtext");
    const healthInlineEl = document.getElementById("cropHealthInlineLabel");

    const history = this.getScanHistory();
    const recentScans = history.slice(0, 10);
    const totalScans = recentScans.length;

    if (totalScans === 0) {
      if (healthValEl) healthValEl.textContent = "0%";
      if (healthInlineEl) healthInlineEl.textContent = "No Scans";
      if (healthStatusEl) {
        healthStatusEl.textContent = "Pending";
        healthStatusEl.className = "badge badge-uncertain";
        healthStatusEl.style.cssText = "padding: 4px 10px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; background-color: #f3f4f6; color: #4b5563;";
      }
      if (healthSubtextEl) healthSubtextEl.textContent = "Upload scans to calculate health";
      return;
    }

    const healthyCount = recentScans.filter((scan) => {
      const status = (scan.status || scan.prediction?.health_status || "").toLowerCase();
      const result = (scan.result || scan.disease || scan.prediction?.class || "").toLowerCase();
      return status === "healthy" || result.includes("healthy") || result.includes("no disease") || result.includes("no leaf disease");
    }).length;

    const healthPercentage = Math.round((healthyCount / totalScans) * 100);

    if (healthValEl) {
      healthValEl.textContent = `${healthPercentage}%`;
    }

    if (healthInlineEl && healthStatusEl) {
      if (healthPercentage >= 80) {
        healthInlineEl.textContent = "Optimal";
        healthStatusEl.textContent = "Healthy Field";
        healthStatusEl.className = "badge badge-healthy";
        healthStatusEl.style.cssText = "padding: 4px 10px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; background-color: #d1fae5; color: #065f46;";
      } else if (healthPercentage >= 50) {
        healthInlineEl.textContent = "Moderate";
        healthStatusEl.textContent = "Moderate Risk";
        healthStatusEl.className = "badge badge-warning";
        healthStatusEl.style.cssText = "padding: 4px 10px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; background-color: #fef3c7; color: #92400e;";
      } else {
        healthInlineEl.textContent = "Critical";
        healthStatusEl.textContent = "Critical Attention";
        healthStatusEl.className = "badge badge-danger";
        healthStatusEl.style.cssText = "padding: 4px 10px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; background-color: #fee2e2; color: #991b1b;";
      }
    }

    if (healthSubtextEl) {
      healthSubtextEl.textContent = `Based on ${totalScans} recent zone scan${totalScans === 1 ? "" : "s"}`;
    }
  }

  // DYNAMIC DISEASE RISK LOGIC BASED ON SCAN HISTORY
  updateDiseaseRisk() {
    const riskTitleEl = document.getElementById("diseaseRiskLevel");
    const riskBadgeEl = document.getElementById("diseaseRiskBadge");
    const riskSubtextEl = document.getElementById("diseaseRiskSubtext");

    const history = this.getScanHistory().slice(0, 10);

    // Identify diseased/infected scans
    const diseasedScans = history.filter((scan) => {
      const status = (scan.status || "").toLowerCase();
      const result = (scan.result || scan.disease || "").toLowerCase();
      const isHealthy = status === "healthy" || result.includes("healthy") || result.includes("no leaf");
      return !isHealthy;
    });

    const infectedCount = diseasedScans.length;

    // Find primary disease name from infected records
    const diseaseCounts = {};
    diseasedScans.forEach((scan) => {
      let name = scan.result || scan.disease || "Blight";
      if (name.includes("-")) name = name.split("-").pop().trim();
      diseaseCounts[name] = (diseaseCounts[name] || 0) + 1;
    });

    const mainDisease = Object.keys(diseaseCounts).reduce((a, b) => (diseaseCounts[a] > diseaseCounts[b] ? a : b), "Blight");

    if (infectedCount === 0) {
      if (riskTitleEl) {
        riskTitleEl.textContent = "Low";
        riskTitleEl.style.color = "#15803d";
      }
      if (riskBadgeEl) {
        riskBadgeEl.textContent = "Status: Clear";
        riskBadgeEl.style.cssText = "padding: 4px 10px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; background-color: #d1fae5; color: #065f46;";
      }
      if (riskSubtextEl) riskSubtextEl.textContent = "No active spots flagged";
    } else if (infectedCount <= 4) {
      if (riskTitleEl) {
        riskTitleEl.textContent = "Moderate";
        riskTitleEl.style.color = "#b91c1c";
      }
      if (riskBadgeEl) {
        riskBadgeEl.textContent = `At Risk: ${mainDisease}`;
        riskBadgeEl.style.cssText = "padding: 4px 10px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; background-color: #fee2e2; color: #991b1b;";
      }
      if (riskSubtextEl) riskSubtextEl.textContent = `${infectedCount} spots flagged in field`;
    } else {
      if (riskTitleEl) {
        riskTitleEl.textContent = "High";
        riskTitleEl.style.color = "#991b1b";
      }
      if (riskBadgeEl) {
        riskBadgeEl.textContent = `Outbreak: ${mainDisease}`;
        riskBadgeEl.style.cssText = "padding: 4px 10px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; background-color: #fee2e2; color: #991b1b;";
      }
      if (riskSubtextEl) riskSubtextEl.textContent = `${infectedCount} spots flagged in field`;
    }
  }

  // DYNAMIC SOIL MOISTURE LOGIC
  updateSoilMoisture(moisturePercent = 32, soilType = "Loamy") {
    const valEl = document.getElementById("soilMoistureValue") || document.getElementById("iotMoistureVal");
    const typeEl = document.getElementById("soilTypeLabel");
    const badgeEl = document.getElementById("soilMoistureBadge");
    const subtextEl = document.getElementById("soilMoistureSubtext");

    if (valEl) valEl.textContent = `${moisturePercent}%`;
    if (typeEl) typeEl.textContent = soilType;

    if (moisturePercent < 20) {
      if (badgeEl) {
        badgeEl.textContent = "Low Level";
        badgeEl.style.cssText = "padding: 4px 10px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; background-color: #fee2e2; color: #991b1b;";
      }
      if (subtextEl) subtextEl.textContent = "Irrigation cycle required";
    } else if (moisturePercent <= 60) {
      if (badgeEl) {
        badgeEl.textContent = "Good Level";
        badgeEl.style.cssText = "padding: 4px 10px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; background-color: #d1fae5; color: #065f46;";
      }
      if (subtextEl) {
        subtextEl.textContent = this.isRaining ? "Postpone (Rain expected)" : "Next cycle in 24h";
      }
    } else {
      if (badgeEl) {
        badgeEl.textContent = "Saturated";
        badgeEl.style.cssText = "padding: 4px 10px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; background-color: #fef3c7; color: #92400e;";
      }
      if (subtextEl) subtextEl.textContent = "Ensure field drainage";
    }
  }

  destroy() {
    if (this.iotTimer) clearInterval(this.iotTimer);
  }
}