// ============================================================
// search.js — SearchController
// ============================================================
// Expandable search bar that drops down from the header.
// Searches product name and category in real time.
// Clears and restores full gallery when closed.
// ============================================================

class SearchController {
  constructor(repo, onResults) {
    this.repo       = repo;
    this.onResults  = onResults;   // callback(results) — re-renders gallery
    this._active    = false;
    this._overlay   = document.getElementById("search-overlay");
    this._input     = document.getElementById("search-input");
    this._resultsEl = document.getElementById("search-results");
    this._allProducts = [];
  }

  init(products) {
    this._allProducts = products;
  }

  // ── Public API ────────────────────────────────────────────

  open() {
    this._active = true;
    this._overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    // Focus input after animation
    setTimeout(() => this._input?.focus(), 300);
    this._input.value = "";
    this._renderResults(this._allProducts);
  }

  close() {
    this._active = false;
    this._overlay.classList.remove("open");
    document.body.style.overflow = "";
    if (this._input) this._input.value = "";
    // Restore full gallery
    this.onResults(this._allProducts);
  }

  // Called oninput from HTML
  handleInput() {
    const q = this._input?.value.trim().toLowerCase() || "";
    if (!q) {
      this._renderResults(this._allProducts);
      return;
    }
    const matches = this._allProducts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q)
    );
    this._renderResults(matches);
  }

  // ── Private ───────────────────────────────────────────────

  _renderResults(products) {
    if (!this._resultsEl) return;
    const q = this._input?.value.trim().toLowerCase() || "";

    if (!q) {
      this._resultsEl.innerHTML = `
        <div class="sr-hint">Start typing to search prints...</div>`;
      return;
    }

    if (products.length === 0) {
      this._resultsEl.innerHTML = `
        <div class="sr-empty">No prints found for "<strong>${q}</strong>"</div>`;
      return;
    }

    this._resultsEl.innerHTML = products.map(p => `
      <div class="sr-item" onclick="App.searchSelect(${p.id})">
        <div class="sr-img">
          <img src="${p.image}" alt="${p.name}" loading="lazy"/>
        </div>
        <div class="sr-info">
          <div class="sr-name">${this._highlight(p.name, q)}</div>
          <div class="sr-cat">${p.category || ""}</div>
          <div class="sr-price">${p.displayPrice}</div>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14" style="flex-shrink:0;stroke:var(--ink-dim)">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>`
    ).join("");
  }

  // Bold matching text in result names
  _highlight(text, query) {
    const idx = text.toLowerCase().indexOf(query);
    if (idx === -1) return text;
    return (
      text.slice(0, idx) +
      `<strong style="color:var(--gold)">${text.slice(idx, idx + query.length)}</strong>` +
      text.slice(idx + query.length)
    );
  }

  // Tap a search result — close overlay and scroll to that card
  selectProduct(id) {
    this.close();
    setTimeout(() => {
      const card = document.querySelector(`.card[data-id="${id}"]`);
      if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 400);
  }
}
