  import jwt from "jsonwebtoken";

  export function requireAuth(req, res, next) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
      }

      const token = authHeader.split(" ")[1];

      // Verify token using your JWT secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");

      // Attach userId to request
      req.userId = decoded.userId || decoded.id;

      next();
    } catch (err) {
      console.error("Auth error:", err.message);
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  }

  // Backwards-compatible default export
  export default requireAuth;
