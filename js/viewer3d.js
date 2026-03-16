// ============================================================
// viewer3d.js — Viewer3DController
// ============================================================
// Manages the 3D panel inside the zoom viewer popup.
//   - Loads the product GLB into model-viewer
//   - Wall background colour picker (4 options)
//   - Model colour via materials API (Black Red White Blue)
//   - Full orbit: camera-controls with no orbit limits
//     so user can rotate top/bottom/sides/full 360
//   - Directional light source top-right for clarity
//
// Extracted from viewer.js for clarity.
// Used by: ImageViewer (viewer.js)
// ============================================================

class Viewer3DController {
  constructor(panelId, modelId) {
    this._panel  = document.getElementById(panelId);
    this._mv     = document.getElementById(modelId);   // <model-viewer> element
  }

  // Load product model and reset controls
  load(product) {
    if (!this._mv || !product.hasModel) return;

    // Set model source
    this._mv.setAttribute("src", product.model);
    this._mv.setAttribute("auto-rotate", "");

    // ── Full orbit — no vertical limits ──────────────────────
    // By default model-viewer limits vertical orbit to ~90deg
    // Removing min/max-camera-orbit allows full top-to-bottom spin
    this._mv.setAttribute("min-camera-orbit", "auto auto auto");
    this._mv.setAttribute("max-camera-orbit", "auto auto auto");
    // Start with a slightly elevated angle so skull/art looks natural
    this._mv.setAttribute("camera-orbit", "0deg 75deg auto");
    // Slower auto-rotate so details are visible
    this._mv.setAttribute("auto-rotate-delay", "0");
    this._mv.style.setProperty("--progress-bar-color", "transparent");

    // Apply default wall colour
    const activeWall = document.querySelector(".zv-wall-btn.active");
    if (activeWall) this._setWallBg(activeWall.dataset.wall);

    // Apply default colour (first swatch = black)
    document.querySelectorAll(".zv-swatch").forEach((s, i) =>
      s.classList.toggle("active", i === 0)
    );
    this._applyColorOnLoad("#1A1714");
  }

  // Stop model to save battery
  stop() {
    if (this._mv) this._mv.removeAttribute("auto-rotate");
  }

  // Wall background — called from App.setWall()
  setWall(btn) {
    document.querySelectorAll(".zv-wall-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    this._setWallBg(btn.dataset.wall);
  }

  // Model colour — uses materials API for real colour
  setModelColor(btn) {
    document.querySelectorAll(".zv-swatch").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    this._applyColorOnLoad(btn.dataset.color);
  }

  // ── Private ───────────────────────────────────────────────

  _setWallBg(color) {
    const wrap = this._panel?.querySelector(".zv-model-wrap");
    if (wrap) wrap.style.background = color;
  }

  // Apply colour immediately if loaded, or wait for load event
  _applyColorOnLoad(hex) {
    if (!this._mv) return;
    const apply = () => this._applyColor(hex);
    if (this._mv.loaded) {
      apply();
    } else {
      this._mv.addEventListener("load", apply, { once: true });
    }
  }

  // Set base colour factor on ALL materials using model-viewer's API
  _applyColor(hex) {
    const model = this._mv?.model;
    if (!model) return;
    const [r, g, b] = this._hexToLinear(hex);
    model.materials.forEach(mat => {
      mat.pbrMetallicRoughness.setBaseColorFactor([r, g, b, 1]);
    });
    this._mv.style.filter = "";
  }

  // Convert sRGB hex to linear float [r,g,b] as model-viewer expects
  _hexToLinear(hex) {
    const parse = (s) => parseInt(hex.slice(s, s + 2), 16) / 255;
    const toL   = c  => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    return [toL(parse(1)), toL(parse(3)), toL(parse(5))];
  }
}
