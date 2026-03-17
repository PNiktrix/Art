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
    this.filter   = null;
    this.viewer   = null;
    this.wishlist = null;
    this.search   = null;
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
    this.wa       = new WhatsAppController(CONFIG.WA_NUMBER, this.repo, this.cart);
    this.ig       = new InstagramController(CONFIG.IG_HANDLE, this.repo, this.cart);
    this.tally    = new TallyController(this.repo, this.cart);
    this.ui       = new UIManager(this.cart, this.repo);
    this.wishlist = new WishlistManager(this.repo);
    this.search   = new SearchController(this.repo, filtered => {
      this.gallery.render(filtered);
      this.cart.ids().forEach(id => this.gallery.updateCard(id));
      this.wishlist.syncAfterRender();
    });

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

    // Filter panel — replaces old category bar
    this.filter = new FilterPanel(filtered => {
      this.gallery.render(filtered);
      // Restore cart visuals after re-render
      this.cart.ids().forEach(id => this.gallery.updateCard(id));
    });

    // Hero slider
    this.slider.init(
      this.repo.heroSlides(CONFIG.HERO_SLIDE_COUNT),
      CONFIG.HERO_INTERVAL
    );

    this.gallery.render(products);
    this.filter.init(products);
    this.search.init(products);
    this.wishlist.syncAfterRender();

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

  // Wishlist controls
  wishlistOpen()         { this.wishlist.open(); }
  wishlistClose()        { this.wishlist.close(); }
  wishlistToggle(id)     { this.wishlist.toggle(id); }
  wishlistRemove(id)     { this.wishlist.remove(id); }
  wishlistAddToCart(id)  {
    this.cart.add(id);
    this.gallery.updateCard(id);
    this.ui.sync();
    this.wishlist.close();
    const p = this.repo.byId(id);
    if (p) this.ui.showToast(`"${p.name}" added to order`);
  }

  // Search controls
  searchOpen()   { this.search.open(); }
  searchClose()  { this.search.close(); }
  searchInput()  { this.search.handleInput(); }
  searchSelect(id) { this.search.selectProduct(id); }

  // Filter panel controls
  filterOpen()        { this.filter.open(); }
  filterClose()       { this.filter.close(); }
  filterReset()       { this.filter.reset(); }
  filterCategory(btn) { this.filter.setCategory(btn); }
  filterSize(btn)     { this.filter.setSize(btn); }
  filterSort(btn)     { this.filter.setSort(btn); }
  filterPrice()       { this.filter.setPrice(); }
  filterSlider()      { this.filter.setSlider(); }

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
