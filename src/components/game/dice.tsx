"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface DiceProps {
  onRoll: () => void
  value: number | null
  isRolling: boolean
  isThinking: boolean
}

const DiceFace = ({ value }: { value: number }) => {
  const dots = Array(value).fill(0);
  return (
    <div className={`grid grid-cols-3 grid-rows-3 w-full h-full p-2 dice-face-${value}`}>
      {dots.map((_, i) => <div key={i} className="w-3 h-3 bg-white rounded-full place-self-center"></div>)}
    </div>
  )
}

export default function Dice({ onRoll, value, isRolling, isThinking }: DiceProps) {
  const [displayValue, setDisplayValue] = useState(value || 1)

  useEffect(() => {
    if (value !== null) {
      setDisplayValue(value)
    }
  }, [value])
  
  const isDisabled = !isRolling || isThinking

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={onRoll}
        disabled={isDisabled}
        className={cn(
          "w-24 h-24 rounded-lg bg-primary text-white flex items-center justify-center transition-all duration-300 transform-gpu",
          "hover:scale-105 hover:bg-primary/90 active:scale-95",
          isDisabled && "cursor-not-allowed bg-muted-foreground/50 scale-95",
          isThinking && "animate-pulse"
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={displayValue}
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            <DiceFace value={displayValue} />
          </motion.div>
        </AnimatePresence>
      </button>
      <p className="text-sm text-muted-foreground h-5">
        {isRolling ? "Roll the dice!" : isThinking ? " " : value ? `You rolled a ${value}` : " "}
      </p>
    </div>
  )
}
