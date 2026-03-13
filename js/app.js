// ============================================================
// app.js — AppController
// ============================================================
// Main controller. Wires all modules together.
// This is the only file that touches CONFIG.
//
// Load order in index.html (bottom of body):
//   config.js → pixel.js → product.js → cart.js →
//   message.js → validator.js → whatsapp.js →
//   instagram.js → tally.js → slider.js →
//   gallery.js → ui.js → app.js
// ============================================================

class AppController {
  constructor() {
    // Instantiate all modules with their dependencies
    this.repo      = new ProductRepository(CONFIG.PRODUCTS_JSON);
    this.cart      = new CartManager();
    this.validator = new FormValidator();

    this.slider  = new HeroSlider("hero-track", "hero-nav");
    this.gallery = null; // set after products load
    this.ui      = null; // set after products load

    this.wa  = null; // WhatsAppController
    this.ig  = null; // InstagramController
    this.tally = null; // TallyController

    // Init Facebook Pixel
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
      this.repo._list = products; // inject fallback into repo
    }

    // Wire up controllers that need repo + cart
    this.wa    = new WhatsAppController(CONFIG.WA_NUMBER, this.repo, this.cart);
    this.ig    = new InstagramController(CONFIG.IG_HANDLE, this.repo, this.cart);
    this.tally = new TallyController(this.repo, this.cart);
    this.ui    = new UIManager(this.cart, this.repo);

    // Hero slider
    this.slider.init(
      this.repo.heroSlides(CONFIG.HERO_SLIDE_COUNT),
      CONFIG.HERO_INTERVAL
    );

    // Gallery
    this.gallery = new GalleryRenderer("grid", this.cart, id => {
      this.cart.toggle(id);
      PixelTracker.addToCart();
      this.ui.sync();

      const p = this.repo.byId(id);
      if (p) this.ui.showToast(
        this.cart.has(id) ? `"${p.name}" selected` : `"${p.name}" removed`
      );
    });

    this.gallery.render(products);
    this.ui.sync();
  }

  // ── Public methods called from HTML onclick attributes ───

  removeFromCart(id) {
    this.cart.remove(id);
    this.gallery.updateCard(id);
    this.ui.sync();
  }

  openBar()     { this.tally.open(); }   // Header "Order Now" pill
  goWhatsApp()  { this.wa.open(); }
  goInstagram() { this.ig.open(); }
  openTally()   { this.tally.open(); }
  closeTally()  { this.tally.close(); }
}

// Boot when DOM is ready
const App = new AppController();
document.addEventListener("DOMContentLoaded", () => App.init());
