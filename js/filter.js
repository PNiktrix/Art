// ============================================================
// filter.js — FilterPanel
// ============================================================
// Slide-in filter panel from the left side.
// Filters: Sort, Category, Price range (slider + manual inputs)
// ============================================================

class FilterPanel {
  constructor(onFilter) {
    this.onFilter     = onFilter;
    this._allProducts = [];
    this._state = {
      category: "All",
      minPrice: 99,
      maxPrice: 10000,
      sort:     "default"
    };
  }

  // ── Public: init ─────────────────────────────────────────

  init(products) {
    this._allProducts = products;
    this._buildPanel(products);
    this._updateCount(products.length);
    // Draw initial fill after panel is in DOM
    requestAnimationFrame(() => this._updateSliderFill(99, 10000));
  }

  // ── Public: open / close ──────────────────────────────────

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

  // ── Public: reset ─────────────────────────────────────────

  reset() {
    this._state = { category: "All", minPrice: 99, maxPrice: 10000, sort: "default" };

    // Clear manual inputs
    const minEl = document.getElementById("fp-min");
    const maxEl = document.getElementById("fp-max");
    if (minEl) minEl.value = "";
    if (maxEl) maxEl.value = "";

    // Reset sliders
    const minR = document.getElementById("fp-range-min");
    const maxR = document.getElementById("fp-range-max");
    if (minR) minR.value = 99;
    if (maxR) maxR.value = 10000;
    this._updateSliderFill(99, 10000);

    // Reset label
    const label = document.getElementById("fp-price-label");
    if (label) label.textContent = "Rs. 99 — Rs. 10,000";

    // Reset pills
    document.querySelectorAll(".fp-cat-pill")
      .forEach(p => p.classList.toggle("active", p.dataset.cat === "All"));
    document.querySelectorAll(".fp-sort-opt")
      .forEach(p => p.classList.toggle("active", p.dataset.sort === "default"));

    this._apply();
  }

  // ── Public: filter setters ────────────────────────────────

  setCategory(btn) {
    document.querySelectorAll(".fp-cat-pill").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    this._state.category = btn.dataset.cat;
    this._apply();
  }

  setSort(btn) {
    document.querySelectorAll(".fp-sort-opt").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    this._state.sort = btn.dataset.sort;
    this._apply();
  }

  // Called when slider handles move — syncs inputs and applies filter
  setSlider() {
    const minR = document.getElementById("fp-range-min");
    const maxR = document.getElementById("fp-range-max");
    if (!minR || !maxR) return;

    let minV = +minR.value;
    let maxV = +maxR.value;

    // Prevent handles crossing — min can never exceed max
    if (minV > maxV) {
      minV = maxV;
      minR.value = minV;
    }

    // Sync manual text inputs to match slider
    const minEl = document.getElementById("fp-min");
    const maxEl = document.getElementById("fp-max");
    if (minEl) minEl.value = minV;
    if (maxEl) maxEl.value = maxV;

    // Update the label above slider
    const label = document.getElementById("fp-price-label");
    if (label) label.textContent = `Rs. ${minV.toLocaleString()} — Rs. ${maxV.toLocaleString()}`;

    // Update gold fill between handles
    this._updateSliderFill(minV, maxV);

    this._state.minPrice = minV;
    this._state.maxPrice = maxV;
    this._apply();
  }

  // Called when manual From/To inputs are typed
  setPrice() {
    const minVal = +document.getElementById("fp-min")?.value || 99;
    const maxVal = +document.getElementById("fp-max")?.value || 10000;

    this._state.minPrice = minVal;
    this._state.maxPrice = maxVal;

    // Sync sliders to match typed values
    const minR = document.getElementById("fp-range-min");
    const maxR = document.getElementById("fp-range-max");
    if (minR) minR.value = minVal;
    if (maxR) maxR.value = maxVal;
    this._updateSliderFill(minVal, maxVal);

    const label = document.getElementById("fp-price-label");
    if (label) label.textContent = `Rs. ${minVal.toLocaleString()} — Rs. ${maxVal.toLocaleString()}`;

    this._apply();
  }

