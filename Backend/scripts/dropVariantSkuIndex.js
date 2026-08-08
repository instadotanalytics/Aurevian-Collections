// scripts/dropVariantSkuIndex.js

import "dotenv/config";
import dns from "node:dns";
import mongoose from "mongoose";

// Force IPv4 resolution first — fixes TLS handshake timeouts on some
// Windows/ISP/VPN setups when connecting to MongoDB Atlas SRV records.
dns.setDefaultResultOrder("ipv4first");

async function run() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ Connected to MongoDB");

    const collection = mongoose.connection.collection("jewelleryproducts");

    try {
      await collection.dropIndex("variants.sku_1");
      console.log("✅ Dropped index variants.sku_1");
    } catch (err) {
      if (err.codeName === "IndexNotFound") {
        console.log("ℹ️ Index variants.sku_1 does not exist, nothing to drop");
      } else {
        throw err;
      }
    }

    await mongoose.disconnect();
    console.log("✅ Disconnected. Done.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to drop index:", err);
    process.exit(1);
  }
}

run();
