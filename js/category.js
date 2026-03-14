// ============================================================
// category.js — CategoryFilter
// ============================================================
// Renders horizontal scroll pill tabs from unique categories
// in products.json. Filters the gallery grid on tap.
// "All" pill is always first and selected by default.
// ============================================================

class CategoryFilter {
  constructor(barId, sectionLabelId, onFilter) {
    this.bar          = document.getElementById(barId);
    this.sectionLabel = document.getElementById(sectionLabelId);
    this.onFilter     = onFilter;   // callback(filteredProducts)
    this.active       = "All";
    this._allProducts = [];
  }

  // Call once after products load — builds pills from unique categories
  init(products) {
    this._allProducts = products;

    // Collect unique categories preserving order of first appearance
    const cats = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];

    // Build pill HTML
    this.bar.innerHTML = cats.map(c =>
      `<button class="cat-pill${c === "All" ? " active" : ""}" data-cat="${c}">${c}</button>`
    ).join("");

    // Bind tap events
    this.bar.querySelectorAll(".cat-pill").forEach(btn =>
      btn.addEventListener("click", () => this._select(btn.dataset.cat))
    );
  }

  // ── Private ───────────────────────────────────────────────
  _select(cat) {
    this.active = cat;

    // Update pill active state
    this.bar.querySelectorAll(".cat-pill").forEach(b =>
      b.classList.toggle("active", b.dataset.cat === cat)
    );

    // Update section label above grid
    if (this.sectionLabel) {
      this.sectionLabel.textContent = cat === "All" ? "All Prints" : cat;
    }

    // Filter and pass to gallery
    const filtered = cat === "All"
      ? this._allProducts
      : this._allProducts.filter(p => p.category === cat);

    this.onFilter(filtered);
  }
}
