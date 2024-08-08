import { MongoClient } from "mongodb";
import { env } from "../config/env";

const mongoClient = new MongoClient(env.MONGODB_CONNECTION, {
  ssl: true,
});

let mongoDb: MongoClient | null = null;

export async function connectMongoDB() {
  if (!mongoDb) {
    try {
      console.log("Attempting to connect to MongoDB...");
      await mongoClient.connect();
      console.log("Connected to MongoDB.");
      mongoDb = mongoClient;
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      throw error;
    }
  }
  return mongoDb.db("MONGODB");
}

export async function closeMongoDB() {
  if (mongoDb) {
    await mongoClient.close();
    mongoDb = null;
  }
}
