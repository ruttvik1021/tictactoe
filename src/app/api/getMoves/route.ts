import { GameModel } from '@/models/game';
import { NextRequest } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get('gameId');
    
  // Connect to MongoDB
  await connectToDatabase();
  const collection = GameModel;
  
  const game = await collection.findOne({ gameId });

  return new Response(JSON.stringify(game), { status: 200 });
}