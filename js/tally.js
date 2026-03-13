// ============================================================
// tally.js — TallyController
// ============================================================
// Uses Tally's official embed popup to open the form
// directly inside the website — no new tab, no redirect.
//
// How it works:
//   Tally's embed.js (loaded in index.html) listens for
//   any element with data-tally-open attribute.
//   We programmatically click a hidden trigger button
//   to open the popup from anywhere in the app.
//
// Your Tally form ID: PdEKa0 (already set below)
// ============================================================

class TallyController {
  constructor(repo, cart) {
    this.repo = repo;
    this.cart = cart;

    // Hidden trigger button that carries all Tally data attributes
    // Tally's embed.js watches for clicks on this automatically
    this._trigger = document.getElementById("tally-trigger");
  }

  // Called by App.openTally() and App.openBar()
  open() {
    PixelTracker.lead();

    // Click the hidden trigger — Tally embed.js handles the rest
    if (this._trigger) {
      this._trigger.click();
    }
  }

  // close() kept for compatibility — Tally manages its own close
  close() {}
}
