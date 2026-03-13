# Pniktrix — Wall Art Store
## Complete Project Guide

---

## Project Structure

```
pniktrix/
│
├── index.html              Main website file
│
├── css/
│   └── style.css           All visual styles (sections clearly labeled)
│
├── js/
│   ├── config.js           EDIT THIS FIRST — all your settings in one place
│   ├── pixel.js            Facebook Pixel tracking
│   ├── product.js          Product model + data loader
│   ├── cart.js             Selection/cart logic
│   ├── message.js          WhatsApp + Instagram message builder
│   ├── validator.js        Form field validation
│   ├── whatsapp.js         WhatsApp DM controller
│   ├── instagram.js        Instagram DM controller
│   ├── tally.js            Tally form modal controller
│   ├── slider.js           Hero image slider
│   ├── gallery.js          Product grid renderer
│   ├── ui.js               DOM state manager (header, bar, strip, toast)
│   └── app.js              Main controller — wires everything together
│
├── css/
│   └── style.css           All styles
│
├── data/
│   └── products.json       Your product list — add/edit products here
│
├── images/
│   └── (your art files)    art1.jpg, art2.jpg, art3.jpg ...
│
└── README.md               This file
```

---

## Step 1 — Edit config.js (5 minutes)

Open `js/config.js`. This is the ONLY file you need to edit to configure the store.

Change these values:

```js
WA_NUMBER:  "918433595240"    // Already set — your number
IG_HANDLE:  "p.nik11"         // Already set — your handle
TALLY_URL:  "https://tally.so/r/YOUR_TALLY_FORM_ID"  // Set after Step 2
PIXEL_ID:   "YOUR_PIXEL_ID"   // Set after Step 3
```

---

## Step 2 — Set Up Tally (10 minutes, free)

Tally is the fallback form when someone does not want to DM directly.
Every submission goes directly to your Google Sheet automatically.

1. Go to tally.so — sign up free
2. Click New Form
3. Add these fields: Full Name, WhatsApp Number, City
4. Click Integrations → Google Sheets → Connect → select your sheet
5. Click Share → copy the form URL
6. Paste the URL into TALLY_URL in config.js

Done. Every submission lands in your Google Sheet as a new row.

---

## Step 3 — Set Up Facebook Pixel (10 minutes, free)

The pixel tracks everyone who visits your site.
Instagram then lets you retarget those visitors with your ads — much cheaper and better results.

1. Go to business.facebook.com
2. Events Manager → Connect Data Sources → Web
3. Name your pixel "Pniktrix"
4. Copy the 15-digit Pixel ID
5. Paste it into PIXEL_ID in config.js

What the pixel tracks automatically:
- PageView — every visitor
- AddToCart — when someone selects a print
- Contact — when someone taps WhatsApp or Instagram DM
- Lead — when someone submits the Tally form

---

## Step 4 — Add Your Art Images

1. Export your designs from Canva as JPEG, 1200x1600px
2. Name them: art1.jpg, art2.jpg, art3.jpg (continuing the number)
3. Put them in the /images folder

---

## Step 5 — Update products.json

Open `data/products.json`. For each image add one entry:

```json
{
  "id": 7,
  "name": "Your Art Name",
  "price": "799",
  "image": "images/art7.jpg",
  "tag": "New"
}
```

Tag options: "Bestseller", "New", "Trending", "Popular" — or leave "" for no tag.
Add as many products as you want. No limit.

---

## Step 6 — Upload to GitHub Pages (free hosting)

1. Go to github.com — create free account
2. New repository — name it: pniktrix
3. Set to Public
4. Upload ALL files keeping the folder structure exactly as-is:
   - index.html
   - css/style.css
   - js/ (all JS files)
   - data/products.json
   - images/ (all your art files)
5. Go to Settings → Pages → Source: main branch / root → Save
6. Wait 2 minutes

Your site is live at:
`https://YOUR-USERNAME.github.io/pniktrix`

---

## Step 7 — Test Before Running Ads

Open the live URL on your phone and check:
- Splash appears and fades in 1.6 seconds
- Hero slider auto-plays and swipes work
- Tap a card — gold border + glow + checkmark appears
- Tap WhatsApp — opens WhatsApp with your art names in the message
- Tap Instagram DM — opens your DM screen at p.nik11
- Tap "Prefer to leave details" — Tally modal slides up
- Submit Tally form — check your Google Sheet for the row

---

## Adding More Art Later

1. Upload new image to /images folder on GitHub
2. Add a new entry in data/products.json
3. Commit — site updates in under 1 minute

---

## Total Cost

| Item            | Cost          |
|-----------------|---------------|
| GitHub Pages    | Free forever  |
| Tally.so        | Free forever  |
| Google Sheets   | Free forever  |
| Facebook Pixel  | Free forever  |
| Canva           | Free (basic)  |
| Instagram Ads   | Your choice   |
| Printing        | Only per order|
| **Total fixed** | **Rs. 0**     |

---

## How to Modify Anything

| What you want to change    | Which file to edit        |
|----------------------------|---------------------------|
| WhatsApp number, IG handle | js/config.js              |
| Add/remove products        | data/products.json        |
| All colors and fonts       | css/style.css (tokens)    |
| Message text (WhatsApp/IG) | js/message.js             |
| Slider speed               | js/config.js              |
| Form validation rules      | js/validator.js           |
| Pixel events               | js/pixel.js               |
| Trust strip text           | index.html                |
