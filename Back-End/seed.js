// Ye script tumhare products_bulk_payload.json ko seedha MongoDB me daal deta hai —
// admin login/token ki zaroorat nahi hai. Sabse common wajah jab product page pe
// kuch nahi dikhta wo ye hoti hai ki database me abhi koi product hai hi nahi.
//
// Chalane ka tareeka (Back-End folder ke andar se):
//   npm run seed
//
// Ye script .env me diye MONGO_URL se connect karta hai, isliye .env sahi
// configured hona chahiye (PORT, MONGO_URL waghera).

import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dns from "node:dns";
import { product } from "./model/productModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const PAYLOAD_PATH = path.resolve(__dirname, "..", "products_bulk_payload.json");

const run = async () => {
  if (!process.env.MONGO_URL) {
    console.error("❌ MONGO_URL .env file me nahi mila. Pehle Back-End/.env check karo.");
    process.exit(1);
  }

  if (!fs.existsSync(PAYLOAD_PATH)) {
    console.error(`❌ products_bulk_payload.json nahi mili: ${PAYLOAD_PATH}`);
    process.exit(1);
  }

  const products = JSON.parse(fs.readFileSync(PAYLOAD_PATH, "utf-8"));
  console.log(`📦 ${products.length} products payload file me mile.`);

  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error(`❌ MongoDB connect nahi ho paya: ${err.message}`);
    console.error("   Check karo: MONGO_URL sahi hai, password me special characters URL-encoded hain, aur Atlas me tumhara current IP whitelisted hai (Network Access -> Add IP Address -> Allow Access From Anywhere for testing).");
    process.exit(1);
  }

  const existingCount = await product.countDocuments();
  console.log(`ℹ️  Database me abhi ${existingCount} product(s) hai.`);

  try {
    const inserted = await product.insertMany(products, { ordered: false });
    console.log(`✅ ${inserted.length} naye products successfully add ho gaye!`);
  } catch (err) {
    // insertMany with ordered:false continues past duplicate-name errors
    if (err.insertedDocs) {
      console.log(`✅ ${err.insertedDocs.length} products add hue (kuch already exist the, unhe skip kar diya).`);
    } else {
      console.error(`❌ Error while seeding: ${err.message}`);
    }
  }

  const finalCount = await product.countDocuments();
  console.log(`🎉 Total products ab database me: ${finalCount}`);

  await mongoose.disconnect();
  process.exit(0);
};

run();
