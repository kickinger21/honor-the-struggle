// Creates a Stripe Checkout session for an Honor the Struggle order.
// Prices and shipping are recalculated here from catalog.js, so a customer
// can't change what they pay by editing the page.
// Needs one environment variable in Netlify: STRIPE_SECRET_KEY

const { P, ZONES, RATES, WT, BOX, CLOSE } = require("./catalog");

const STRIPE_API = process.env.STRIPE_API_BASE || "https://api.stripe.com";
const byId = Object.fromEntries(P.map((p) => [p.id, p]));

function zoneFor(zip) {
  if (!/^\d{5}$/.test(zip)) return 0;
  const z3 = parseInt(zip.slice(0, 3), 10);
  let hit = 0;
  for (const r of ZONES) if (z3 >= r[0] && z3 <= r[1]) hit = r[2];
  return hit;
}

function shipQuote(items, zip) {
  const zone = zoneFor(zip);
  if (!zone || !items.length) return null;
  const lb = items.reduce((a, x) => a + (WT[x.id] || 1) * x.qty, 0) + BOX;
  const col = zone - 1;
  const row = RATES.find((r) => lb <= r[0]);
  let price;
  if (row) price = row[1][col];
  else {
    const last = RATES[RATES.length - 1][1][col];
    const per = (last - RATES[RATES.length - 2][1][col]) / 2;
    price = last + Math.ceil(lb - 10) * per;
  }
  price = Math.max(0, price - 3); // $3 off every shipping quote, same as the page
  return { zone, lb, cents: Math.round(price * 100) };
}

// Stripe's API takes form-encoded nested params: a[b][0][c]=x
function encode(obj, prefix, out = []) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === "object") encode(v, key, out);
    else out.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
  }
  return out.join("&");
}

const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Use POST." });
  if (!process.env.STRIPE_SECRET_KEY)
    return json(500, { error: "Card payments aren't set up yet. Please use Venmo for now." });
  if (Date.now() >= CLOSE.getTime()) return json(400, { error: "Orders closed on November 22." });

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Something went wrong reading your order. Refresh and try again." });
  }

  const name = String(body.name || "").trim().slice(0, 80);
  const delivery = body.delivery === "mail" ? "mail" : body.delivery === "pickup" ? "pickup" : "";
  const zip = String(body.zip || "").replace(/\D/g, "").slice(0, 5);
  const raw = Array.isArray(body.items) ? body.items.slice(0, 40) : [];

  if (!name) return json(400, { error: "Add your name so Coach Chad knows whose order it is." });
  if (!delivery) return json(400, { error: "Choose pickup in Warren or shipping." });

  // Rebuild every line from the catalog. Anything that doesn't match is rejected.
  const items = [];
  for (const r of raw) {
    const p = byId[r.id];
    const qty = Math.floor(Number(r.qty));
    if (!p || !(qty >= 1 && qty <= 20)) return json(400, { error: "One of the items in your cart isn't valid. Refresh and try again." });
    const price = p.price[r.size];
    if (price == null) return json(400, { error: `${p.name} doesn't come in size ${r.size}.` });
    const color = p.colors.some((c) => c[0] === r.color) ? r.color : null;
    if (!color) return json(400, { error: `${p.name} doesn't come in ${r.color}.` });
    items.push({ id: p.id, name: p.name, color, size: r.size, qty, cents: Math.round(price * 100) });
  }
  if (!items.length) return json(400, { error: "Pick at least one item first." });

  let ship = null;
  if (delivery === "mail") {
    ship = shipQuote(items, zip);
    if (!ship) return json(400, { error: "Enter a valid 5-digit ZIP code so we can figure your shipping." });
  }

  const site = (process.env.URL || `https://${event.headers.host}`).replace(/\/$/, "");
  const summary = items.map((x) => `${x.qty} x ${x.name}, ${x.color}, ${x.size}`).join(" | ");
  const meta = {
    customer_name: name,
    delivery: delivery === "mail" ? `Ship to ZIP ${zip}` : "Pickup in Warren",
    items: summary.slice(0, 500),
  };

  const params = {
    mode: "payment",
    success_url: `${site}/?paid=1`,
    cancel_url: `${site}/?canceled=1`,
    phone_number_collection: { enabled: true },
    line_items: items.map((x) => ({
      quantity: x.qty,
      price_data: {
        currency: "usd",
        unit_amount: x.cents,
        product_data: { name: x.name, description: x.size === "One size" ? `${x.color}, one size` : `${x.color}, size ${x.size}` },
      },
    })),
    metadata: meta,
    payment_intent_data: {
      description: `Honor the Struggle pre-order: ${name}`.slice(0, 200),
      metadata: meta,
    },
    custom_text: {
      submit: {
        message:
          delivery === "mail"
            ? `Pre-order: printed after orders close Nov 22 and shipped in 3 to 4 weeks by USPS Ground to ZIP ${zip}. Please use an address in that ZIP code.`
            : "Pre-order: printed after orders close Nov 22 and ready for free pickup in Warren, MI in 3 to 4 weeks.",
      },
    },
  };
  if (ship) {
    params.shipping_address_collection = { allowed_countries: ["US"] };
    params.shipping_options = [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          display_name: `USPS Ground Advantage to ${zip}`,
          fixed_amount: { amount: ship.cents, currency: "usd" },
        },
      },
    ];
  }

  try {
    const res = await fetch(`${STRIPE_API}/v1/checkout/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: encode(params),
    });
    const data = await res.json();
    if (!res.ok || !data.url) {
      console.error("Stripe error", data && data.error);
      return json(502, { error: "Card checkout couldn't open. Try again, or pay with Venmo." });
    }
    return json(200, { url: data.url });
  } catch (e) {
    console.error(e);
    return json(502, { error: "Card checkout couldn't open. Try again, or pay with Venmo." });
  }
};
