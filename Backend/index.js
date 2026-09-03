// backend/server.js
import dns from "node:dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");

import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import corsOptions from "./config/cors.js";
import configurePassport from "./config/passport.js";
import blogRoutes from "./routes/blogRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";

import authRoutes from "./routes/authRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import userProfileRoutes from "./routes/UserProfileRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import subscriptionPlanRoutes from "./routes/subscriptionPlanRoutes.js";
import referralRoutes from "./routes/referralRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import headerConfigRoutes from "./routes/headerConfigRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import shippingRoutes from "./routes/shippingRoutes.js";
import featuredProductRoutes from "./routes/featuredProductRoutes.js";
import paymentSettingsRoutes from "./routes/paymentSettingsRoutes.js"; // ✅ NEW
import contactRoutes from "./routes/contactRoutes.js"; // ✅ NEW — public Contact form
import franchiseRoutes from "./routes/franchiseRoutes.js"; // ✅ NEW — public Franchise inquiry form

console.log("🔧 Importing jewelleryProductRoutes...");
import jewelleryProductRoutes from "./routes/jewelleryProductRoutes.js";
console.log("✅ jewelleryProductRoutes imported successfully");

import superAdminService from "./services/superAdminService.js";
import { initializeDefaultPlans } from "./services/subscriptionPlanService.js";
import { initializeHeaderConfig } from "./services/headerConfigService.js";

import { createServer } from "http";
import { initSocket } from "./socket/socketService.js";

(async () => {
  try {
    console.log("🔧 Initializing Super Admin...");
    await superAdminService.initializeSuperAdmin();
    console.log("✅ Super Admin initialized successfully");

    console.log("🔧 Seeding subscription plans...");
    await initializeDefaultPlans();
    console.log("✅ Subscription plans ready");

    console.log("🔧 Seeding header config...");
    await initializeHeaderConfig();
    console.log("✅ Header config ready");
  } catch (error) {
    console.error("❌ Failed to initialize services:", error.message);
  }
})();

await connectDB();

const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
    contentSecurityPolicy: false,
  }),
);

app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 1000,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser(process.env.COOKIE_SECRET));

const sessionConfig = {
  secret: process.env.COOKIE_SECRET || "default-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: "sessions",
    touchAfter: 24 * 3600,
  }),
};

app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());
configurePassport();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    mongodb: "connected",
  });
});

app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Aurevian Collections API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      superAdmin: "/api/super-admin",
      seller: "/api/seller",
      sellerProducts: "/api/seller/products",
      sellerSubscription: "/api/seller/subscription",
      blog: "/api/blog",
      banners: "/api/banners",
      userProfile: "/api/user-profile",
      referrals: "/api/referrals",
      wallet: "/api/wallet",
      support: "/api/support",
      headerConfig: "/api/header-config",
      cart: "/api/cart",
      wishlist: "/api/wishlist",
      orders: "/api/orders",
      shipping: "/api/shipping",
      featuredProducts: "/api/featured-products",
      paymentSettings: "/api/payment-settings", // ✅ NEW
      contact: "/api/contact", // ✅ NEW
      franchise: "/api/franchise", // ✅ NEW
      health: "/health",
    },
    documentation: "Contact support for API documentation",
  });
});

console.log("\n" + "=".repeat(60));
console.log("🔗 REGISTERING ROUTES");
console.log("=".repeat(60));

console.log("\n📌 Registering /api/seller/products...");
app.use("/api/seller/products", jewelleryProductRoutes);
console.log("✅ /api/seller/products registered");

console.log("\n📌 Registering /api/seller...");
app.use("/api/seller", sellerRoutes);
console.log("✅ /api/seller registered");

console.log("\n📌 Registering other routes...");
app.use("/api/auth", authRoutes);
console.log("  ✅ /api/auth");
app.use("/api/super-admin/subscription-plans", subscriptionPlanRoutes);
console.log("  ✅ /api/super-admin/subscription-plans");
app.use("/api/super-admin", superAdminRoutes);
console.log("  ✅ /api/super-admin");
app.use("/api/seller/subscription", subscriptionRoutes);
console.log("  ✅ /api/seller/subscription");
app.use("/api/banners", bannerRoutes);
console.log("  ✅ /api/banners");
app.use("/api/blog", blogRoutes);
console.log("  ✅ /api/blog");
app.use("/api/user-profile", userProfileRoutes);
console.log("  ✅ /api/user-profile");
app.use("/api/referrals", referralRoutes);
console.log("  ✅ /api/referrals");
app.use("/api/wallet", walletRoutes);
console.log("  ✅ /api/wallet");
app.use("/api/support", supportRoutes);
console.log("  ✅ /api/support");
app.use("/api/header-config", headerConfigRoutes);
console.log("  ✅ /api/header-config");
app.use("/api/cart", cartRoutes);
console.log("  ✅ /api/cart");
app.use("/api/wishlist", wishlistRoutes);
console.log("  ✅ /api/wishlist");
app.use("/api/orders", orderRoutes);
console.log("  ✅ /api/orders");
app.use("/api/shipping", shippingRoutes);
console.log("  ✅ /api/shipping");
app.use("/api/featured-products", featuredProductRoutes);
console.log("  ✅ /api/featured-products");
app.use("/api/payment-settings", paymentSettingsRoutes); // ✅ NEW
console.log("  ✅ /api/payment-settings");
app.use("/api/contact", contactRoutes); // ✅ NEW
console.log("  ✅ /api/contact");
app.use("/api/franchise", franchiseRoutes); // ✅ NEW
console.log("  ✅ /api/franchise");

