(function () {
  const CHECKBOX_IDS = ["family", "posters", "online", "neighbors", "other"];
  const TEXT_IDS = ["otherInput", "special", "pitch", "caption"];

  function getChannelLabel(id) {
    const labels = {
      family: "Family and friends",
      posters: "Posters and signs",
      online: "Online with a grown-up",
      neighbors: "Neighbors",
      other: "Other"
    };
    return labels[id] || id;
  }

  function getCheckedChannels() {
    return CHECKBOX_IDS
      .filter((id) => document.getElementById(id)?.checked)
      .map((id) => {
        if (id === "other") {
          const value = document.getElementById("otherInput")?.value.trim();
          return value ? `Other: ${value}` : "Other";
        }
        return getChannelLabel(id);
      });
  }

  function setText(id, value, fallback) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || fallback;
  }

  function savePlan() {
    const channels = getCheckedChannels();
    const highlight = document.getElementById("special")?.value.trim() || "";
    const pitch = document.getElementById("pitch")?.value.trim() || "";
    const caption = document.getElementById("caption")?.value.trim() || "";
    const summary = [
      `How customers will hear about the stand: ${channels.length ? channels.join(", ") : "None selected"}.`,
      `What makes our lemonade special: ${highlight || "Not added yet"}.`,
      `Our pitch: ${pitch || "Not added yet"}.`,
      `Flyer caption: ${caption || "Not added yet"}.`
    ].join(" ");

    localStorage.setItem("marketingPlan", summary);
  }

  function updatePreview() {
    const channels = getCheckedChannels();
    const highlight = document.getElementById("special")?.value.trim() || "";
    const pitch = document.getElementById("pitch")?.value.trim() || "";
    const caption = document.getElementById("caption")?.value.trim() || "";
    const isReady = channels.length > 0 && Boolean(highlight || pitch || caption);

    setText("channelsPreview", channels.length ? channels.join(" • ") : "Pick your channels");
    setText("specialPreview", highlight || "Your special selling point");
    setText("pitchPreview", pitch || "A short message for customers");
    setText("captionPreview", caption || "A quick line for posters and signs");

    const chip = document.getElementById("marketingStatusChip");
    if (chip) {
      chip.textContent = isReady ? "Ready to share" : "In progress";
      chip.classList.toggle("complete", isReady);
    }
  }

  function hydrate() {
    CHECKBOX_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.checked = localStorage.getItem(id) === "true";
    });

    TEXT_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.value = localStorage.getItem(id) || "";
    });
  }

  function bind() {
    CHECKBOX_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("change", () => {
        localStorage.setItem(id, String(el.checked));
        updatePreview();
        savePlan();
      });
    });

    TEXT_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("input", () => {
        localStorage.setItem(id, el.value);
        updatePreview();
        savePlan();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    hydrate();
    bind();
    updatePreview();
    savePlan();
  });
})();
