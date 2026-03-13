// ============================================================
// pixel.js — Facebook Pixel Tracker
// ============================================================
// Wraps all Facebook Pixel calls in one place.
// Safe to call even if the pixel has not loaded yet.
// ============================================================

class PixelTracker {

  // Called automatically on page load (in index.html head)
  static init(pixelId) {
    if (!pixelId || pixelId === "YOUR_PIXEL_ID") {
      console.info("Pixel: no ID set — tracking disabled.");
      return;
    }

    // Standard Facebook Pixel base code
    !function(f,b,e,v,n,t,s){
      if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
      s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)
    }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');

    fbq('init', pixelId);
    PixelTracker.pageView();
  }

  // ── Events ─────────────────────────────────────────────
  // Fire these from anywhere. They fail silently if pixel not ready.

  static pageView()  { PixelTracker._fire("PageView"); }
  static addToCart() { PixelTracker._fire("AddToCart"); }
  static contact()   { PixelTracker._fire("Contact"); }
  static lead()      { PixelTracker._fire("Lead"); }

  // ── Internal ───────────────────────────────────────────
  static _fire(event, data = {}) {
    try {
      if (typeof fbq === "function") fbq("track", event, data);
    } catch(e) {
      // Pixel not loaded — ignore silently
    }
  }
}
