"use client"
import React from 'react'
import type { Token, TokenPosition, PlayerColor } from '@/lib/types'
import { BOARD_COORDS } from '@/lib/constants'

type LudoBoardProps = {
  tokens: Token[]
  validMoves: { tokenId: number; newPosition: TokenPosition }[]
  onTokenMove: (tokenId: number) => void
  isMyTurn: boolean
  currentPlayerColor: PlayerColor
}

const StarIcon = ({ x, y }: { x: number; y: number }) => (
  <svg x={x - 8} y={y - 8} width="16" height="16" viewBox="0 0 24 24" fill="rgba(255, 255, 255, 0.7)" stroke="none">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

const TokenPiece = ({ token, isMovable, isCurrentPlayer, onTokenMove }: { token: Token, isMovable: boolean, isCurrentPlayer: boolean, onTokenMove: (id: number) => void }) => {
  const { x, y } = BOARD_COORDS.tokens[token.color][token.position.type][token.position.index]
  const isFinished = token.position.type === 'finished'

  return (
    <g
      onClick={() => isMovable && onTokenMove(token.id)}
      className={`${isMovable ? 'cursor-pointer' : ''} transition-all duration-500 ease-in-out`}
    >
      <circle
        cx={x}
        cy={y}
        r={isFinished ? 8 : 12}
        className={`fill-ludo-${token.color}`}
        stroke="rgba(0,0,0,0.3)"
        strokeWidth="2"
      />
      {isMovable && (
         <circle
          cx={x}
          cy={y}
          r="16"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeDasharray="4 4"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="16"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      )}
    </g>
  )
}

export default function LudoBoard({ tokens, validMoves, onTokenMove, isMyTurn, currentPlayerColor }: LudoBoardProps) {
  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-2xl bg-secondary/30 p-2">
      <svg viewBox="0 0 480 480" className="w-full h-full">
        {/* Base areas */}
        <rect x="0" y="0" width="192" height="192" className="fill-ludo-red" />
        <rect x="288" y="0" width="192" height="192" className="fill-ludo-green" />
        <rect x="0" y="288" width="192" height="192" className="fill-ludo-blue" />
        <rect x="288" y="288" width="192" height="192" className="fill-ludo-yellow" />

        <rect x="48" y="48" width="96" height="96" fill="white" strokeWidth="2" stroke="rgba(0,0,0,0.1)" />
        <rect x="336" y="48" width="96" height="96" fill="white" strokeWidth="2" stroke="rgba(0,0,0,0.1)" />
        <rect x="48" y="336" width="96" height="96" fill="white" strokeWidth="2" stroke="rgba(0,0,0,0.1)" />
        <rect x="336" y="336" width="96" height="96" fill="white" strokeWidth="2" stroke="rgba(0,0,0,0.1)" />
        
        {/* Paths */}
        {BOARD_COORDS.path.map((p, i) => (
          <rect key={i} x={p.x-16} y={p.y-16} width="32" height="32" fill="white" stroke="rgba(0,0,0,0.1)" />
        ))}
        {BOARD_COORDS.homeStretch.red.map((p, i) => <rect key={`hr-${i}`} x={p.x-16} y={p.y-16} width="32" height="32" className="fill-ludo-red" stroke="rgba(0,0,0,0.1)" />)}
        {BOARD_COORDS.homeStretch.green.map((p, i) => <rect key={`hg-${i}`} x={p.x-16} y={p.y-16} width="32" height="32" className="fill-ludo-green" stroke="rgba(0,0,0,0.1)" />)}
        {BOARD_COORDS.homeStretch.blue.map((p, i) => <rect key={`hb-${i}`} x={p.x-16} y={p.y-16} width="32" height="32" className="fill-ludo-blue" stroke="rgba(0,0,0,0.1)" />)}
        {BOARD_COORDS.homeStretch.yellow.map((p, i) => <rect key={`hy-${i}`} x={p.x-16} y={p.y-16} width="32" height="32" className="fill-ludo-yellow" stroke="rgba(0,0,0,0.1)" />)}

        {/* Home triangles */}
        <path d="M 192 192 L 240 240 L 192 288 Z" className="fill-ludo-blue" />
        <path d="M 192 192 L 240 240 L 288 192 Z" className="fill-ludo-red" />
        <path d="M 288 192 L 240 240 L 288 288 Z" className="fill-ludo-green" />
        <path d="M 192 288 L 240 240 L 288 288 Z" className="fill-ludo-yellow" />

        {/* Start markers */}
        <rect x={BOARD_COORDS.start.red.x-16} y={BOARD_COORDS.start.red.y-16} width="32" height="32" className="fill-ludo-red" />
        <rect x={BOARD_COORDS.start.green.x-16} y={BOARD_COORDS.start.green.y-16} width="32" height="32" className="fill-ludo-green" />
        <rect x={BOARD_COORDS.start.blue.x-16} y={BOARD_COORDS.start.blue.y-16} width="32" height="32" className="fill-ludo-blue" />
        <rect x={BOARD_COORDS.start.yellow.x-16} y={BOARD_COORDS.start.yellow.y-16} width="32" height="32" className="fill-ludo-yellow" />

        {/* Safe zones stars */}
        {BOARD_COORDS.safe.map(p => <StarIcon key={`safe-${p.x}-${p.y}`} x={p.x} y={p.y} />)}
        
        {/* Tokens */}
        {tokens.map(token => (
          <TokenPiece
            key={token.id}
            token={token}
            isMovable={isMyTurn && validMoves.some(m => m.tokenId === token.id)}
            isCurrentPlayer={token.color === currentPlayerColor}
            onTokenMove={onTokenMove}
          />
        ))}
      </svg>
    </div>
  )
}
