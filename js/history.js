// history.js - Scan History Manager, Filtering & Detail Modal Inspection
import { sampleImages } from "../assets/samples/sampleImages.js";

const DEFAULT_HISTORY = [
  {
    id: "scan_10sep_earlyblight",
    date: "10 Sep",
    crop: "Tomato",
    result: "Tomato Early Blight",
    confidence: 91,
    status: "At Risk",
    image: sampleImages.earlyBlight.dataUrl,
    prediction: {
      class: "Tomato Early Blight",
      crop: "Tomato",
      scientific_name: "Alternaria solani",
      pathogen: "Fungal pathogen",
      confidence: 0.91,
      health_status: "At Risk",
      explanation: [
        { label: "Brown spots detected", color: "#ef4444", description: "Concentric target-like rings with dark brown necrotic centers." },
        { label: "Leaf discoloration detected", color: "#f97316", description: "Chlorotic yellow halo surrounding necrotic lesions." },
        { label: "Irregular pattern detected", color: "#eab308", description: "Asymmetric fungal perimeter propagating on leaf blade." }
      ],
      text_explanation: "Brown lesions with concentric rings and surrounding yellowing were the strongest visual indicators associated with this prediction.",
      precautions: [
        "Remove severely affected leaves and destroy them away from the field.",
        "Avoid unnecessary overhead watering — use drip irrigation.",
        "Monitor nearby plants regularly within 5-meter radius.",
        "Recheck the crop regularly in 48–72 hours."
      ],
      heatmapRegions: [
        { x: 0.64, y: 0.44, radius: 0.18, color: "rgba(239, 68, 68, 0.75)", label: "Concentric Spot" },
        { x: 0.37, y: 0.60, radius: 0.16, color: "rgba(249, 115, 22, 0.7)", label: "Chlorotic Spot" }
      ]
    }
  },
  {
    id: "scan_08sep_healthy",
    date: "08 Sep",
    crop: "Tomato",
    result: "Tomato Healthy",
    confidence: 94,
    status: "Healthy",
    image: sampleImages.healthyTomato.dataUrl,
    prediction: {
      class: "Tomato Healthy",
      crop: "Tomato",
      scientific_name: "Solanum lycopersicum",
      pathogen: "None (Healthy)",
      confidence: 0.94,
      health_status: "Healthy",
      explanation: [
        { label: "Uniform chlorophyll distribution", color: "#16a34a", description: "Vigorous green leaf tissue with no spotting." }
      ],
      text_explanation: "The leaf displays consistent chlorophyll concentration with no visible necrotic spots or fungal sporulation.",
      precautions: [
        "Continue regular crop monitoring and maintain appropriate irrigation and crop care.",
        "Ensure balanced soil moisture and inspect weekly for insect pests."
      ],
      heatmapRegions: [
        { x: 0.5, y: 0.45, radius: 0.28, color: "rgba(34, 197, 94, 0.4)", label: "Vigorous Green Leaf" }
      ]
    }
  },
  {
    id: "scan_05sep_lateblight",
    date: "05 Sep",
    crop: "Potato",
    result: "Potato Late Blight",
    confidence: 89,
    status: "At Risk",
    image: sampleImages.potatoLateBlight.dataUrl,
    prediction: {
      class: "Potato Late Blight",
      crop: "Potato",
      scientific_name: "Phytophthora infestans",
      pathogen: "Oomycete pathogen",
      confidence: 0.89,
      health_status: "At Risk",
      explanation: [
        { label: "Water-soaked dark lesions", color: "#b91c1c", description: "Large spreading necrotic areas." }
      ],
      text_explanation: "Rapidly spreading irregular dark brown water-soaked lesions detected on leaf margins.",
      precautions: [
        "Rogue out and destroy infected potato vines immediately.",
        "Cease overhead watering to prevent spore dispersal in high humidity."
      ],
      heatmapRegions: [
        { x: 0.65, y: 0.48, radius: 0.22, color: "rgba(220, 38, 38, 0.75)", label: "Necrotic Core" }
      ]
    }
  }
];

