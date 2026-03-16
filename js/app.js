// ============================================================
// app.js — AppController
// ============================================================
// Main controller. Wires all modules together.
//
// Load order in index.html (bottom of body):
//   config.js → pixel.js → product.js → cart.js →
//   message.js → validator.js → whatsapp.js →
//   instagram.js → tally.js → slider.js →
//   gallery.js → category.js → viewer.js → ui.js → app.js
// ============================================================

class AppController {
  constructor() {
    this.repo      = new ProductRepository(CONFIG.PRODUCTS_JSON);
    this.cart      = new CartManager();   // cart auto-loads from localStorage
    this.validator = new FormValidator();

    this.slider   = new HeroSlider("hero-track", "hero-nav");
    this.gallery  = null;
    this.category = null;
    this.viewer   = null;
    this.ui       = null;
    this.wa       = null;
    this.ig       = null;
    this.tally    = null;

    PixelTracker.init(CONFIG.PIXEL_ID);
  }

  async init() {
    // Hide splash
    setTimeout(
      () => document.getElementById("splash").classList.add("out"),
      CONFIG.SPLASH_DURATION
    );

    // Load products
    let products;
    try {
      products = await this.repo.load();
    } catch {
      products = ProductRepository.fallback();
      this.repo._list = products;
    }

    // Wire controllers
    this.wa    = new WhatsAppController(CONFIG.WA_NUMBER, this.repo, this.cart);
    this.ig    = new InstagramController(CONFIG.IG_HANDLE, this.repo, this.cart);
    this.tally = new TallyController(this.repo, this.cart);
    this.ui    = new UIManager(this.cart, this.repo);

    // Viewer — zoom popup
    this.viewer = new ImageViewer("zoom-overlay", this.cart, id => {
      // Sync the gallery card visual after cart change inside viewer
      this.gallery?.updateCard(id);
      this.ui.sync();
    });

    // Gallery — pass onZoom callback to open viewer
    this.gallery = new GalleryRenderer("grid", this.cart,
      // onToggle — card tap selects/deselects
      id => {
        this.cart.toggle(id);
        PixelTracker.addToCart();
        this.ui.sync();
        const p = this.repo.byId(id);
        if (p) this.ui.showToast(
          this.cart.has(id) ? `"${p.name}" selected` : `"${p.name}" removed`
        );
      },
      // onZoom — zoom or 3D button tap opens viewer on correct tab
      (id, tab = "img") => {
        const p = this.repo.byId(id);
        if (p) {
          this.viewer.open(p);
          // If 3D button was tapped, switch to 3D tab after open
          if (tab === "3d" && p.hasModel) {
            requestAnimationFrame(() => this.viewer.switchTab("3d"));
          }
        }
      }
    );

    // Category filter — re-renders gallery with filtered list
    this.category = new CategoryFilter("cat-bar", "sec-label", filtered => {
      this.gallery.render(filtered);
    });

    // Hero slider
    this.slider.init(
      this.repo.heroSlides(CONFIG.HERO_SLIDE_COUNT),
      CONFIG.HERO_INTERVAL
    );

    // Initial render
    this.gallery.render(products);
    this.category.init(products);   // builds pills after gallery renders

    // Restore cart state from localStorage into gallery visuals
    this.cart.ids().forEach(id => this.gallery.updateCard(id));
    this.ui.sync();
  }

  // ── Public methods called from HTML onclick ───────────────

  removeFromCart(id) {
    this.cart.remove(id);
    this.gallery.updateCard(id);
    this.ui.sync();
  }

  // Viewer controls
  closeZoom()           { this.viewer.close(); }
  zoomAddToCart()       { this.viewer.addToCart(); }
  viewerTab(tab)        { this.viewer.switchTab(tab); }
  setWall(btn)          { this.viewer.setWall(btn); }
  setModelColor(btn)    { this.viewer.setModelColor(btn); }

  // Contact bar controls
  openBar()     { this.tally.open(); }
  goWhatsApp()  { this.wa.open(); }
  goInstagram() { this.ig.open(); }
  openTally()   { this.tally.open(); }
  closeTally()  { this.tally.close(); }
}

// Boot
const App = new AppController();
document.addEventListener("DOMContentLoaded", () => App.init());
