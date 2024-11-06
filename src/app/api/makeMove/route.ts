import { GameModel } from '@/models/game';
import { NextRequest } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';

const winningCombinations = [
  [0, 1, 2], // Top row
  [3, 4, 5], // Middle row
  [6, 7, 8], // Bottom row
  [0, 3, 6], // Left column
  [1, 4, 7], // Middle column
  [2, 5, 8], // Right column
  [0, 4, 8], // Diagonal from top-left
  [2, 4, 6], // Diagonal from top-right
];

function checkWinner(board: string[], player: string): boolean {
  return winningCombinations.some(combination =>
    combination.every(index => board[index] === player)
  );
}

function checkDraw(board: string[]): boolean {
  return board.every(cell => cell === 'X' || cell === 'O');
}

export async function POST(req: NextRequest) {
  const { gameId, index, currentPlayer } = await req.json();
  
  await connectToDatabase();
  const collection = GameModel;
  
  const game = await collection.findOne({ gameId }) || { gameId, board: Array(9).fill('') };


  if (!game.board[index]) {
    game.board[index] = currentPlayer;

    
  const isWinner = checkWinner(game.board, currentPlayer);
  const isDraw = checkDraw(game.board);
  const nextPlayer = currentPlayer === "X" ? "O" : "X";

    await collection.updateOne(
      { gameId },
      { $set: { board: game.board, player: nextPlayer, winner: isWinner ? currentPlayer : isDraw ? 'Draw' : ''  } },
      { upsert: true }
    );
  }

  return new Response(JSON.stringify(game.board), { status: 200 });
}