  // ── Private: slider fill position ────────────────────────

  _updateSliderFill(minV, maxV) {
    const fill = document.getElementById("fp-slider-fill");
    if (!fill) return;
    const range = 10000 - 99;
    const left  = ((minV  - 99)    / range) * 100;
    const right = ((10000 - maxV)  / range) * 100;
    fill.style.left  = `${left}%`;
    fill.style.right = `${right}%`;
  }

  // ── Private: apply all filters and sort ──────────────────

  _apply() {
    let result = [...this._allProducts];

    // Category filter
    if (this._state.category !== "All") {
      result = result.filter(p => p.category === this._state.category);
    }

    // Price filter — keeps products within the selected range
    result = result.filter(p => {
      const price = +p.price;
      return price >= this._state.minPrice && price <= this._state.maxPrice;
    });

    // Sort
    switch (this._state.sort) {
      case "price-asc":  result.sort((a, b) => +a.price - +b.price); break;
      case "price-desc": result.sort((a, b) => +b.price - +a.price); break;
      case "name-asc":   result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "name-desc":  result.sort((a, b) => b.name.localeCompare(a.name)); break;
    }

    this._updateCount(result.length);
    this.onFilter(result);
  }

  // ── Private: update product count display ─────────────────

  _updateCount(n) {
    const el = document.getElementById("filter-count");
    if (el) el.textContent = `${n} print${n !== 1 ? "s" : ""}`;
  }

  // ── Private: build panel HTML ─────────────────────────────

  _buildPanel(products) {
    const panel = document.getElementById("filter-panel");
    if (!panel) return;

    const cats = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];

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
            ${["default","price-asc","price-desc","name-asc","name-desc"].map((s, i) => {
              const labels = ["Default", "Price: Low to High", "Price: High to Low", "Name: A–Z", "Name: Z–A"];
              return `<button class="fp-sort-opt${s === "default" ? " active" : ""}" data-sort="${s}"
                onclick="App.filterSort(this)">${labels[i]}</button>`;
            }).join("")}
          </div>
        </div>

        <!-- CATEGORY -->
        <div class="fp-section">
          <div class="fp-sec-title">Category</div>
          <div class="fp-pills">
            ${cats.map(c =>
              `<button class="fp-cat-pill${c === "All" ? " active" : ""}" data-cat="${c}"
                onclick="App.filterCategory(this)">${c}</button>`
            ).join("")}
          </div>
        </div>

        <!-- PRICE -->
        <div class="fp-section">
          <div class="fp-sec-title">
            Price
            <span class="fp-sec-note" id="fp-price-label">Rs. 99 — Rs. 10,000</span>
          </div>

          <!-- Dual range slider -->
          <div class="fp-slider-wrap">
            <div class="fp-slider-track">
              <div class="fp-slider-fill" id="fp-slider-fill"></div>
            </div>
            <input class="fp-range" id="fp-range-min" type="range"
              min="99" max="10000" value="99" step="50"
              oninput="App.filterSlider()" />
            <input class="fp-range" id="fp-range-max" type="range"
              min="99" max="10000" value="10000" step="50"
              oninput="App.filterSlider()" />
          </div>

          <!-- Manual From / To inputs -->
          <div class="fp-price-row">
            <div class="fp-price-input">
              <span>Rs.</span>
              <input id="fp-min" type="number" placeholder="99"
                min="99" max="10000" oninput="App.filterPrice()" />
            </div>
            <div class="fp-price-sep">—</div>
            <div class="fp-price-input">
              <span>Rs.</span>
              <input id="fp-max" type="number" placeholder="10000"
                min="99" max="10000" oninput="App.filterPrice()" />
            </div>
          </div>
        </div>

      </div>
    `;
  }
}