console.log("\n" + "=".repeat(60));
console.log("✅ ALL ROUTES REGISTERED");
console.log("=".repeat(60));

app.use((req, res) => {
  console.log(`❌ 404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

app.use((err, req, res, next) => {
  console.error("❌ Global Error:", err.message);
  console.error("Stack:", err.stack);

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      message: `Duplicate value for ${field}. Please use a different ${field}.`,
    });
  }

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: messages,
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB.",
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected file field.",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files.",
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }

  if (err.message && err.message.includes("Cloudinary")) {
    return res.status(500).json({
      success: false,
      message: "Image upload service error. Please try again.",
      error: err.message,
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);
initSocket(httpServer);

const server = httpServer.listen(PORT, () => {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 Server Started Successfully");
  console.log("=".repeat(60));
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Port: ${PORT}`);
  console.log(`🔌 Socket.IO: ✅ Attached`);
  console.log(
    `🔗 Client URL: ${process.env.CLIENT_URL || "https://aureviancollections.in"}`,
  );
  console.log(
    `🔑 Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? "✅ Configured" : "❌ Not configured"}`,
  );
  console.log(
    `🔐 JWT Secret: ${process.env.JWT_ACCESS_SECRET ? "✅ Configured" : "❌ Not configured"}`,
  );
  console.log(
    `📊 MongoDB: ${process.env.MONGODB_URI ? "✅ Configured" : "❌ Not configured"}`,
  );
  console.log(
    `📧 Email Service: ${process.env.EMAIL_USER ? "✅ Configured" : "❌ Not configured"}`,
  );
  console.log(
    `📱 Twilio Service: ${process.env.TWILIO_ACCOUNT_SID ? "✅ Configured" : "❌ Not configured"}`,
  );
  console.log(
    `☁️ Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME ? "✅ Configured" : "❌ Not configured"}`,
  );
  console.log(
    `💳 Razorpay: ${process.env.RAZORPAY_KEY_ID ? "✅ Configured" : "⚠️ Not configured (mock mode)"}`,
  );
  console.log(
    `📦 Shiprocket: ${process.env.SHIPROCKET_EMAIL ? "✅ Configured" : "⚠️ Not configured"}`,
  );
  console.log("=".repeat(60));
  console.log("📌 Available Routes:");
  console.log("  🔹 /api/auth - Authentication");
  console.log("  🔹 /api/super-admin - Super Admin");
  console.log("  🔹 /api/seller/products - Product Management ✅");
  console.log("  🔹 /api/seller - Seller");
  console.log("  🔹 /api/seller/subscription - Seller Upgrade/Subscription");
  console.log("  🔹 /api/banners - Banner Management");
  console.log("  🔹 /api/user-profile - User Profile Management");
  console.log("  🔹 /api/blog - Blog Management");
  console.log("  🔹 /api/referrals - Referral Code Management");
  console.log("  🔹 /api/wallet - Wallet Management");
  console.log("  🔹 /api/support - Support Ticket Management");
  console.log("  🔹 /api/header-config - Header Configuration");
  console.log("  🔹 /api/cart - Cart");
  console.log("  🔹 /api/wishlist - Wishlist");
  console.log("  🔹 /api/orders - Orders");
  console.log("  🔹 /api/shipping - Shipping (Shiprocket)");
  console.log("  🔹 /api/featured-products - Featured Product Sections");
  console.log("  🔹 /api/payment-settings - Payment Settings (COD toggle)");
  console.log("  🔹 /api/contact - Contact Page Form Submissions");
  console.log("  🔹 /api/franchise - Franchise Inquiry Form Submissions");
  console.log("  🔹 /health - Health Check");
  console.log("  🔹 /api - API Info");
  console.log("=".repeat(60));
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  server.close(() => {
    console.log("💤 Server closed due to unhandled rejection");
    process.exit(1);
  });
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  server.close(() => {
    console.log("💤 Server closed due to uncaught exception");
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Closing server...");
  server.close(() => {
    console.log("💤 Server closed gracefully");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("\n👋 SIGINT received. Closing server...");
  server.close(() => {
    console.log("💤 Server closed gracefully");
    process.exit(0);
  });
});

export default app;
