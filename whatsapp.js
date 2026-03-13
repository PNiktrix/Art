// ============================================================
// whatsapp.js — WhatsAppController
// ============================================================
// Opens WhatsApp with a pre-filled message listing
// the customer's selected art pieces (no prices).
// ============================================================

class WhatsAppController {
  constructor(waNumber, repo, cart) {
    this.waNumber = waNumber;
    this.repo     = repo;
    this.cart     = cart;
  }

  open() {
    PixelTracker.contact();

    const msg = MessageBuilder.forWhatsApp(this.repo, this.cart);
    const url = `https://wa.me/${this.waNumber}?text=${encodeURIComponent(msg)}`;

    window.open(url, "_blank");
  }
}
