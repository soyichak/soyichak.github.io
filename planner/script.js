document.addEventListener("DOMContentLoaded", () => {
  const paletteEmojis = document.querySelectorAll(".emoji");
  const monthlyGrid = document.getElementById("monthly-grid");
  const clearBtn = document.getElementById("clear-all");
  const startDaySelect = document.getElementById("month-start-day");
  const totalDaysSelect = document.getElementById("month-total-days");
  const generateMonthBtn = document.getElementById("generate-month");

  /* Helpers */

  function initNotesArea(area) {
    const update = () => {
      if (area.textContent.trim().length === 0) {
        area.classList.add("is-empty");
      } else {
        area.classList.remove("is-empty");
      }
    };
    update();
    area.addEventListener("input", update);
  }

  function initDropzone(zone) {
    zone.classList.add("empty");

    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    });

    zone.addEventListener("dragenter", (e) => {
      e.preventDefault();
      zone.classList.add("drag-over");
    });

    zone.addEventListener("dragleave", () => {
      zone.classList.remove("drag-over");
    });

    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("drag-over");

      const emojiChar = e.dataTransfer.getData("text/plain");
      if (!emojiChar) return;

      // If this is a monthly calendar cell, enforce single emoji:
      const isMonthly = !!zone.closest(".monthly-grid");
      if (isMonthly) {
        zone.innerHTML = "";
      }

      const emojiEl = document.createElement("span");
      emojiEl.textContent = emojiChar;
      emojiEl.className = "calendar-emoji";

      zone.appendChild(emojiEl);
      zone.classList.remove("empty");
    });
  }

  function generateMonthGrid() {
    if (!monthlyGrid || !startDaySelect || !totalDaysSelect) return;

    const startIndex = parseInt(startDaySelect.value, 10) || 0; // 0 = Monday
    const totalDays = parseInt(totalDaysSelect.value, 10) || 30;

    monthlyGrid.innerHTML = "";

    // Blank cells before the 1st to align under correct weekday
    for (let i = 0; i < startIndex; i++) {
      const blank = document.createElement("article");
      blank.className = "month-cell month-cell--empty";
      monthlyGrid.appendChild(blank);
    }

    // Actual days
    for (let day = 1; day <= totalDays; day++) {
      const cell = document.createElement("article");
      cell.className = "month-cell";

      const header = document.createElement("div");
      header.className = "month-header";

      const dateSpan = document.createElement("span");
      dateSpan.className = "date-number";
      dateSpan.textContent = day;
      header.appendChild(dateSpan);

      const body = document.createElement("div");
      body.className = "month-body";

      const notes = document.createElement("div");
      notes.className = "day-notes";
      notes.contentEditable = "true";
      notes.setAttribute("data-placeholder", "Plan...");

      const emojiDrop = document.createElement("div");
      emojiDrop.className = "day-emoji-drop";
      emojiDrop.setAttribute("data-dropzone", "");

      body.appendChild(notes);
      body.appendChild(emojiDrop);

      cell.appendChild(header);
      cell.appendChild(body);
      monthlyGrid.appendChild(cell);

      // Initialize behavior for these new elements
      initNotesArea(notes);
      initDropzone(emojiDrop);
    }
  }

  /* Weekly notes & dropzones (static in HTML) */
  const weeklyNotes = document.querySelectorAll(".weekly-grid .day-notes");
  weeklyNotes.forEach(initNotesArea);

  const weeklyDropzones = document.querySelectorAll(".weekly-grid [data-dropzone]");
  weeklyDropzones.forEach(initDropzone);

  /* Palette emoji dragstart */
  paletteEmojis.forEach((el) => {
    el.addEventListener("dragstart", (e) => {
      const emojiChar = el.textContent.trim();
      e.dataTransfer.setData("text/plain", emojiChar);
      e.dataTransfer.effectAllowed = "copy";
    });
  });

  /* Month controls */
  if (generateMonthBtn && startDaySelect && totalDaysSelect && monthlyGrid) {
    generateMonthBtn.addEventListener("click", generateMonthGrid);
    // Generate an initial month with default settings
    generateMonthGrid();
  }

  /* Clear all notes & emojis */
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      const allNotes = document.querySelectorAll(".day-notes");
      const allDrops = document.querySelectorAll("[data-dropzone]");

      allNotes.forEach((area) => {
        area.textContent = "";
        area.classList.add("is-empty");
      });

      allDrops.forEach((zone) => {
        zone.innerHTML = "";
        zone.classList.add("empty");
      });
    });
  }

  /* Calendar Theme Switching */
  document.querySelectorAll(".theme-swatch").forEach((swatch) => {
    swatch.addEventListener("click", () => {
      const theme = swatch.dataset.theme;

      switch (theme) {
        case "spring":
          document.documentElement.style.setProperty("--calendar-bg", "#E8FAD7");
          document.documentElement.style.setProperty("--calendar-border", "#C7E7AF");
          break;
        case "sunset":
          document.documentElement.style.setProperty("--calendar-bg", "#fcead7ff");
          document.documentElement.style.setProperty("--calendar-border", "#deb28fff");
          break;
        case "midnight":
          document.documentElement.style.setProperty("--calendar-bg", "#DDE4FF");
          document.documentElement.style.setProperty("--calendar-border", "#AEBAFF");
          break;
        case "mint":
          document.documentElement.style.setProperty("--calendar-bg", "#e0fff7ff");
          document.documentElement.style.setProperty("--calendar-border", "#befef2ff");
          break;
        case "rose":
          document.documentElement.style.setProperty("--calendar-bg", "#fce7efff");
          document.documentElement.style.setProperty("--calendar-border", "#ffc1d5ff");
          break;
        case "dusk":
          document.documentElement.style.setProperty("--calendar-bg", "#e2dbfcff");
          document.documentElement.style.setProperty("--calendar-border", "#c4b6feff");
          break;
        case "charcoal":
          document.documentElement.style.setProperty("--calendar-bg", "#E5E7EB");
          document.documentElement.style.setProperty("--calendar-border", "#9CA3AF");
          break;
        default:
          document.documentElement.style.setProperty("--calendar-bg", "#eef2ff");
          document.documentElement.style.setProperty(
            "--calendar-border",
            "rgba(226, 232, 240, 0.95)"
          );
          break;
      }
    });
  });
});
