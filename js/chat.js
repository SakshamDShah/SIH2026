// chat.js - Farmer Chatbot Integration
export class ChatController {
constructor(app) {
this.app = app;
this.history = [];
this.isOpen = false;
this.initDOM();
this.bindEvents();
}

initDOM() {
this.chatToggleBtn = document.getElementById("chatToggleBtn");
this.chatWindow = document.getElementById("chatWindow");
this.closeChatBtn = document.getElementById("closeChatBtn");
this.chatMessages = document.getElementById("chatMessages");
this.chatInput = document.getElementById("chatInput");
this.sendChatBtn = document.getElementById("sendChatBtn");
}

bindEvents() {
this.chatToggleBtn?.addEventListener("click", () => this.toggleChat(true));
this.closeChatBtn?.addEventListener("click", () => this.toggleChat(false));
this.sendChatBtn?.addEventListener("click", () => this.handleSend());
this.chatInput?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") this.handleSend();
});
}

toggleChat(open) {
this.isOpen = open;
this.chatWindow.style.display = open ? "flex" : "none";
this.chatToggleBtn.style.display = open ? "none" : "flex";
if (open) this.chatInput.focus();
}

// Called automatically when a scan finishes
injectScanContext(prediction) {
if (prediction.health_status === "Healthy" || prediction.health_status === "Uncertain") return;

const contextMsg = `I just scanned my ${prediction.crop} and the AI detected ${prediction.class}. What is the best non-chemical way to treat this?`;

this.toggleChat(true);
this.chatInput.value = contextMsg;
this.handleSend();
}

async handleSend() {
const text = this.chatInput.value.trim();
if (!text) return;

this.appendMessage("user", text);
this.chatInput.value = "";

const typingIndicator = this.appendMessage("model", "Thinking...");

try {
  // Re-use the existing base API URL but point to the chat route
  let baseEndpoint = localStorage.getItem("agrismart_api_endpoint") || "/api/predict";
  const chatEndpoint = baseEndpoint.replace("/predict", "/chat");
  
  const response = await fetch(chatEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text, history: this.history })
  });

  const data = await response.json();
  
  if (data.success) {
    typingIndicator.textContent = data.reply;
    // Update history ONLY after successful network call
    this.history.push({ role: "user", content: text });
    this.history.push({ role: "model", content: data.reply });
  } else {
    typingIndicator.textContent = "Error: The backend could not process this request.";
  }
} catch (e) {
  typingIndicator.textContent = "Network error connecting to the AI. Ensure app.py is running.";
}
}

appendMessage(role, text) {
const msgDiv = document.createElement("div");
msgDiv.className = role === "user" ? "msg-user" : "msg-model";
msgDiv.textContent = text;
this.chatMessages.appendChild(msgDiv);
this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
return msgDiv;
}
}