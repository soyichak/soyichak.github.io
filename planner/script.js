document.addEventListener("DOMContentLoaded", () => {
  const paletteEmojis = document.querySelectorAll(".emoji");
  const monthlyGrid = document.getElementById("monthly-grid");
  const weeklyGrid = document.querySelector(".weekly-grid");
  const clearBtn = document.getElementById("clear-all");
  const startDaySelect = document.getElementById("month-start-day");
  const totalDaysSelect = document.getElementById("month-total-days");
  const generateMonthBtn = document.getElementById("generate-month");
  const downloadWeeklyBtn = document.getElementById("download-weekly");
  const downloadMonthlyBtn = document.getElementById("download-monthly");

  const STORAGE_KEY = "studyRitual_v1";
  let currentTheme = "default";

  /* THEME HANDLING */

  function applyTheme(theme) {
    currentTheme = theme;
    let calendarBg = "#eef2ff";
    let calendarBorder = "rgba(226, 232, 240, 0.95)";
    let bodyBg = "#f4f7ff";

    switch (theme) {
      case "spring":
        calendarBg = "#E8FAD7";
        calendarBorder = "#C7E7AF";
        bodyBg = "#E8FAD7";
        break;
      case "sunset":
        calendarBg = "#fcead7ff";
        calendarBorder = "#deb28fff";
        bodyBg = "#FFE3C7";
        break;
      case "midnight":
        calendarBg = "#DDE4FF";
        calendarBorder = "#AEBAFF";
        bodyBg = "#DDE4FF";
        break;
      case "mint":
        calendarBg = "#e0fff7ff";
        calendarBorder = "#befef2ff";
        bodyBg = "#D6FFF5";
        break;
      case "rose":
        calendarBg = "#fce7efff";
        calendarBorder = "#ffc1d5ff";
        bodyBg = "#FFE0EB";
        break;
      case "dusk":
        calendarBg = "#e2dbfcff";
        calendarBorder = "#c4b6feff";
        bodyBg = "#E0D7FF";
        break;
      case "charcoal":
        calendarBg = "#E5E7EB";
        calendarBorder = "#9CA3AF";
        bodyBg = "#E5E7EB";
        break;
      default:
        calendarBg = "#eef2ff";
        calendarBorder = "rgba(226, 232, 240, 0.95)";
        bodyBg = "#f4f7ff";
        break;
    }

    document.documentElement.style.setProperty("--calendar-bg", calendarBg);
    document.documentElement.style.setProperty("--calendar-border", calendarBorder);

    // Make the page background follow the theme color
    document.body.style.background = bodyBg;
  }

  /* SAVE & LOAD STATE */

  function saveState() {
    const state = {
      notes: {},      // key -> innerHTML
      emojis: {},     // key -> innerHTML
      theme: currentTheme,
      month: null,
    };

    // Month controls
    if (startDaySelect && totalDaysSelect) {
      state.month = {
        startDay: startDaySelect.value,
        totalDays: totalDaysSelect.value,
      };
    }

    // Notes (weekly + monthly)
    document.querySelectorAll(".day-notes").forEach((area) => {
      const key = area.dataset.key;
      if (!key) return;
      const content = area.innerHTML;
      if (content && content.trim().length > 0) {
        state.notes[key] = content;
      }
    });

    // Emoji dropzones
    document.querySelectorAll("[data-dropzone]").forEach((zone) => {
      const key = zone.dataset.key;
      if (!key) return;
      const content = zone.innerHTML;
      if (content && content.trim().length > 0) {
        state.emojis[key] = content;
      }
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Could not save planner state", e);
    }
  }

  function loadState() {
    let raw;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      console.warn("Could not read planner state", e);
      raw = null;
    }

    if (!raw) {
      // No saved state yet: just make a default month if needed
      if (
        generateMonthBtn &&
        startDaySelect &&
        totalDaysSelect &&
        monthlyGrid &&
        monthlyGrid.children.length === 0
      ) {
        generateMonthGrid();
      }
      applyTheme("default");
      return;
    }

    let state;
    try {
      state = JSON.parse(raw);
    } catch (e) {
      console.warn("Bad saved planner state", e);
      applyTheme("default");
      return;
    }

    const { month, theme, notes, emojis } = state;

    // Restore month controls + regenerate grid
    if (month && startDaySelect && totalDaysSelect && monthlyGrid) {
      if (month.startDay != null) {
        startDaySelect.value = String(month.startDay);
      }
      if (month.totalDays != null) {
        totalDaysSelect.value = String(month.totalDays);
      }
      generateMonthGrid();
    } else if (
      generateMonthBtn &&
      startDaySelect &&
      totalDaysSelect &&
      monthlyGrid &&
      monthlyGrid.children.length === 0
    ) {
      generateMonthGrid();
    }

    // Restore theme
    if (theme) {
      applyTheme(theme);
    } else {
      applyTheme("default");
    }

    // Restore notes
    if (notes) {
      Object.keys(notes).forEach((key) => {
        const el = document.querySelector(`.day-notes[data-key="${key}"]`);
        if (el) {
          el.innerHTML = notes[key];
          if (el.textContent.trim().length === 0) {
            el.classList.add("is-empty");
          } else {
            el.classList.remove("is-empty");
          }
        }
      });
    }

    // Restore emojis
    if (emojis) {
      Object.keys(emojis).forEach((key) => {
        const zone = document.querySelector(
          `[data-dropzone][data-key="${key}"]`
        );
        if (zone) {
          zone.innerHTML = emojis[key];
          if (zone.textContent.trim().length === 0) {
            zone.classList.add("empty");
          } else {
            zone.classList.remove("empty");
          }
        }
      });
    }
  }

  /* HELPERS */

  function initNotesArea(area) {
    const update = () => {
      if (area.textContent.trim().length === 0) {
        area.classList.add("is-empty");
      } else {
        area.classList.remove("is-empty");
      }
    };
    update();
    area.addEventListener("input", () => {
      update();
      saveState();
    });
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

      // Single emoji per monthly cell
      const isMonthly = !!zone.closest(".monthly-grid");
      if (isMonthly) {
        zone.innerHTML = "";
      }

      const emojiEl = document.createElement("span");
      emojiEl.textContent = emojiChar;
      emojiEl.className = "calendar-emoji";

      zone.appendChild(emojiEl);
      zone.classList.remove("empty");

      saveState();
    });
  }

  function generateMonthGrid() {
    if (!monthlyGrid || !startDaySelect || !totalDaysSelect) return;

    const startIndex = parseInt(startDaySelect.value, 10) || 0; // 0 = Monday
    const totalDays = parseInt(totalDaysSelect.value, 10) || 30;

    monthlyGrid.innerHTML = "";

    // Blank cells before the 1st
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
      notes.dataset.key = `month-note-${day}`;

      const emojiDrop = document.createElement("div");
      emojiDrop.className = "day-emoji-drop";
      emojiDrop.setAttribute("data-dropzone", "");
      emojiDrop.dataset.key = `month-emoji-${day}`;

      body.appendChild(notes);
      body.appendChild(emojiDrop);

      cell.appendChild(header);
      cell.appendChild(body);
      monthlyGrid.appendChild(cell);

      // Initialize new elements
      initNotesArea(notes);
      initDropzone(emojiDrop);
    }
  }

  /* DOWNLOAD AS IMAGE */

  function downloadElementAsImage(element, filename) {
    if (!element || typeof html2canvas === "undefined") return;

    html2canvas(element, {
      backgroundColor: null
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = filename;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }).catch((err) => {
      console.warn("Error capturing calendar image", err);
    });
  }

  /* WEEKLY INIT (static HTML) */

  const weeklyNotes = document.querySelectorAll(".weekly-grid .day-notes");
  weeklyNotes.forEach(initNotesArea);

  const weeklyDropzones = document.querySelectorAll(".weekly-grid [data-dropzone]");
  weeklyDropzones.forEach(initDropzone);

  /* EMOJI DRAG FROM PALETTE */

  paletteEmojis.forEach((el) => {
    el.addEventListener("dragstart", (e) => {
      const emojiChar = el.textContent.trim();
      e.dataTransfer.setData("text/plain", emojiChar);
      e.dataTransfer.effectAllowed = "copy";
    });
  });

  /* MONTH CONTROLS */

  if (generateMonthBtn && startDaySelect && totalDaysSelect && monthlyGrid) {
    generateMonthBtn.addEventListener("click", () => {
      generateMonthGrid();
      saveState();
    });
  }

  /* CLEAR ALL */

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

      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.warn("Could not clear planner state", e);
      }
    });
  }

  /* THEME SWATCH CLICKS */

  document.querySelectorAll(".theme-swatch").forEach((swatch) => {
    swatch.addEventListener("click", () => {
      const theme = swatch.dataset.theme || "default";
      applyTheme(theme);
      saveState();
    });
  });

  /* DOWNLOAD BUTTONS */

  if (downloadWeeklyBtn && weeklyGrid) {
    downloadWeeklyBtn.addEventListener("click", () => {
      downloadElementAsImage(weeklyGrid, "study-weekly-view.png");
    });
  }

  if (downloadMonthlyBtn && monthlyGrid) {
    downloadMonthlyBtn.addEventListener("click", () => {
      downloadElementAsImage(monthlyGrid, "study-monthly-view.png");
    });
  }

  /* INITIAL LOAD */

  loadState();
});
