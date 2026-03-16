// ============================================================
// filter.js — FilterPanel
// ============================================================
// Slide-in filter panel from the left side.
// Filters: Category, Price range, Size, Sort by
// Replaces the old category.js bar entirely.
//
// Usage in products.json — add these fields per product:
//   "category": "Abstract"
//   "size":     "12x18"
// ============================================================

class FilterPanel {
  constructor(onFilter) {
    this.onFilter    = onFilter;  // callback(filteredProducts)
    this._allProducts = [];

    // Current active filter state
    this._state = {
      category: "All",
      minPrice: 0,
      maxPrice: Infinity,
      size:     "All",
      sort:     "default"
    };
  }

  // Call once after products load — builds panel content
  init(products) {
    this._allProducts = products;

    // Derive max price from data
    const prices = products.map(p => +p.price).filter(Boolean);
    const maxP   = Math.max(...prices);
    this._state.maxPrice = maxP;

    this._buildPanel(products, maxP);
    this._updateCount(products.length);
  }

  open() {
    document.getElementById("filter-panel").classList.add("open");
    document.getElementById("filter-overlay").classList.add("open");
    document.body.style.overflow = "hidden";
  }

  close() {
    document.getElementById("filter-panel").classList.remove("open");
    document.getElementById("filter-overlay").classList.remove("open");
    document.body.style.overflow = "";
  }

  // Reset all filters
  reset() {
    const prices = this._allProducts.map(p => +p.price).filter(Boolean);
    const maxP   = Math.max(...prices);

    this._state = { category: "All", minPrice: 0, maxPrice: maxP, size: "All", sort: "default" };

    // Reset UI inputs
    const minEl = document.getElementById("fp-min");
    const maxEl = document.getElementById("fp-max");
    if (minEl) minEl.value = "";
    if (maxEl) maxEl.value = "";

    document.querySelectorAll(".fp-cat-pill").forEach(p => p.classList.toggle("active", p.dataset.cat === "All"));
    document.querySelectorAll(".fp-size-pill").forEach(p => p.classList.toggle("active", p.dataset.size === "All"));
    document.querySelectorAll(".fp-sort-opt").forEach(p => p.classList.toggle("active", p.dataset.sort === "default"));

    this._apply();
  }

  // ── Private: build panel HTML ─────────────────────────────

  _buildPanel(products, maxP) {
    const panel = document.getElementById("filter-panel");
    if (!panel) return;

    // Unique categories
    const cats = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];

    // Unique sizes
    const sizes = ["All", ...new Set(products.map(p => p.size).filter(Boolean)).values()]
      .sort((a, b) => a === "All" ? -1 : b === "All" ? 1 : a.localeCompare(b, undefined, { numeric: true }));

    panel.innerHTML = `
      <div class="fp-header">
        <span class="fp-title">Filter</span>
        <div class="fp-header-actions">
          <button class="fp-reset-all" onclick="App.filterReset()">Reset all</button>
          <button class="fp-close" onclick="App.filterClose()">&#x2715;</button>
        </div>
      </div>
      <div class="fp-body">

        <!-- SORT -->
        <div class="fp-section">
          <div class="fp-sec-title">Sort by</div>
          <div class="fp-pills">
            ${["default","price-asc","price-desc","name-asc","name-desc"].map((s,i) => {
              const labels = ["Default","Price: Low to High","Price: High to Low","Name: A–Z","Name: Z–A"];
              return `<button class="fp-sort-opt${s==="default"?" active":""}" data-sort="${s}"
                onclick="App.filterSort(this)">${labels[i]}</button>`;
            }).join("")}
          </div>
        </div>

        <!-- CATEGORY -->
        <div class="fp-section">
          <div class="fp-sec-title">Category</div>
          <div class="fp-pills">
            ${cats.map(c =>
              `<button class="fp-cat-pill${c==="All"?" active":""}" data-cat="${c}"
                onclick="App.filterCategory(this)">${c}</button>`
            ).join("")}
          </div>
        </div>

        <!-- PRICE -->
        <div class="fp-section">
          <div class="fp-sec-title">
            Price
            <span class="fp-sec-note">Max: Rs. ${maxP}</span>
          </div>
          <div class="fp-price-row">
            <div class="fp-price-input">
              <span>Rs.</span>
              <input id="fp-min" type="number" placeholder="From" min="0" max="${maxP}"
                oninput="App.filterPrice()" />
            </div>
            <div class="fp-price-sep">—</div>
            <div class="fp-price-input">
              <span>Rs.</span>
              <input id="fp-max" type="number" placeholder="To" min="0" max="${maxP}"
                oninput="App.filterPrice()" />
            </div>
          </div>
        </div>

      </div>
    `;
  }

  // ── Filter setters — called from HTML via App ─────────────

  setCategory(btn) {
    document.querySelectorAll(".fp-cat-pill").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    this._state.category = btn.dataset.cat;
    this._apply();
  }

  setSize(btn) {
    document.querySelectorAll(".fp-size-pill").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    this._state.size = btn.dataset.size;
    this._apply();
  }

  setSort(btn) {
    document.querySelectorAll(".fp-sort-opt").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    this._state.sort = btn.dataset.sort;
    this._apply();
  }

  setPrice() {
    const minVal = +document.getElementById("fp-min")?.value || 0;
    const maxVal = +document.getElementById("fp-max")?.value || Infinity;
    this._state.minPrice = minVal;
    this._state.maxPrice = maxVal || Infinity;
    this._apply();
  }

  // ── Private: apply all active filters ────────────────────

  _apply() {
    let result = [...this._allProducts];

    // Category
    if (this._state.category !== "All") {
      result = result.filter(p => p.category === this._state.category);
    }

    // Price
    result = result.filter(p => {
      const price = +p.price;
      return price >= this._state.minPrice && price <= this._state.maxPrice;
    });

    // Size
    if (this._state.size !== "All") {
      result = result.filter(p => p.size === this._state.size);
    }

    // Sort
    switch (this._state.sort) {
      case "price-asc":  result.sort((a,b) => +a.price - +b.price); break;
      case "price-desc": result.sort((a,b) => +b.price - +a.price); break;
      case "name-asc":   result.sort((a,b) => a.name.localeCompare(b.name)); break;
      case "name-desc":  result.sort((a,b) => b.name.localeCompare(a.name)); break;
    }

    this._updateCount(result.length);
    this.onFilter(result);
  }

  _updateCount(n) {
    const el = document.getElementById("filter-count");
    if (el) el.textContent = `${n} print${n !== 1 ? "s" : ""}`;
  }
}
