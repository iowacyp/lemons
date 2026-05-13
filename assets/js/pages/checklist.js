(function () {
  const CHECKLIST_KEY = "checklistItems";
  const ADDONS_KEY = "checklistAddons";

  function getCheckBoxes() {
    return Array.from(document.querySelectorAll('#checklistContainer input[type="checkbox"]'));
  }

  function getLabelText(id) {
    const label = document.querySelector(`label[for="${id}"]`);
    if (!label) return id;
    return label.textContent.replace(/\s+/g, " ").trim();
  }

  function updateSummary() {
    const checkboxes = getCheckBoxes();
    const total = checkboxes.length;
    const checked = checkboxes.filter((cb) => cb.checked);
    const remaining = total - checked.length;
    const percent = total ? Math.round((checked.length / total) * 100) : 0;
    const remainingLabels = checkboxes
      .filter((cb) => !cb.checked)
      .slice(0, 3)
      .map((cb) => getLabelText(cb.id));

    const progressLabel = document.getElementById("checklistProgressLabel");
    const remainingLabel = document.getElementById("checklistRemainingLabel");
    const progressFill = document.getElementById("checklistProgressFill");
    const statusChip = document.getElementById("checklistStatusChip");
    const summaryCopy = document.getElementById("checklistSummaryCopy");
    const addonsChip = document.getElementById("addonsChip");

    if (progressLabel) progressLabel.textContent = `${checked.length} of ${total} complete`;
    if (remainingLabel) remainingLabel.textContent = `${remaining} left to go`;
    if (progressFill) progressFill.style.width = `${percent}%`;

    const ready = total > 0 && remaining === 0;
    if (statusChip) {
      statusChip.textContent = ready ? "Ready to launch" : `${remaining} left`;
      statusChip.classList.toggle("complete", ready);
    }

    if (summaryCopy) {
      summaryCopy.textContent = ready
        ? "Everything is packed and ready for opening day."
        : remainingLabels.length
          ? `Next up: ${remainingLabels.join(", ")}.`
          : "Check off each task as you get ready for the stand.";
    }

    if (addonsChip) {
      const addons = document.getElementById("addons")?.value.trim() || "";
      addonsChip.textContent = addons ? "Saved" : "Optional";
      addonsChip.classList.toggle("complete", Boolean(addons));
    }

    checkboxes.forEach((cb) => {
      const row = cb.closest(".checklist-task");
      if (row) row.classList.toggle("checked", cb.checked);
    });

    localStorage.setItem(CHECKLIST_KEY, JSON.stringify(checked.map((cb) => cb.id)));
    localStorage.setItem("checklistComplete", String(ready));
  }

  function hydrate() {
    const saved = new Set(JSON.parse(localStorage.getItem(CHECKLIST_KEY) || "[]"));
    getCheckBoxes().forEach((cb) => {
      cb.checked = saved.has(cb.id);
    });

    const addonsInput = document.getElementById("addons");
    if (addonsInput) {
      addonsInput.value = localStorage.getItem(ADDONS_KEY) || "";
    }
  }

  function bind() {
    getCheckBoxes().forEach((cb) => {
      cb.addEventListener("change", updateSummary);
    });

    const addonsInput = document.getElementById("addons");
    if (addonsInput) {
      addonsInput.addEventListener("input", () => {
        localStorage.setItem(ADDONS_KEY, addonsInput.value);
        updateSummary();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    hydrate();
    bind();
    updateSummary();
  });
})();
