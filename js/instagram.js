// ============================================================
// instagram.js — InstagramController
// ============================================================
// Opens Instagram DM to your account.
//
// Important limitation:
//   Instagram does NOT allow pre-filled DM text via URL.
//   The customer will land on your DM screen and must type manually.
//   This is an Instagram platform restriction — nothing we can do.
//   The WhatsApp route sends the full pre-filled message automatically.
// ============================================================

class InstagramController {
  constructor(igHandle, repo, cart) {
    this.igHandle = igHandle;
    this.repo     = repo;
    this.cart     = cart;
  }

  open() {
    PixelTracker.contact();

    // ig.me/m/username opens Instagram DM directly
    // Works in mobile browser and Instagram in-app browser
    const url = `https://ig.me/m/${this.igHandle}`;
    window.open(url, "_blank");
  }
}
