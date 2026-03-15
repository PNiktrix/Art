// ============================================================
// tally.js — FormPopupController
// ============================================================
// Opens the Google Form popup with selected art names
// automatically prefilled into the art field.
//
// How prefill works:
//   Google Forms supports prefilled values via URL params.
//   We rebuild the iframe src each time the form opens,
//   injecting the selected product names into the art entry field.
//   This appears pre-filled when the form loads inside the popup.
//
// Data goes directly to Google Sheets on submission.
// ============================================================

class TallyController {
  constructor(repo, cart) {
    this.repo     = repo;
    this.cart     = cart;
    this._overlay = document.getElementById("gform-overlay");
    this._iframe  = document.getElementById("gform-frame");
  }

  open() {
    PixelTracker.lead();

    // Build the prefilled form URL with selected art names
    this._injectArtNames();

    this._overlay.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  close() {
    this._overlay.classList.remove("show");
    document.body.style.overflow = "";
  }

  // ── Private ───────────────────────────────────────────────

  _injectArtNames() {
    if (!this._iframe) return;

    // Get names of selected products from cart
    const artNames = this.cart.ids()
      .map(id => this.repo.byId(id)?.name)
      .filter(Boolean)
      .join(", ");

    // Base URL without any existing entry params
    const baseUrl = CONFIG.GFORM_URL;
    const entryId = CONFIG.GFORM_ART_ENTRY;

    let finalUrl = baseUrl;

    // Only inject if entry ID is configured and cart has items
    if (artNames && entryId && !entryId.includes("XXXXXXXXXX")) {
      // Google Forms prefill: append &entry.XXXXXXX=value to the URL
      const separator = baseUrl.includes("?") ? "&" : "?";
      finalUrl = `${baseUrl}${separator}${entryId}=${encodeURIComponent(artNames)}`;
    }

    // Set iframe src — Google Form loads with art field already filled
    this._iframe.src = finalUrl;
  }
}