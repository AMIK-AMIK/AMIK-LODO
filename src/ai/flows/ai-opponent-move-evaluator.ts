// use server'

/**
 * @fileOverview AI opponent move evaluator flow.
 *
 * - aiOpponentMoveEvaluator - A function that evaluates the best move for the AI opponent.
 * - AiOpponentMoveEvaluatorInput - The input type for the aiOpponentMoveEvaluator function.
 * - AiOpponentMoveEvaluatorOutput - The return type for the aiOpponentMoveEvaluator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiOpponentMoveEvaluatorInputSchema = z.object({
    boardState: z.string().describe('The current state of the Ludo board.'),
    availableMoves: z.array(z.string()).describe('The list of available moves for the AI opponent.'),
    currentPlayer: z.string().describe('The current player (AI).'),
});
export type AiOpponentMoveEvaluatorInput = z.infer<typeof AiOpponentMoveEvaluatorInputSchema>;

const AiOpponentMoveEvaluatorOutputSchema = z.object({
    bestMove: z.string().describe('The best move for the AI opponent based on the evaluation.'),
    evaluationScore: z.number().describe('A numerical score representing the evaluation of the best move.'),
});
export type AiOpponentMoveEvaluatorOutput = z.infer<typeof AiOpponentMoveEvaluatorOutputSchema>;

export async function aiOpponentMoveEvaluator(input: AiOpponentMoveEvaluatorInput): Promise<AiOpponentMoveEvaluatorOutput> {
    return aiOpponentMoveEvaluatorFlow(input);
}

const aiOpponentMoveEvaluatorPrompt = ai.definePrompt({
    name: 'aiOpponentMoveEvaluatorPrompt',
    input: {schema: AiOpponentMoveEvaluatorInputSchema},
    output: {schema: AiOpponentMoveEvaluatorOutputSchema},
    prompt: `You are an expert Ludo strategist. Given the current board state, a list of available moves for the AI opponent, and the current player, evaluate the best move for the AI opponent.

Consider factors such as:
- Risk: The likelihood of a token being captured by an opponent.
- Reward: The progress a move makes towards winning the game (e.g., moving a token closer to the home space).
- Progress: Overall advancement of tokens on the board.

Explain your reasoning and provide a numerical score representing the evaluation of the best move. Return only the best move from the available moves.

Board State: {{{boardState}}}
Available Moves: {{#each availableMoves}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Current Player: {{{currentPlayer}}}

Based on your analysis, what is the best move and its corresponding evaluation score?

Output in JSON format:
{{output}}`,
});

const aiOpponentMoveEvaluatorFlow = ai.defineFlow(
    {
        name: 'aiOpponentMoveEvaluatorFlow',
        inputSchema: AiOpponentMoveEvaluatorInputSchema,
        outputSchema: AiOpponentMoveEvaluatorOutputSchema,
    },
    async input => {
        const {output} = await aiOpponentMoveEvaluatorPrompt(input);
        return output!;
    }
);
