import "dotenv/config";
import mongoose from "mongoose";
import Visit from "../modules/visit.module";

const MONGO_URI = process.env.MONGO_DB_URL;
if (!MONGO_URI) throw new Error("MONGO_DB_URL is not set");

const countries = ["NP", "NP", "NP", "IN", "IN", "US", "GB", "DE", "AU", "AE"];
const paths = ["/", "/products", "/blog", "/careers", "/about", "/contact"];
const rand = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const octet = () => Math.floor(Math.random() * 255);

async function seed() {
  await mongoose.connect(MONGO_URI as string);

  // Re-runnable: wipe previous seeded rows only
  await Visit.collection.deleteMany({ seed: true });

  const now = Date.now();
  const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

  const docs = Array.from({ length: 1500 }, () => {
    // Bias toward recent dates so the 24h / 7d views aren't empty
    const createdAt = new Date(now - Math.pow(Math.random(), 2.5) * YEAR_MS);
    return {
      ip: `103.${Math.floor(Math.random() * 40)}.${octet()}.${octet()}`,
      country: rand(countries),
      city: null,
      latitude: null,
      longitude: null,
      path: rand(paths),
      createdAt,
      updatedAt: createdAt,
      seed: true,
    };
  });

  // Bypasses Mongoose so createdAt isn't overwritten with "now"
  await Visit.collection.insertMany(docs);
  console.log(`Seeded ${docs.length} visits`);

  await mongoose.disconnect();
}

seed().catch(async (e) => {
  console.error(e);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
