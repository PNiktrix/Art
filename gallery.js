// ============================================================
// gallery.js — GalleryRenderer
// ============================================================
// Renders the product grid and handles card selection visuals.
// ============================================================

class GalleryRenderer {
  constructor(gridId, cart, onToggle) {
    this.el       = document.getElementById(gridId);
    this.cart     = cart;
    this.onToggle = onToggle;
  }

  render(products) {
    this.el.innerHTML = products.map(p => this._cardHTML(p)).join("");

    this.el.querySelectorAll(".card").forEach(card =>
      card.addEventListener("click", () => {
        const id = +card.dataset.id;
        this.onToggle(id);
        card.classList.toggle("sel", this.cart.has(id));
      })
    );
  }

  // Re-render a single card (used after external remove)
  updateCard(id) {
    const card = this.el.querySelector(`.card[data-id="${id}"]`);
    if (card) card.classList.toggle("sel", this.cart.has(id));
  }

  _cardHTML(p) {
    const isSelected = this.cart.has(p.id);
    return `
      <div class="card${isSelected ? " sel" : ""}" data-id="${p.id}">
        <div class="cimg">
          <img src="${p.image}" alt="${p.name}" loading="lazy"/>
          ${p.tag ? `<span class="ctag">${p.tag}</span>` : ""}
          <div class="tick">
            <svg viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        </div>
        <div class="cinfo">
          <div class="cname">${p.name}</div>
          <div class="cprice">${p.displayPrice}</div>
        </div>
      </div>`;
  }
}
