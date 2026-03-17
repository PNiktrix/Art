// ============================================================
// ui.js — UIManager
// ============================================================
// Handles all DOM state syncing:
//  - Header pill badge
//  - Sticky contact bar show/hide
//  - Selected preview strip
//  - Toast notifications
//  - Hint text
// ============================================================

class UIManager {
  constructor(cart, repo, onRemove) {
    this.cart     = cart;
    this.repo     = repo;
    this.onRemove = onRemove; // callback when user removes from strip
  }

  // Call after every cart change to sync all UI elements
  sync() {
    const count = this.cart.count();

    this._syncHeader(count);
    this._syncBar(count);
    this._syncStrip();
    this._syncHint(count);
  }

  // ── Header cart icon ────────────────────────────────────
  _syncHeader(count) {
    const cartBtn = document.getElementById("hdr-pill");
    const badge   = document.getElementById("hdr-n");
    if (!cartBtn || !badge) return;

    // Turn cart icon gold when items selected
    cartBtn.classList.toggle("on", count > 0);

    // Show/hide badge
    badge.textContent    = count;
    badge.style.display  = count > 0 ? "flex" : "none";
  }

  // ── Sticky contact bar ───────────────────────────────────
  _syncBar(count) {
    const bar = document.getElementById("bar");
    if (!bar) return;
    bar.classList.toggle("up", count > 0);
  }

  // ── Selected thumbnails strip ────────────────────────────
  _syncStrip() {
    const strip = document.getElementById("strip");
    if (!strip) return;

    const ids = this.cart.ids();

    if (!ids.length) {
      strip.classList.remove("open");
      strip.innerHTML = "";
      return;
    }

    strip.classList.add("open");
    strip.innerHTML = ids.map(id => {
      const p = this.repo.byId(id);
      if (!p) return "";
      return `
        <div class="pv" data-id="${id}">
          <img src="${p.image}" alt="${p.name}" loading="lazy"/>
          <div class="pv-x" onclick="App.removeFromCart(${id})">&#x2715;</div>
        </div>`;
    }).join("");
  }

  // ── Hint text ───────────────────────────────────────────
  _syncHint(count) {
    const hint = document.getElementById("hint");
    if (!hint) return;
    hint.style.opacity = count > 0 ? "0" : "1";
  }

  // ── Toast notification ──────────────────────────────────
  showToast(message, duration = 1800) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), duration);
  }
}
