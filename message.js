// ============================================================
// message.js — MessageBuilder
// ============================================================
// Builds all outgoing messages for WhatsApp and Instagram.
//
// Rules:
//  - NO prices in any message (only art names)
//  - Tone is regal — customer feels like a valued patron
//  - Each channel gets its own message format
// ============================================================

class MessageBuilder {

  // ── WhatsApp Message ───────────────────────────────────
  static forWhatsApp(repo, cart) {
    if (cart.isEmpty()) {
      return (
        `Hello Pniktrix,\n\n` +
        `I came across your wall art collection and would love to explore it further.\n\n` +
        `Kindly assist me in choosing the right piece for my space.\n\n` +
        `Thank you.`
      );
    }

    const artLines = MessageBuilder._artList(repo, cart);

    return (
      `Hello Pniktrix,\n\n` +
      `I would like to place an order for the following pieces from your collection:\n\n` +
      `${artLines}\n\n` +
      `Kindly share the available sizes, finishes, and delivery details at your earliest convenience.\n\n` +
      `Looking forward to hearing from you.\n` +
      `Thank you.`
    );
  }

  // ── Instagram DM Message ───────────────────────────────
  // Note: Instagram does not support pre-filled DM text via URL.
  // This message is built for reference but IG opens a blank DM screen.
  static forInstagram(repo, cart) {
    if (cart.isEmpty()) {
      return (
        `Hi Pniktrix,\n\n` +
        `I discovered your wall art and am very interested.\n` +
        `Could you help me find something for my space? Thank you.`
      );
    }

    const artLines = MessageBuilder._artList(repo, cart);

    return (
      `Hi Pniktrix,\n\n` +
      `I would like to order the following prints:\n\n` +
      `${artLines}\n\n` +
      `Please let me know the available sizes and how to proceed.\n` +
      `Thank you.`
    );
  }

  // ── Tally Modal Subtitle ───────────────────────────────
  // Short summary shown inside the Tally form modal
  static forTallySubtitle(repo, cart) {
    if (cart.isEmpty()) {
      return "Leave your details and we will reach out personally on WhatsApp.";
    }
    const names = cart.ids()
      .map(id => repo.byId(id)?.name)
      .filter(Boolean);
    return `Selected: ${names.join(", ")}. Leave your info and we will contact you on WhatsApp.`;
  }

  // ── Internal helper ────────────────────────────────────
  static _artList(repo, cart) {
    return cart.ids()
      .map(id => {
        const p = repo.byId(id);
        return p ? `  - ${p.name}` : null;
      })
      .filter(Boolean)
      .join("\n");
  }
}
