// ============================================================
// tally.js — TallyController
// ============================================================
// Controls the fallback contact form shown as a bottom sheet.
// Used when the customer does not want to DM directly.
//
// Setup:
//  1. Go to tally.so — create free account
//  2. New Form → add fields: Name, WhatsApp, City
//  3. Integrations → Google Sheets → connect your sheet
//  4. Share → copy URL → paste in config.js TALLY_URL
// ============================================================

class TallyController {
  constructor(tallyUrl, validator, repo, cart) {
    this.tallyUrl  = tallyUrl;
    this.validator = validator;
    this.repo      = repo;
    this.cart      = cart;

    this._modal = document.getElementById("tally-modal");

    // Close on backdrop tap
    this._modal.addEventListener("click", e => {
      if (e.target === this._modal) this.close();
    });
  }

  open() {
    // Update subtitle to show which arts were selected
    const sub = document.getElementById("tm-sub");
    if (sub) sub.textContent = MessageBuilder.forTallySubtitle(this.repo, this.cart);

    this._modal.classList.add("show");
  }

  close() {
    this._modal.classList.remove("show");
  }

  submit(onSuccess) {
    const name  = document.getElementById("fi-name").value;
    const phone = document.getElementById("fi-phone").value;
    const city  = document.getElementById("fi-city").value;

    const valid = this.validator.run([
      { id: "tf-name",  ok: this.validator.isPresent(name)  },
      { id: "tf-phone", ok: this.validator.isPhone(phone)   },
      { id: "tf-city",  ok: this.validator.isPresent(city)  },
    ]);

    if (!valid) return;

    // Build selected art names string
    const artNames = this.cart.ids()
      .map(id => this.repo.byId(id)?.name)
      .filter(Boolean)
      .join(", ") || "No specific art selected";

    PixelTracker.lead();

    // Open Tally form with pre-filled URL params if configured
    if (this.tallyUrl && !this.tallyUrl.includes("YOUR_TALLY_FORM_ID")) {
      const params = new URLSearchParams({ name, phone, city, art: artNames });
      window.open(`${this.tallyUrl}?${params.toString()}`, "_blank");
    }

    this.close();
    onSuccess();
  }
}
