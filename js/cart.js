// ============================================================
// cart.js — CartManager
// ============================================================
// Tracks which products the user has selected.
// Persists selection in localStorage so cart survives
// page refresh or returning visitors.
// Pure logic — no DOM access here.
// ============================================================

class CartManager {
  constructor() {
    // Load saved cart from localStorage on init
    this._set = new Set(CartManager._load());
  }

  toggle(id)   { this._set.has(id) ? this._set.delete(id) : this._set.add(id); this._save(); }
  add(id)      { this._set.add(id);    this._save(); }
  remove(id)   { this._set.delete(id); this._save(); }
  has(id)      { return this._set.has(id); }
  ids()        { return [...this._set]; }
  count()      { return this._set.size; }
  isEmpty()    { return this._set.size === 0; }

  clear() {
    this._set.clear();
    // Clear localStorage too when cart is explicitly cleared
    try { localStorage.removeItem("pniktrix_cart"); } catch(e) {}
  }

  // ── Private: save ids array to localStorage ──────────────
  _save() {
    try {
      localStorage.setItem("pniktrix_cart", JSON.stringify([...this._set]));
    } catch(e) {
      // localStorage blocked (private mode) — fail silently
    }
  }

  // ── Private: load saved ids from localStorage ─────────────
  static _load() {
    try {
      const saved = localStorage.getItem("pniktrix_cart");
      return saved ? JSON.parse(saved) : [];
    } catch(e) {
      return [];
    }
  }
}
