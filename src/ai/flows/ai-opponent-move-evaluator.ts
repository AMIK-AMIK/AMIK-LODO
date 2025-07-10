'use server'

/**
 * @fileOverview An AI agent that plays Ludo.
 *
 * - aiOpponentMoveEvaluator - A function that chooses the best move for a Ludo AI player.
 * - AiOpponentMoveEvaluatorInput - The input type for the function.
 * - AiOpponentMoveEvaluatorOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BoardStateSchema = z.object({
  red: z.array(z.string()).describe("Positions of red tokens (e.g., 'base 1', 'track 23', 'home-stretch 2', 'finished 0')"),
  green: z.array(z.string()).describe("Positions of green tokens"),
  yellow: z.array(z.string()).describe("Positions of yellow tokens"),
  blue: z.array(z.string()).describe("Positions of blue tokens"),
});


const AiOpponentMoveEvaluatorInputSchema = z.object({
    boardState: BoardStateSchema.describe("The current position of every token on the board, categorized by color."),
    availableMoves: z.array(z.string()).describe('A list of all possible moves the AI can make this turn.'),
    currentPlayer: z.string().describe('The name of the current AI player whose turn it is.'),
    diceValue: z.number().describe('The value of the current dice roll.'),
});
export type AiOpponentMoveEvaluatorInput = z.infer<typeof AiOpponentMoveEvaluatorInputSchema>;

const AiOpponentMoveEvaluatorOutputSchema = z.object({
    bestMove: z.string().describe('The single best move selected from the list of available moves.'),
    reasoning: z.string().describe("A brief explanation for why this move was chosen over the others."),
});
export type AiOpponentMoveEvaluatorOutput = z.infer<typeof AiOpponentMoveEvaluatorOutputSchema>;

export async function aiOpponentMoveEvaluator(input: AiOpponentMoveEvaluatorInput): Promise<AiOpponentMoveEvaluatorOutput> {
    return aiOpponentMoveEvaluatorFlow(input);
}

const prompt = ai.definePrompt({
    name: 'aiOpponentMoveEvaluatorPrompt',
    input: {schema: AiOpponentMoveEvaluatorInputSchema},
    output: {schema: AiOpponentMoveEvaluatorOutputSchema},
    prompt: `You are a world-class Ludo strategy expert. Your goal is to win the game by making the most optimal move each turn.

Game Rules Summary:
- Tokens start in the 'base'. A roll of 6 is required to move a token from 'base' to its 'track' start.
- Rolling a 6 grants an extra turn. Rolling three 6s in a row forfeits the turn.
- A token can capture an opponent's token by landing on the same square, sending the opponent's token back to its base. This is not possible on 'safe zones' or if the opponent has a block.
- Safe zones are specific squares on the track where tokens cannot be captured. The starting square for each color is a safe zone.
- Two tokens of the same color on the same square create a 'block', which opponents cannot pass.
- To win, all four of a player's tokens must reach the 'finished' state.

Your Task:
Analyze the provided game state and select the best move from the list of 'availableMoves'.

Your Decision-Making Priorities:
1.  **Winning Move**: If a move results in a token reaching the 'finished' state, prioritize it.
2.  **Capture Opponent**: Prioritize moves that capture an opponent's token, especially if their token is far along the track.
3.  **Create a Block**: If possible, create a block on a strategic square to hinder opponents.
4.  **Save a Token**: If one of your tokens is threatened by an opponent, prioritize moving it to a safe zone or away from danger.
5.  **Advance Tokens**: Move tokens out of the base and along the track. Spreading tokens out is generally better than having them clustered.
6.  **Break a Block**: Sometimes it's necessary to move a token from your own block to advance or make a capture.

Current Game State:
- AI Player: {{{currentPlayer}}}
- Dice Roll: {{{diceValue}}}
- Board Layout:
  - Red: {{#each boardState.red}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  - Green: {{#each boardState.green}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  - Yellow: {{#each boardState.yellow}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  - Blue: {{#each boardState.blue}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Available Moves:
{{#each availableMoves}}
- {{{this}}}
{{/each}}

Based on your expert analysis, which move is the most strategic? Provide your reasoning.
`,
});

const aiOpponentMoveEvaluatorFlow = ai.defineFlow(
    {
        name: 'aiOpponentMoveEvaluatorFlow',
        inputSchema: AiOpponentMoveEvaluatorInputSchema,
        outputSchema: AiOpponentMoveEvaluatorOutputSchema,
    },
    async input => {
        if (input.availableMoves.length === 1) {
            return {
                bestMove: input.availableMoves[0],
                reasoning: "This was the only move available.",
            };
        }
        if (input.availableMoves.length === 0) {
            return {
                bestMove: "",
                reasoning: "No moves are available.",
            };
        }
        const {output} = await prompt(input);
        return output!;
    }
);
