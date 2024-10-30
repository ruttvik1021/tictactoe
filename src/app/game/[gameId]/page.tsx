"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2 } from "lucide-react";

const Game = ({ params }: { params: Promise<{ gameId: string }> }) => {
  const [gameId, setGameId] = useState<string>("");
  const [board, setBoard] = useState(Array(9).fill(""));
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [isMyTurn, setIsMyTurn] = useState(true);

  const getGameId = async () => {
    const gameId = (await params).gameId || "";
    getCurrentGameStatus(gameId);
    setGameId(gameId);
  };

  const getCurrentGameStatus = async (id: string) => {
    const response = await fetch(`/api/getMoves?gameId=${id}`);
    const data = await response.json();
    setBoard(data.board);
    setCurrentPlayer(data.player);
    setIsMyTurn(data.player === "X");
  };

  useEffect(() => {
    getGameId();
  }, [params]);

  useEffect(() => {
    // Initialize EventSource to listen to the server for board updates
    const eventSource = new EventSource(`/api/subscribe?gameId=${gameId}`);

    console.log("EventSource initialized", eventSource);

    eventSource.onopen = () => {
      console.log("EventSource connection opened");
    };

    // Handle incoming messages
    eventSource.onmessage = (event) => {
      console.log("Event received:", event.data);
      const updatedBoard = JSON.parse(event.data);
      setBoard(updatedBoard);
    };

    // Handle errors (e.g., when the connection closes or there’s a network issue)
    eventSource.onerror = () => {
      console.error("EventSource failed");
      eventSource.close();
    };

    // Clean up the connection when the component is unmounted
    return () => {
      eventSource.close();
    };
  }, [gameId]);

  const handleClick = async (index: number) => {
    if (!isMyTurn || board[index]) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;

    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    setIsMyTurn(false);

    await fetch("/api/makeMove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, index, currentPlayer }),
    });
  };

  const handleShare = () => {
    const url = `${window.location.href}`;
    navigator.clipboard.writeText(url);
    alert("Game link copied to clipboard!");
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Game ID: {gameId}</CardTitle>
        <Button variant="ghost" size="icon" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
          <span className="sr-only">Share</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {board?.map((cell, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-20 text-4xl"
              // disabled={!isMyTurn || !!cell}
              onClick={() => handleClick(index)}
            >
              {cell}
            </Button>
          ))}
        </div>
        <p className="mt-4 text-center">
          {isMyTurn ? "Your turn" : "Waiting for opponent..."}
        </p>
      </CardContent>
    </Card>
  );
};

export default Game;
