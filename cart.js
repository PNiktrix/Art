// ============================================================
// cart.js — CartManager
// ============================================================
// Tracks which products the user has selected.
// Pure logic — no DOM access here.
// ============================================================

class CartManager {
  constructor() {
    this._set = new Set();
  }

  toggle(id) {
    this._set.has(id) ? this._set.delete(id) : this._set.add(id);
  }

  add(id)    { this._set.add(id); }
  remove(id) { this._set.delete(id); }
  has(id)    { return this._set.has(id); }
  ids()      { return [...this._set]; }
  count()    { return this._set.size; }
  clear()    { this._set.clear(); }
  isEmpty()  { return this._set.size === 0; }
}
