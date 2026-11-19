(function () {
  const DRAFT_STORAGE_KEY = "virtualProgrammingSignupDraft";
  const SUBMISSIONS_STORAGE_KEY = "virtualProgrammingSignups";
  const MAX_HISTORY = 10;
  let instanceCount = 0;

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function normalizeText(value) {
    return String(value || "").trim();
  }

  function buildFieldId(prefix, name) {
    return `${prefix}-${name}`;
  }

  class VirtualProgrammingSignupForm extends HTMLElement {
    constructor() {
      super();
      this.instancePrefix = `vp-signup-${++instanceCount}`;
      this.defaultInterest = "";
    }

    connectedCallback() {
      this.defaultInterest = normalizeText(
        this.getAttribute("default-virtual-programming-interest") ||
          this.defaultVirtualProgrammingInterest ||
          ""
      );
      this.render();
    }

    get defaultVirtualProgrammingInterest() {
      return this._defaultVirtualProgrammingInterest || "";
    }

    set defaultVirtualProgrammingInterest(value) {
      this._defaultVirtualProgrammingInterest = normalizeText(value);
      if (this.isConnected) {
        this.defaultInterest = this._defaultVirtualProgrammingInterest;
        this.syncInterest();
      }
    }

    render() {
      const fieldId = (name) => buildFieldId(this.instancePrefix, name);

      this.innerHTML = `
        <article class="glass-card form-card signup-form-card">
          <div class="card-title-row">
            <div>
              <p class="section-kicker">Virtual programming</p>
              <h2>Sign-up form</h2>
            </div>
            <span class="badge-chip accent" data-signup-status>Ready to submit</span>
          </div>
          <p class="card-copy">
            Share the details below and we will add your family to the virtual programming list.
          </p>

          <form class="signup-form" novalidate>
            <div class="signup-grid">
              <label class="signup-field" for="${fieldId("parentFirstName")}">
                <span>Parent/Guardian First Name</span>
                <input
                  type="text"
                  id="${fieldId("parentFirstName")}"
                  name="parentFirstName"
                  autocomplete="given-name"
                  placeholder="First name"
                  required
                />
              </label>

              <label class="signup-field" for="${fieldId("parentLastName")}">
                <span>Parent/Guardian Last Name</span>
                <input
                  type="text"
                  id="${fieldId("parentLastName")}"
                  name="parentLastName"
                  autocomplete="family-name"
                  placeholder="Last name"
                  required
                />
              </label>

              <label class="signup-field" for="${fieldId("emailAddress")}">
                <span>Email Address</span>
                <input
                  type="email"
                  id="${fieldId("emailAddress")}"
                  name="emailAddress"
                  autocomplete="email"
                  placeholder="name@example.com"
                  required
                />
              </label>

              <label class="signup-field" for="${fieldId("phoneNumber")}">
                <span>Phone Number</span>
                <input
                  type="tel"
                  id="${fieldId("phoneNumber")}"
                  name="phoneNumber"
                  autocomplete="tel"
                  placeholder="(555) 123-4567"
                />
              </label>

              <label class="signup-field" for="${fieldId("city")}">
                <span>City</span>
                <input
                  type="text"
                  id="${fieldId("city")}"
                  name="city"
                  autocomplete="address-level2"
                  placeholder="City, state"
                  required
                />
              </label>

              <label class="signup-field" for="${fieldId("militaryAffiliation")}">
                <span>Military Affiliation</span>
                <select id="${fieldId("militaryAffiliation")}" name="militaryAffiliation">
                  <option value="">Select one</option>
                  <option value="No military affiliation">No military affiliation</option>
                  <option value="Active duty">Active duty</option>
                  <option value="Veteran">Veteran</option>
                  <option value="Military spouse/partner">Military spouse/partner</option>
                  <option value="Military child/family">Military child/family</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </label>

              <label class="signup-field signup-field--full" for="${fieldId("childNames")}">
                <span>Child/Youth Name(s)</span>
                <textarea
                  id="${fieldId("childNames")}"
                  name="childNames"
                  rows="2"
                  placeholder="List names separated by commas or lines"
                ></textarea>
              </label>

              <label class="signup-field signup-field--full" for="${fieldId("childAges")}">
                <span>Child/Youth Age(s)</span>
                <input
                  type="text"
                  id="${fieldId("childAges")}"
                  name="childAges"
                  placeholder="Example: 6, 9, 12"
                />
              </label>

              <label class="signup-field signup-field--full" for="${fieldId("virtualInterest")}">
                <span>Interested in Virtual Programming?</span>
                <select id="${fieldId("virtualInterest")}" name="virtualInterest">
                  <option value="">No preference</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </label>

              <label class="signup-field signup-field--full" for="${fieldId("comments")}">
                <span>Optional Comments or Questions</span>
                <textarea
                  id="${fieldId("comments")}"
                  name="comments"
                  rows="4"
                  placeholder="Share anything helpful for the team"
                ></textarea>
              </label>
            </div>

            <div class="signup-actions">
              <button type="submit" class="signup-submit">
                <i class="fa-solid fa-paper-plane" aria-hidden="true"></i>
                <span>Submit Interest Form</span>
              </button>
              <p class="signup-confirmation" role="status" aria-live="polite"></p>
            </div>
          </form>
        </article>
      `;

      this.form = this.querySelector(".signup-form");
      this.confirmation = this.querySelector(".signup-confirmation");
      this.statusChip = this.querySelector("[data-signup-status]");
      this.inputs = {
        parentFirstName: this.querySelector(`[name="parentFirstName"]`),
        parentLastName: this.querySelector(`[name="parentLastName"]`),
        emailAddress: this.querySelector(`[name="emailAddress"]`),
        phoneNumber: this.querySelector(`[name="phoneNumber"]`),
        city: this.querySelector(`[name="city"]`),
        militaryAffiliation: this.querySelector(`[name="militaryAffiliation"]`),
        childNames: this.querySelector(`[name="childNames"]`),
        childAges: this.querySelector(`[name="childAges"]`),
        virtualInterest: this.querySelector(`[name="virtualInterest"]`),
        comments: this.querySelector(`[name="comments"]`)
      };

      this.hydrateFields();
      this.syncInterest();
      this.bindEvents();
      this.updateStatus();
    }

    hydrateFields() {
      const draft = readJson(DRAFT_STORAGE_KEY, {});
      Object.keys(this.inputs).forEach((key) => {
        const input = this.inputs[key];
        if (!input) return;
        if (key === "virtualInterest") return;
        input.value = normalizeText(draft[key]);
      });
    }

    syncInterest() {
      const input = this.inputs?.virtualInterest;
      if (!input) return;
      input.value = this.defaultInterest || "";
    }

    collectData() {
      return {
        parentFirstName: normalizeText(this.inputs.parentFirstName?.value),
        parentLastName: normalizeText(this.inputs.parentLastName?.value),
        emailAddress: normalizeText(this.inputs.emailAddress?.value),
        phoneNumber: normalizeText(this.inputs.phoneNumber?.value),
        city: normalizeText(this.inputs.city?.value),
        militaryAffiliation: normalizeText(this.inputs.militaryAffiliation?.value),
        childNames: normalizeText(this.inputs.childNames?.value),
        childAges: normalizeText(this.inputs.childAges?.value),
        virtualInterest: normalizeText(this.inputs.virtualInterest?.value),
        comments: normalizeText(this.inputs.comments?.value),
        submittedAt: new Date().toISOString()
      };
    }

    saveDraft() {
      const draft = this.collectData();
      delete draft.submittedAt;
      writeJson(DRAFT_STORAGE_KEY, draft);
    }

    saveSubmission(data) {
      // TODO: replace this local persistence with the site's real submission endpoint or email workflow.
      const history = readJson(SUBMISSIONS_STORAGE_KEY, []);
      history.unshift(data);
      writeJson(SUBMISSIONS_STORAGE_KEY, history.slice(0, MAX_HISTORY));
      localStorage.setItem("virtualProgrammingSignupLatest", JSON.stringify(data));
    }

    bindEvents() {
      if (!this.form || this.bound) return;
      this.bound = true;

      Object.values(this.inputs).forEach((input) => {
        if (!input) return;
        input.addEventListener("input", () => {
          if (this.confirmation) {
            this.confirmation.textContent = "";
          }
          if (this.statusChip) {
            this.statusChip.classList.remove("complete");
          }
          this.saveDraft();
          this.updateStatus();
        });
        input.addEventListener("change", () => {
          if (this.confirmation) {
            this.confirmation.textContent = "";
          }
          if (this.statusChip) {
            this.statusChip.classList.remove("complete");
          }
          this.saveDraft();
          this.updateStatus();
        });
      });

      this.form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!this.form.checkValidity()) {
          this.form.reportValidity();
          return;
        }

        const data = this.collectData();
        this.saveSubmission(data);
        this.confirmation.textContent = "Thank you! Your virtual programming interest form has been submitted.";
        this.statusChip.textContent = "Submitted";
        this.statusChip.classList.add("complete");

        this.form.reset();
        this.syncInterest();
        this.saveDraft();
        this.updateStatus();
      });
    }

    updateStatus() {
      if (!this.statusChip) return;

      const data = this.collectData();
      const hasBasics =
        Boolean(data.parentFirstName) &&
        Boolean(data.parentLastName) &&
        Boolean(data.emailAddress) &&
        Boolean(data.city);

      if (this.confirmation?.textContent) {
        this.statusChip.textContent = "Submitted";
        this.statusChip.classList.add("complete");
        return;
      }

      this.statusChip.textContent = hasBasics ? "Ready to submit" : "In progress";
      this.statusChip.classList.remove("complete");
    }
  }

  if (!customElements.get("virtual-programming-signup-form")) {
    customElements.define("virtual-programming-signup-form", VirtualProgrammingSignupForm);
  }
})();
