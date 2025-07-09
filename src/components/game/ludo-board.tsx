"use client"
import React from 'react'
import type { Token, TokenPosition, PlayerColor } from '@/lib/types'
import { BOARD_COORDS } from '@/lib/constants'
import { cn } from '@/lib/utils'

type LudoBoardProps = {
  tokens: Token[]
  validMoves: { tokenId: number; newPosition: TokenPosition }[]
  onTokenMove: (tokenId: number) => void
  isMyTurn: boolean
  currentPlayerColor: PlayerColor
}

const StarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255, 255, 255, 0.7)" stroke="none" {...props}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

const TokenPiece = ({ token, isMovable, onTokenMove }: { token: Token, isMovable: boolean, onTokenMove: (id: number) => void }) => {
  const { x, y } = BOARD_COORDS.tokens[token.color][token.position.type][token.position.index]
  const isFinished = token.position.type === 'finished'

  return (
    <g
      onClick={() => isMovable && onTokenMove(token.id)}
      className={`${isMovable ? 'cursor-pointer' : ''} transition-all duration-300 ease-in-out`}
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      <defs>
        <radialGradient id={`grad-${token.color}`}>
          <stop offset="0%" style={{ stopColor: 'white', stopOpacity: 0.7 }} />
          <stop offset="100%" style={{ stopColor: `var(--ludo-${token.color})` }} />
        </radialGradient>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="1" dy="2" stdDeviation="1" floodColor="rgba(0,0,0,0.3)" />
        </filter>
      </defs>
      <circle
        cx={0}
        cy={0}
        r={isFinished ? 8 : 12}
        className={`fill-ludo-${token.color}`}
        stroke="rgba(0,0,0,0.4)"
        strokeWidth="1.5"
        filter="url(#shadow)"
      />
      <circle
        cx={0}
        cy={-2}
        r={isFinished ? 6 : 9}
        fill={`url(#grad-${token.color})`}
      />
      {isMovable && (
         <circle
          cx={0}
          cy={0}
          r="16"
          fill="none"
          stroke="white"
          className="animate-pulse-glow"
        />
      )}
    </g>
  )
}

export default function LudoBoard({ tokens, validMoves, onTokenMove, isMyTurn }: LudoBoardProps) {
  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-2xl bg-secondary/30 p-2">
      <svg viewBox="0 0 480 480" className="w-full h-full">
        {/* Base areas */}
        <rect x="0" y="0" width="192" height="192" className="fill-ludo-red/80" />
        <rect x="288" y="0" width="192" height="192" className="fill-ludo-green/80" />
        <rect x="0" y="288" width="192" height="192" className="fill-ludo-blue/80" />
        <rect x="288" y="288" width="192" height="192" className="fill-ludo-yellow/80" />

        <rect x="48" y="48" width="96" height="96" fill="white" strokeWidth="2" stroke="rgba(0,0,0,0.1)" rx="10"/>
        <rect x="336" y="48" width="96" height="96" fill="white" strokeWidth="2" stroke="rgba(0,0,0,0.1)" rx="10"/>
        <rect x="48" y="336" width="96" height="96" fill="white" strokeWidth="2" stroke="rgba(0,0,0,0.1)" rx="10"/>
        <rect x="336" y="336" width="96" height="96" fill="white" strokeWidth="2" stroke="rgba(0,0,0,0.1)" rx="10"/>
        
        {/* Paths */}
        {BOARD_COORDS.path.map((p, i) => (
          <circle key={`path-${i}`} cx={p.x} cy={p.y} r="14" fill="white" stroke="rgba(0,0,0,0.1)" />
        ))}
        {BOARD_COORDS.homeStretch.red.map((p, i) => <circle key={`hr-${i}`} cx={p.x} cy={p.y} r="14" className="fill-ludo-red" stroke="rgba(0,0,0,0.2)" />)}
        {BOARD_COORDS.homeStretch.green.map((p, i) => <circle key={`hg-${i}`} cx={p.x} cy={p.y} r="14" className="fill-ludo-green" stroke="rgba(0,0,0,0.2)" />)}
        {BOARD_COORDS.homeStretch.blue.map((p, i) => <circle key={`hb-${i}`} cx={p.x} cy={p.y} r="14" className="fill-ludo-blue" stroke="rgba(0,0,0,0.2)" />)}
        {BOARD_COORDS.homeStretch.yellow.map((p, i) => <circle key={`hy-${i}`} cx={p.x} cy={p.y} r="14" className="fill-ludo-yellow" stroke="rgba(0,0,0,0.2)" />)}

        {/* Home triangles */}
        <path d="M 192 192 L 240 240 L 192 288 Z" className="fill-ludo-blue" />
        <path d="M 192 192 L 240 240 L 288 192 Z" className="fill-ludo-red" />
        <path d="M 288 192 L 240 240 L 288 288 Z" className="fill-ludo-green" />
        <path d="M 192 288 L 240 240 L 288 288 Z" className="fill-ludo-yellow" />

        {/* Start markers */}
        <circle cx={BOARD_COORDS.start.red.x} cy={BOARD_COORDS.start.red.y} r="14" className="fill-ludo-red" />
        <circle cx={BOARD_COORDS.start.green.x} cy={BOARD_COORDS.start.green.y} r="14" className="fill-ludo-green" />
        <circle cx={BOARD_COORDS.start.blue.x} cy={BOARD_COORDS.start.blue.y} r="14" className="fill-ludo-blue" />
        <circle cx={BOARD_COORDS.start.yellow.x} cy={BOARD_COORDS.start.yellow.y} r="14" className="fill-ludo-yellow" />
        
        {/* Safe zones stars */}
        {BOARD_COORDS.safe.map(p => <StarIcon key={`safe-${p.x}-${p.y}`} x={p.x - 8} y={p.y - 8} />)}
        
        {/* Tokens */}
        {tokens.map(token => (
          <TokenPiece
            key={token.id}
            token={token}
            isMovable={isMyTurn && validMoves.some(m => m.tokenId === token.id)}
            onTokenMove={onTokenMove}
          />
        ))}
      </svg>
    </div>
  )
}
