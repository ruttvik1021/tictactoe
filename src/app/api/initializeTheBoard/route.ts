import { GameModel } from "@/models/game";
import { NextRequest } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const gameId = searchParams.get("gameId");

  // Connect to MongoDB
  await connectToDatabase();
  const collection = GameModel;

  const game = await collection.create({
    gameId,
    board: Array(9).fill(""),
    player: "X",
  });

  return new Response(JSON.stringify(game.board), { status: 200 });
}
