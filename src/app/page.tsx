"use client";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function TicTacToe() {
  const gameId = Math.random().toString(36).substr(2, 9);

  const initializeTheBoard = async () => {
    await fetch(`/api/initializeTheBoard?gameId=${gameId}`, {
      method: "GET"
    });
  };

  useEffect(() => {
    initializeTheBoard();
    redirect(`/game/${gameId}`);
  }, [gameId]);
}
