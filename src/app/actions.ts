"use server"

import { aiOpponentMoveEvaluator, type AiOpponentMoveEvaluatorInput } from '@/ai/flows/ai-opponent-move-evaluator'
import type { GameState, TokenPosition, PlayerColor } from '@/lib/types';

export async function getAiMove(
    boardState: Record<PlayerColor, string[]>,
    availableMoves: { tokenId: number, newPosition: TokenPosition }[],
    currentPlayerName: string,
    diceValue: number
): Promise<{ tokenId: number, newPosition: TokenPosition } | null> {
    
    if (availableMoves.length === 0) {
        return null;
    }
    if (availableMoves.length === 1) {
        return availableMoves[0];
    }
    
    const input: AiOpponentMoveEvaluatorInput = {
        boardState: boardState,
        availableMoves: availableMoves.map(move => `Token ${move.tokenId} to ${move.newPosition.type} at ${move.newPosition.index}`),
        currentPlayer: currentPlayerName,
        diceValue: diceValue,
    };

    try {
        const result = await aiOpponentMoveEvaluator(input);
        const bestMoveString = result.bestMove;
        
        // Find the move in availableMoves that matches the string from AI
        const matchedMove = availableMoves.find(move => {
            const moveString = `Token ${move.tokenId} to ${move.newPosition.type} at ${move.newPosition.index}`;
            return moveString.toLowerCase() === bestMoveString.toLowerCase();
        });

        return matchedMove || availableMoves[Math.floor(Math.random() * availableMoves.length)]; 
    } catch (error) {
        console.error("Error getting AI move:", error);
        // Fallback to a random move in case of an error
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
}
