(function () {
  const FIELD_IDS = ["favoriteMoment", "proudMoment", "reflection1", "reflection2", "reflection3"];
  const MOODS = {
    excited: "😄 Excited",
    happy: "🙂 Happy",
    neutral: "😐 Neutral",
    unsure: "😕 Unsure",
    sad: "😢 Tired"
  };

  function getText(id, fallback) {
    const el = document.getElementById(id);
    if (!el) return;
    const value = el.value.trim();
    const preview = document.getElementById(`${id}Preview`);
    if (preview) preview.textContent = value || fallback;
  }

  function updatePreview() {
    const filled = FIELD_IDS.filter((id) => document.getElementById(id)?.value.trim()).length;
    const mood = localStorage.getItem("journalMood") || "";
    const favorite = document.getElementById("favoriteMoment")?.value.trim() || "";
    const proud = document.getElementById("proudMoment")?.value.trim() || "";

    getText("favoriteMoment", "Nothing written yet");
    getText("proudMoment", "Nothing written yet");

    const moodPreview = document.getElementById("journalMoodPreview");
    if (moodPreview) {
      moodPreview.textContent = MOODS[mood] || "Choose a mood";
    }

    const countPreview = document.getElementById("journalCountPreview");
    if (countPreview) {
      countPreview.textContent = `${filled} prompt${filled === 1 ? "" : "s"} filled`;
    }

    const statusChip = document.getElementById("journalStatusChip");
    if (statusChip) {
      const ready = filled >= 3;
      statusChip.textContent = ready ? "Ready to print" : "In progress";
      statusChip.classList.toggle("complete", ready);
    }

    localStorage.setItem("journalMood", mood);
    localStorage.setItem("favoriteMoment", favorite);
    localStorage.setItem("proudMoment", proud);
    FIELD_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) localStorage.setItem(id, el.value);
    });
  }

  function hydrateFields() {
    FIELD_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.value = localStorage.getItem(id) || "";
    });
  }

  function hydrateMood() {
    const mood = localStorage.getItem("journalMood") || "";
    document.querySelectorAll(".mood-button").forEach((button) => {
      button.classList.toggle("active", button.dataset.mood === mood);
    });
  }

  function bindFields() {
    FIELD_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("input", () => {
        localStorage.setItem(id, el.value);
        updatePreview();
      });
    });
  }

  function bindMoodButtons() {
    document.querySelectorAll(".mood-button").forEach((button) => {
      button.addEventListener("click", () => {
        localStorage.setItem("journalMood", button.dataset.mood || "");
        hydrateMood();
        updatePreview();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    hydrateFields();
    hydrateMood();
    bindFields();
    bindMoodButtons();
    updatePreview();
  });
})();
