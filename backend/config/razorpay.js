const Razorpay = require("razorpay");
const crypto = require("crypto");

// ── Client instance ─────────────────────────────────────────────────────
// Presence of RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET is fail-fast-checked
// in server.js, same pattern as JWT_SECRET / SCHOOL_DELETE_PASSWORD.
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ────────────────────────────────────────────────────────────────────────────
//  verifyPaymentSignature — checks the checkout-flow callback.
//
//  Razorpay's browser handler fires with { razorpay_order_id,
//  razorpay_payment_id, razorpay_signature }. The signature is
//  HMAC_SHA256("<order_id>|<payment_id>", key_secret) — recomputing it
//  server-side and comparing is the only way to know the callback wasn't
//  forged (a client could otherwise just POST a fake success).
//  Uses crypto.timingSafeEqual to avoid a timing side-channel.
// ────────────────────────────────────────────────────────────────────────────
function verifyPaymentSignature(orderId, paymentId, signature) {
  if (!orderId || !paymentId || !signature) return false;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// ────────────────────────────────────────────────────────────────────────────
//  verifyWebhookSignature — checks server-to-server webhook events.
//
//  Razorpay signs the RAW request body with RAZORPAY_WEBHOOK_SECRET (set
//  separately from the API secret, in Razorpay Dashboard → Webhooks) and
//  sends it as the x-razorpay-signature header. `rawBody` MUST be the
//  untouched request bytes — see routes/paymentWebhookRoutes.js and the
//  express.raw() mounting note in server.js. If Express has already
//  JSON-parsed the body by the time this runs, the signature will never
//  match (re-serializing a parsed object doesn't byte-for-byte match what
//  Razorpay originally sent).
// ────────────────────────────────────────────────────────────────────────────
function verifyWebhookSignature(rawBody, signature) {
  if (!rawBody || !signature) return false;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

module.exports = { razorpay, verifyPaymentSignature, verifyWebhookSignature };