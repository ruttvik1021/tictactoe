import { GameModel } from '@/models/game';
import { NextRequest } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const gameId = searchParams.get('gameId');

  // Connect to MongoDB
  await connectToDatabase();
  const collection = GameModel;

  let isClosed = false;

  // Set up a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Watch for updates on the specific gameId
      const changeStream = collection.watch([{ $match: { 'fullDocument.gameId': gameId } }]);

      // Handle change events
      changeStream.on('change', (change) => {
        if (change.operationType === 'update') {
          const updatedBoard = change.updateDescription.updatedFields.board;
          controller.enqueue(`data: ${JSON.stringify(updatedBoard)}\n\n`);
        }
      });

      // Clean up when the stream is closed
      changeStream.on('close', () => {
        if (!isClosed) {
          controller.close();
          isClosed = true;
        }
      });

      changeStream.on('error', (error) => {
        console.error('Change stream error:', error);
        controller.error(error);
      });

      // Handle client disconnect
      req.signal.addEventListener('abort', () => {
        if (!isClosed) {
          changeStream.close();
          controller.close();
          isClosed = true;
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}