# Honor the Struggle order page (Stripe + Venmo)

- `index.html` is the order page customers see.
- `netlify/functions/checkout.js` opens Stripe checkout. It re-checks every price,
  color, size, and shipping cost on the server, so nobody can change what they pay.
- `netlify/functions/catalog.js` holds the prices and shipping tables the server charges.
  If you change a price, change it here AND in index.html.

Netlify needs one environment variable: `STRIPE_SECRET_KEY`.
Orders close end of day November 21, 2026 (Detroit time).