export class HistoryManager {
  constructor(app) {
    this.app = app;
    this.records = this.loadRecords();

    this.initDOM();
    this.bindEvents();
    this.renderTable();
    this.renderDashboardRecent();
  }

  loadRecords() {
    // 1. Determine user type
    const userStr = localStorage.getItem("agrismart_user") || sessionStorage.getItem("agrismart_user");
    this.userObj = userStr ? JSON.parse(userStr) : { role: "guest", userId: "guest_session" };
    this.isGuest = this.userObj.role === "guest" || this.userObj.userId === "guest_session";
    
    // 2. Create a unique storage key per user
    this.storageKey = "agrismart_scan_history_" + (this.userObj.userId || "guest_session");

    try {
      if (this.isGuest) {
        // Guests use sessionStorage (wiped on logout/close)
        const stored = sessionStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
      } else {
        // Logged-in users use localStorage
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
      }
    } catch (e) {
      console.warn("Failed to load history:", e);
    }
    return [];
  }

  saveRecords() {
    try {
      const lightweightRecords = this.records.map(record => {
        const { image, ...rest } = record;
        return rest;
      });
      
      if (this.isGuest) {
        // Guest data dies when session is cleared or tab closed
        sessionStorage.setItem(this.storageKey, JSON.stringify(lightweightRecords));
      } else {
        // Real user data persists locally
        localStorage.setItem(this.storageKey, JSON.stringify(lightweightRecords));
      }
    } catch (e) {
      console.warn("Storage limit reached.");
    }
  }

  addRecord(record) {
    // Prepend new record to start
    this.records.unshift(record);
    this.saveRecords();
    this.renderTable();
    this.renderDashboardRecent();
  }

  initDOM() {
    this.tableBody = document.getElementById("historyTableBody");
    this.searchInput = document.getElementById("historySearchInput");
    this.statusFilter = document.getElementById("historyStatusFilter");
    this.dashRecentTableBody = document.getElementById("dashRecentTableBody");

    // Detail Modal Elements
    this.modal = document.getElementById("historyDetailModal");
    this.modalCloseBtn = document.getElementById("modalCloseBtn");
    this.modalImg = document.getElementById("modalDetailImg");
    this.modalCanvas = document.getElementById("modalDetailCanvas");
    this.modalTitle = document.getElementById("modalDetailTitle");
    this.modalMeta = document.getElementById("modalDetailMeta");
    this.modalBadge = document.getElementById("modalDetailBadge");
    this.modalConfidence = document.getElementById("modalDetailConfidence");
    this.modalExplanation = document.getElementById("modalDetailExplanation");
    this.modalPrecautions = document.getElementById("modalDetailPrecautions");
    this.modalPrintBtn = document.getElementById("modalPrintBtn");
    this.modalHeatmapToggle = document.getElementById("modalHeatmapToggle");
  }

  bindEvents() {
    this.searchInput?.addEventListener("input", () => this.renderTable());
    this.statusFilter?.addEventListener("change", () => this.renderTable());
    this.modalCloseBtn?.addEventListener("click", () => this.closeDetailModal());
    this.modal?.addEventListener("click", (e) => {
      if (e.target === this.modal) this.closeDetailModal();
    });

    this.modalPrintBtn?.addEventListener("click", () => window.print());
    this.modalHeatmapToggle?.addEventListener("change", (e) => {
      if (this.currentModalRecord) {
        this.drawModalHeatmap(e.target.checked);
      }
    });
  }

