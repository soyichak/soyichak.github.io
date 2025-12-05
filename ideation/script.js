// Simple SPA-style navigation between "screens"
const screens = document.querySelectorAll('.screen');

function showScreen(id) {
  screens.forEach((s) => {
    s.classList.toggle('active', s.id === id);
  });
}

// Mode and selected memory
let currentMode = null; // 'insert' or 'remove'
let selectedLabel = null;
let lastScreenBeforeConfirm = null;

// Elements
const btnInsert = document.getElementById('btn-insert');
const btnRemove = document.getElementById('btn-remove');
const confirmOperationEl = document.getElementById('confirm-operation');
const confirmTargetEl = document.getElementById('confirm-target');
const btnConfirm = document.getElementById('btn-confirm');
const btnCancel = document.getElementById('btn-cancel');
const confirmBack = document.getElementById('confirm-back');

const progressFill = document.getElementById('progress-fill');
const progressPercent = document.getElementById('progress-percent');
const statusText = document.getElementById('status-text');
const progressTitle = document.getElementById('progress-title');
const progressDescription = document.getElementById('progress-description');
const btnDone = document.getElementById('btn-done');

let progressInterval = null;

// Tag filtering elements
const tagButtons = document.querySelectorAll('.tag');
const removeMemoryCards = document.querySelectorAll('#screen-remove .memory-card');

// Attach listeners to main choice buttons
btnInsert.addEventListener('click', () => {
  currentMode = 'insert';
  showScreen('screen-insert');
});

btnRemove.addEventListener('click', () => {
  currentMode = 'remove';
  showScreen('screen-remove');
});

// Back links with data-back-to
document.querySelectorAll('.back-link[data-back-to]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-back-to');
    showScreen(target);
  });
});

// Memory remove cards
document
  .querySelectorAll('.memory-card:not(.insert-card)')
  .forEach((card) => {
    card.addEventListener('click', () => {
      currentMode = 'remove';
      lastScreenBeforeConfirm = 'screen-remove';
      selectedLabel = card.getAttribute('data-label') || 'Selected memory';
      openConfirmScreen();
    });
  });

// Insert cards
document.querySelectorAll('.insert-card').forEach((card) => {
  card.addEventListener('click', () => {
    currentMode = 'insert';
    lastScreenBeforeConfirm = 'screen-insert';
    selectedLabel = card.getAttribute('data-label') || 'Selected memory';
    openConfirmScreen();
  });
});

function openConfirmScreen() {
  confirmOperationEl.textContent =
    currentMode === 'remove'
      ? 'Remove memory from archive'
      : 'Insert memory into archive';
  confirmTargetEl.textContent = selectedLabel;
  showScreen('screen-confirm');
}

// Confirm back button
confirmBack.addEventListener('click', () => {
  if (lastScreenBeforeConfirm) {
    showScreen(lastScreenBeforeConfirm);
  } else {
    showScreen('screen-choice');
  }
});

// Cancel button
btnCancel.addEventListener('click', () => {
  if (lastScreenBeforeConfirm) {
    showScreen(lastScreenBeforeConfirm);
  } else {
    showScreen('screen-choice');
  }
});

// Confirm and start progress
btnConfirm.addEventListener('click', () => {
  startProgress();
});

// Progress logic
function startProgress() {
  showScreen('screen-progress');
  btnDone.style.display = 'none';
  let value = 0;

  // Initialize UI based on mode
  if (currentMode === 'remove') {
    progressTitle.textContent = 'Removing memory…';
    progressDescription.textContent =
      'Locating engram cluster and initiating controlled synaptic degradation.';
  } else {
    progressTitle.textContent = 'Inserting memory…';
    progressDescription.textContent =
      'Preparing engram imprint and synchronizing with autobiographical timeline.';
  }

  progressFill.style.width = '0%';
  progressPercent.textContent = '0%';
  statusText.textContent = 'Initializing…';

  if (progressInterval) {
    clearInterval(progressInterval);
  }

  progressInterval = setInterval(() => {
    value += Math.random() * 7 + 2; // jittery progress
    if (value >= 100) {
      value = 100;
      clearInterval(progressInterval);
      handleProgressComplete();
    }

    progressFill.style.width = `${value.toFixed(1)}%`;
    progressPercent.textContent = `${Math.round(value)}%`;

    // Some staged status text
    if (value > 10 && value <= 35) {
      statusText.textContent =
        currentMode === 'remove'
          ? 'Disentangling memory from adjacent emotional pathways…'
          : 'Aligning acquired memory with emotional profile…';
    } else if (value > 35 && value <= 70) {
      statusText.textContent =
        currentMode === 'remove'
          ? 'Stabilizing identity lattice after targeted excision…'
          : 'Reinforcing new synaptic routes for integrated recall…';
    } else if (value > 70 && value < 100) {
      statusText.textContent =
        currentMode === 'remove'
          ? 'Finalizing removal and sealing neural gaps…'
          : 'Finalizing imprint and sealing narrative seams…';
    }
  }, 120);
}

function handleProgressComplete() {
  const successText =
    currentMode === 'remove'
      ? 'Success! Target memory has been removed from accessible recall.'
      : 'Success! Target memory has been integrated into your accessible recall.';

  statusText.textContent = successText;
  btnDone.style.display = 'inline-flex';
}

// Done → back to main console
btnDone.addEventListener('click', () => {
  currentMode = null;
  selectedLabel = null;
  lastScreenBeforeConfirm = null;
  showScreen('screen-choice');
});

/* -------------------------
   TAG FILTERING LOGIC
-------------------------- */

function filterRemoveMemories(selectedTag) {
  const tagLower = selectedTag.trim().toLowerCase();

  removeMemoryCards.forEach((card) => {
    const raw = card.getAttribute('data-tags') || '';
    const tags = raw
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    if (tagLower === 'all') {
      card.style.display = '';
    } else if (tags.includes(tagLower)) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

// Add click handlers to tag buttons
tagButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    tagButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const tag = btn.textContent.trim();
    filterRemoveMemories(tag);
  });
});

// Initialize with "All"
filterRemoveMemories('All');
