import { GameModel } from "@/models/game";
import { NextRequest } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const gameId = searchParams.get("gameId");
  
  // Connect to MongoDB
  await connectToDatabase();

  await GameModel.updateOne(
    { gameId },
    { $set: { board: Array(9).fill(""), player: "X", winner: ''  } },
    { upsert: true }
  );

  return new Response(JSON.stringify(Array(9).fill("")), { status: 200 });
}
