// Lightweight shared-secret gate for internal endpoints (registration
// listing/export), mirroring the SCHOOL_DELETE_PASSWORD pattern already
// used in schoolController.js. Send the key as header `x-admin-key`.
//
// If you already have real admin auth (a `protect`/JWT middleware behind
// your admin login), swap that in on the two GET routes in
// zoneRegistrationRoutes.js instead of this — this exists so the listing
// endpoints aren't left wide open while you decide.
const adminKeyAuth = (req, res, next) => {
  const key = req.header("x-admin-key");
  if (!process.env.ADMIN_API_KEY || key !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ success: false, message: "Unauthorized." });
  }
  next();
};

module.exports = adminKeyAuth;