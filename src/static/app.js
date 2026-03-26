document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Navigation
  const navButtons = document.querySelectorAll(".nav-btn");
  const pages = document.querySelectorAll(".page");

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      navButtons.forEach((b) => b.classList.remove("active"));
      pages.forEach((p) => p.classList.add("hidden"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.section).classList.remove("hidden");
    });
  });

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // ── Daily Routine ──────────────────────────────────────────────────────────

  const routineList = document.getElementById("routine-list");
  const addTaskForm = document.getElementById("add-task-form");
  const routineMessage = document.getElementById("routine-message");

  function showRoutineMessage(text, type) {
    routineMessage.textContent = text;
    routineMessage.className = type;
    routineMessage.classList.remove("hidden");
    setTimeout(() => routineMessage.classList.add("hidden"), 4000);
  }

  async function fetchRoutine() {
    try {
      const response = await fetch("/routine");
      const tasks = await response.json();
      routineList.innerHTML = "";

      if (tasks.length === 0) {
        routineList.innerHTML = "<p>No tasks yet. Add your first task!</p>";
        return;
      }

      tasks.forEach((task) => {
        const card = document.createElement("div");
        card.className = `routine-card${task.completed ? " completed" : ""}`;
        card.innerHTML = `
          <div class="routine-card-info">
            <span class="routine-time">${task.time}</span>
            <div>
              <h4>${task.title}</h4>
              ${task.description ? `<p>${task.description}</p>` : ""}
            </div>
          </div>
          <div class="routine-card-actions">
            <button class="btn-complete" data-id="${task.id}" title="${task.completed ? "Mark incomplete" : "Mark complete"}">
              ${task.completed ? "↩ Undo" : "✔ Done"}
            </button>
            <button class="btn-delete" data-id="${task.id}" title="Delete task">🗑</button>
          </div>
        `;
        routineList.appendChild(card);
      });

      // Wire up buttons
      routineList.querySelectorAll(".btn-complete").forEach((btn) => {
        btn.addEventListener("click", () => toggleTask(btn.dataset.id));
      });
      routineList.querySelectorAll(".btn-delete").forEach((btn) => {
        btn.addEventListener("click", () => deleteTask(btn.dataset.id));
      });
    } catch (error) {
      routineList.innerHTML = "<p>Failed to load routine. Please try again later.</p>";
      console.error("Error fetching routine:", error);
    }
  }

  async function toggleTask(taskId) {
    try {
      const response = await fetch(`/routine/${encodeURIComponent(taskId)}/complete`, {
        method: "PUT",
      });
      if (response.ok) {
        fetchRoutine();
      } else {
        const result = await response.json();
        showRoutineMessage(result.detail || "Failed to update task.", "error");
      }
    } catch (error) {
      showRoutineMessage("Failed to update task.", "error");
      console.error("Error toggling task:", error);
    }
  }

  async function deleteTask(taskId) {
    try {
      const response = await fetch(`/routine/${encodeURIComponent(taskId)}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (response.ok) {
        showRoutineMessage(result.message, "success");
        fetchRoutine();
      } else {
        showRoutineMessage(result.detail || "Failed to delete task.", "error");
      }
    } catch (error) {
      showRoutineMessage("Failed to delete task.", "error");
      console.error("Error deleting task:", error);
    }
  }

  addTaskForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = document.getElementById("task-title").value;
    const time = document.getElementById("task-time").value;
    const description = document.getElementById("task-description").value;

    try {
      const response = await fetch("/routine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, time, description }),
      });
      const result = await response.json();
      if (response.ok) {
        showRoutineMessage(`"${result.title}" added to your routine!`, "success");
        addTaskForm.reset();
        fetchRoutine();
      } else {
        showRoutineMessage(result.detail || "Failed to add task.", "error");
      }
    } catch (error) {
      showRoutineMessage("Failed to add task.", "error");
      console.error("Error adding task:", error);
    }
  });

  // Initialize app
  fetchActivities();
  fetchRoutine();
});
