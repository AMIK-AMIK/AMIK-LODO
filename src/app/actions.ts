"use server"

import { aiOpponentMoveEvaluator, type AiOpponentMoveEvaluatorInput } from '@/ai/flows/ai-opponent-move-evaluator'
import type { GameState, TokenPosition } from '@/lib/types';

export async function getAiMove(
    boardState: string,
    availableMoves: { tokenId: number, newPosition: TokenPosition }[],
    currentPlayerName: string
): Promise<{ tokenId: number, newPosition: TokenPosition } | null> {
    
    if (availableMoves.length === 0) {
        return null;
    }
    if (availableMoves.length === 1) {
        return availableMoves[0];
    }
    
    const input: AiOpponentMoveEvaluatorInput = {
        boardState: boardState,
        availableMoves: availableMoves.map(move => `Move token ${move.tokenId} to ${move.newPosition.type} at index ${move.newPosition.index}`),
        currentPlayer: currentPlayerName,
    };

    try {
        const result = await aiOpponentMoveEvaluator(input);
        const bestMoveString = result.bestMove;
        
        // Find the move in availableMoves that matches the string from AI
        const matchedMove = availableMoves.find(move => {
            const moveString = `Move token ${move.tokenId} to ${move.newPosition.type} at index ${move.newPosition.index}`;
            return moveString === bestMoveString;
        });

        return matchedMove || availableMoves[0]; // fallback to first available move if AI fails
    } catch (error) {
        console.error("Error getting AI move:", error);
        // Fallback to a random move in case of an error
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
}
