// Sample daily farm task dataset
const initialTasks = [
  {
    id: 1,
    time: "07:00 AM",
    title: "Morning Field Scouting – Zone A",
    desc: "Inspect leaf underside on tomato crops for early signs of blight spots or mildew.",
    priority: "High",
    completed: false
  },
  {
    id: 2,
    time: "09:30 AM",
    title: "IoT Sensor Check & Calibration",
    desc: "Verify telemetry node soil moisture readings against manual tensionometer values.",
    priority: "Medium",
    completed: false
  },
  {
    id: 3,
    time: "01:30 PM",
    title: "Foliar Pruning & Canopy Airflow Maintenance",
    desc: "Prune lower infected foliage in Plot B to increase canopy airflow and prevent fungal spread.",
    priority: "High",
    completed: true
  },
  {
    id: 4,
    time: "05:00 PM",
    title: "Review Rain Radar & Adjust Irrigation Schedule",
    desc: "Cross-reference local microclimate forecast to confirm delayed irrigation protocol.",
    priority: "Low",
    completed: false
  }
];

// Initialize and render Today's Plan
export function initTodayPlan() {
  updateDateHeader();
  renderTasks(initialTasks);
}

// 1. Populate the date header
function updateDateHeader() {
  const dateEl = document.getElementById('todayDate');
  if (!dateEl) return;
  
  const today = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
  dateEl.textContent = today.toLocaleDateString('en-US', options);
}

// 2. Render tasks into the container
export function renderTasks(tasks) {
  const container = document.getElementById('taskList');
  if (!container) return;

  if (tasks.length === 0) {
    container.innerHTML = `
      <div style="padding: 2rem; text-align: center; color: var(--text-muted);">
        🎉 All tasks completed for today!
      </div>`;
    return;
  }

  container.innerHTML = tasks.map(task => `
    <div class="task-card-item ${task.completed ? 'is-completed' : ''}" data-task-id="${task.id}">
      <div class="task-left">
        <input 
          type="checkbox" 
          class="task-checkbox" 
          id="task-chk-${task.id}" 
          ${task.completed ? 'checked' : ''} 
          aria-label="Mark task complete"
        />
        <div class="task-details">
          <div class="task-time">${task.time}</div>
          <h4 class="task-title">${task.title}</h4>
          <p class="task-desc">${task.desc}</p>
        </div>
      </div>
      <div class="task-right">
        <span class="badge ${task.priority === 'High' ? 'badge-risk' : 'badge-healthy'}">
          ${task.priority} Priority
        </span>
      </div>
    </div>
  `).join('');

  // Attach completion toggle listeners
  container.querySelectorAll('.task-checkbox').forEach(chk => {
    chk.addEventListener('change', (e) => {
      const taskId = Number(e.target.closest('.task-card-item').dataset.taskId);
      const targetTask = initialTasks.find(t => t.id === taskId);
      if (targetTask) {
        targetTask.completed = e.target.checked;
        renderTasks(initialTasks);
      }
    });
  });
}

// Run on page load
document.addEventListener('DOMContentLoaded', initTodayPlan);