  renderTable() {
    if (!this.tableBody) return;
    const query = (this.searchInput?.value || "").toLowerCase().trim();
    const filter = this.statusFilter?.value || "all";

    const filtered = this.records.filter((rec) => {
      const matchQuery =
        rec.crop.toLowerCase().includes(query) ||
        rec.result.toLowerCase().includes(query) ||
        rec.date.toLowerCase().includes(query);
      const matchStatus = filter === "all" || rec.status.toLowerCase() === filter.toLowerCase();
      return matchQuery && matchStatus;
    });

    if (filtered.length === 0) {
      this.tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">
            No matching scan records found.
          </td>
        </tr>
      `;
      return;
    }

    this.tableBody.innerHTML = filtered
      .map(
        (rec) => `
        <tr data-id="${rec.id}">
          <td><strong style="color: var(--text-primary);">${rec.date}</strong></td>
          <td>
            <div class="crop-cell">
              <div class="crop-thumb">${
                rec.image
                  ? (rec.image.startsWith("data:image/svg") ? rec.image.replace('data:image/svg+xml;utf8,', '') : `<img src="${rec.image}" alt="${rec.crop}"/>`)
                  : `<span style="font-size:1.2rem;">🌿</span>`
              }</div>
              <div>
                <div class="crop-name">${rec.crop}</div>
              </div>
            </div>
          </td>
          <td class="disease-cell">${rec.result}</td>
          <td><strong>${rec.confidence}%</strong></td>
          <td>
            <span class="badge ${this.getBadgeClass(rec.status)}">${rec.status}</span>
          </td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="window.__agriHistory.openDetailModal('${rec.id}')">
              View Details ↗
            </button>
          </td>
        </tr>
      `
      )
      .join("");
  }

  renderDashboardRecent() {
    if (!this.dashRecentTableBody) return;
    const recent = this.records.slice(0, 4);

    this.dashRecentTableBody.innerHTML = recent
      .map(
        (rec) => `
        <tr onclick="window.__agriHistory.openDetailModal('${rec.id}')" style="cursor: pointer;">
          <td><span style="font-weight: 700;">${rec.date}</span></td>
          <td>${rec.crop}</td>
          <td><strong>${rec.result}</strong></td>
          <td>${rec.confidence}%</td>
          <td><span class="badge ${this.getBadgeClass(rec.status)}">${rec.status}</span></td>
        </tr>
      `
      )
      .join("");
  }

  getBadgeClass(status) {
    if (status === "Healthy") return "badge-healthy";
    if (status === "At Risk") return "badge-risk";
    return "badge-uncertain";
  }

  openDetailModal(id) {
    const record = this.records.find((r) => r.id === id);
    if (!record) return;
    this.currentModalRecord = record;

    this.modalTitle.textContent = record.result;
    this.modalMeta.textContent = `Scanned on ${record.date} • Crop: ${record.crop}`;
    this.modalBadge.className = `badge ${this.getBadgeClass(record.status)}`;
    this.modalBadge.textContent = record.status;
    this.modalConfidence.textContent = `${record.confidence}%`;

    if (record.image) {
      this.modalImg.src = record.image;
      this.modalImg.onload = () => {
        this.drawModalHeatmap(this.modalHeatmapToggle.checked);
      };
    } else {
      this.modalImg.src = "";
    }

    this.modalExplanation.textContent =
      record.prediction?.text_explanation || "Visual pattern indicators associated with this prediction.";

    if (record.prediction?.precautions) {
      this.modalPrecautions.innerHTML = record.prediction.precautions
        .map((p) => `<li style="margin-bottom: 0.4rem;">🌱 ${p}</li>`)
        .join("");
    }

    this.modal.classList.add("open");
  }

  drawModalHeatmap(show) {
    if (!this.modalCanvas || !this.currentModalRecord) return;
    const ctx = this.modalCanvas.getContext("2d");
    const w = (this.modalCanvas.width = this.modalImg.clientWidth || 360);
    const h = (this.modalCanvas.height = this.modalImg.clientHeight || 280);

    ctx.clearRect(0, 0, w, h);
    if (!show || !this.currentModalRecord.prediction?.heatmapRegions) return;

    this.currentModalRecord.prediction.heatmapRegions.forEach((region) => {
      const cx = region.x * w;
      const cy = region.y * h;
      const r = region.radius * Math.min(w, h);

      const radGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, r);
      radGrad.addColorStop(0, region.color || "rgba(239, 68, 68, 0.75)");
      radGrad.addColorStop(1, "rgba(234, 179, 8, 0)");

      ctx.save();
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
  }

  closeDetailModal() {
    this.modal.classList.remove("open");
    this.currentModalRecord = null;
  }
}