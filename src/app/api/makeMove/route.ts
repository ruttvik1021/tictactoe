import { GameModel } from '@/models/game';
import { NextRequest } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';

export async function POST(req: NextRequest) {
  const { gameId, index, currentPlayer } = await req.json();
  
  await connectToDatabase();
  const collection = GameModel;
  
  const game = await collection.findOne({ gameId }) || { gameId, board: Array(9).fill('') };

  if (!game.board[index]) {
    game.board[index] = currentPlayer;

    await collection.updateOne(
      { gameId },
      { $set: { board: game.board, player: currentPlayer === "X" ? "O" : "X" } },
      { upsert: true }
    );
  }

  return new Response(JSON.stringify(game.board), { status: 200 });
}
