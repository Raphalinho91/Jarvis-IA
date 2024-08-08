import { MongoClient } from "mongodb";
import { env } from "../config/env";

const mongoClient = new MongoClient(env.MONGODB_CONNECTION);

let mongoDb: MongoClient | null = null;

export async function connectMongoDB() {
  if (!mongoDb) {
    await mongoClient.connect();
    mongoDb = mongoClient;
  }
  return mongoDb.db("MONGODB");
}

export async function closeMongoDB() {
  if (mongoDb) {
    await mongoClient.close();
    mongoDb = null;
  }
}
