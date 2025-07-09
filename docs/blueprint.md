# **App Name**: AMIK LODO

## Core Features:

- Game Setup: Homepage with options for 2-4 players (human or AI), and a 'Start Game' button. Includes 'How to Play' modal with Ludo rules.
- Board Display: Display the responsive Ludo board using SVG, showing paths (red, blue, green, yellow), home areas, and safe zones.
- Turn Management: Implements clickable dice-rolling animation, updates current player turn, and game updates like 'Player 1's turn'.
- Game Logic: Logic implements moving tokens out of the base, capturing tokens, and advancing all tokens to the center square.
- Game End: Winner displayed as soon as one player has placed all four pieces, followed by a 'Restart Game' option.
- AI Opponent: A basic AI to enable a single human player to compete in a match. The AI uses a tool that can evaluate risks, benefits, and progress when choosing moves.
- Leaderboard: Maintains local leaderboard, stores and displays statistics related to single device gameplay.

## Style Guidelines:

- Primary color: Bluish purple (#7E57C2) to represent the core Ludo aesthetic while keeping it modern and inviting in a dark theme.
- Background color: Dark gray (#303030), providing a dark theme backdrop that enhances focus on the game elements.
- Accent color: Teal (#26A69A) complements the purple and adds an element of fun, and contrasts enough for highlights and calls to action.
- Body and headline font: 'Inter' sans-serif, for a modern and clean aesthetic.
- Simple, geometric icons for game actions and status indicators.
- Mobile-first design with a scalable board, optimized for various screen sizes.
- Subtle animations for dice rolls and token movements, enhancing user engagement.