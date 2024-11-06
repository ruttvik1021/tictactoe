import mongoose, { Schema, Document } from 'mongoose';

interface Game extends Document {
  gameId: string;
  board: (string)[]; // Array to represent Tic Tac Toe board
  player: 'X' | 'O' | null;
  winner: string
}

const gameSchema = new Schema<Game>({
  gameId: { type: String, required: true, unique: true },
  board: { type: [String], default: Array(9).fill('') }, // Array of 9 elements (X, O, or null)
  player: { type: String, default: null },
  winner: { type: String, default: "" }
});

export const GameModel = mongoose.models.Game || mongoose.model<Game>('Game', gameSchema);
