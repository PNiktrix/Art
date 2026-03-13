// ============================================================
// slider.js — HeroSlider
// ============================================================
// Auto-sliding hero banner at top of gallery page.
// Supports swipe gestures and dot navigation.
// ============================================================

class HeroSlider {
  constructor(trackId, navId) {
    this.track = document.getElementById(trackId);
    this.nav   = document.getElementById(navId);
    this.i     = 0;
    this.total = 0;
    this._timer = null;
  }

  init(products, intervalMs) {
    if (!products.length) return;

    this.total    = products.length;
    this.interval = intervalMs;

    // Build slides
    this.track.innerHTML = products.map(p => `
      <div class="hero-slide">
        <img src="${p.image}" alt="${p.name}" loading="eager"/>
        <div class="hero-grad"></div>
        <div class="hero-caption">
          <h2>${p.name}</h2>
          ${p.tag ? `<span class="hero-tag">${p.tag}</span>` : ""}
        </div>
      </div>`
    ).join("");

    // Build dot navigation
    this.nav.innerHTML = products.map((_, i) =>
      `<div class="hero-dot${i === 0 ? " on" : ""}" data-i="${i}"></div>`
    ).join("");

    this.nav.querySelectorAll(".hero-dot").forEach(d =>
      d.addEventListener("click", () => this.go(+d.dataset.i))
    );

    // Touch swipe support
    let startX = 0;
    this.track.addEventListener("touchstart", e => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    this.track.addEventListener("touchend", e => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 38) dx < 0 ? this.next() : this.prev();
    }, { passive: true });

    this._startAuto();
  }

  go(i) {
    this.i = (i + this.total) % this.total;
    this.track.style.transform = `translateX(-${this.i * 100}%)`;

    this.nav.querySelectorAll(".hero-dot").forEach((d, j) =>
      d.classList.toggle("on", j === this.i)
    );

    this._resetAuto();
  }

  next() { this.go(this.i + 1); }
  prev() { this.go(this.i - 1); }

  _startAuto() {
    this._timer = setInterval(() => this.next(), this.interval);
  }

  _resetAuto() {
    clearInterval(this._timer);
    this._startAuto();
  }
}
