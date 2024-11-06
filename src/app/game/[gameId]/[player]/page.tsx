"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2 } from "lucide-react";

const Game = ({ params }: { params: Promise<{ gameId: string, player: "O" | "X" }> }) => {
  const [gameId, setGameId] = useState<string>("");
  const [board, setBoard] = useState(Array(9).fill(""));
  const [isMyTurn, setIsMyTurn] = useState(true);
  const [myLogo, setMyLogo] = useState('X')
  const [winnerIs, setWinnerIs] = useState(null)

  const getGameId = async () => {
    const gameId = (await params).gameId || "";
    getCurrentGameStatus(gameId);
    setGameId(gameId);
  };

  const getCurrentGameStatus = async (id: string) => {
    const response = await fetch(`/api/getMoves?gameId=${id}`);
    const logo = (await params).player || "";
    const data = await response.json();
    setBoard(data.board);
    setIsMyTurn(data.player === logo);
    setMyLogo(logo)
    setWinnerIs(data.winner)
  };

  useEffect(() => {
    getGameId();
  }, [params]);

  useEffect(() => {
    if (!gameId) return;
    if (winnerIs) return;

    // Polling API every 1 second (1000ms)
    const intervalId = setInterval(async () => {
      try {
        getCurrentGameStatus(gameId)
      } catch (error) {
        console.error("Error polling the API:", error);
      }
    }, 1000);

    // Clean up the interval when the component is unmounted or gameId changes
    return () => {
      clearInterval(intervalId);
    };
  }, [gameId, winnerIs]);

  const handleClick = async (index: number) => {
    if (!isMyTurn || board[index]) return;

    const newBoard = [...board];
    newBoard[index] = myLogo;

    setBoard(newBoard);
    setIsMyTurn(false);

    await fetch("/api/makeMove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, index, currentPlayer: myLogo }),
    });
  };

  const handleShare = () => {
    const shareableUrl = `${window.location.origin}/game/${gameId}/${myLogo === 'X' ? "O" : "X"}`
    navigator.clipboard.writeText(shareableUrl);
    alert("Game link copied to clipboard!");
  };

  const newGame = () => {
    window.location.assign('https://tictactoe-livid-seven.vercel.app');
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Game ID: {gameId}</CardTitle>
        <Button variant="ghost" size="icon" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
          <span className="sr-only">Share</span>
        </Button>
      </CardHeader>
      {winnerIs && <p>Congratulations Winner is {winnerIs}</p>}
      {winnerIs && <button onClick={() => newGame()}>New Game</button>}
      <CardContent>
        <p>{isMyTurn ? myLogo : myLogo === "X" ? "O" : "X"} is playing</p>
        <div className="grid grid-cols-3 gap-4">
          {board?.map((cell, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-20 text-4xl"
              disabled={winnerIs || !isMyTurn || !!cell}
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
