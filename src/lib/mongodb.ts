import { MongoClient } from "mongodb";

let clientPromise: Promise<MongoClient> | null = null;

export async function connectToDatabase() {
  if (clientPromise) {
    return clientPromise;
  }

  try {
    const client = new MongoClient(process.env.MONGODB_URI!);
    clientPromise = client.connect();
    console.log("clientPromise", client)
    await clientPromise; // Ensure connection is established
    console.log("Connected to MongoDB");
    return clientPromise;
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw new Error("Failed to connect to MongoDB");
  }
}

export default connectToDatabase;
