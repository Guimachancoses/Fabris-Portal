"use client"

import React, { useEffect, useState } from "react"

interface CircularProgressProps {
  value: number // 0 a 100
  size?: number // diâmetro em px
  strokeWidth?: number
  color?: string
  bgColor?: string
  duration?: number // duração da animação em ms
}

export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 12,
  color = "rgb(79 70 229)",
  bgColor = "rgba(0,0,0,0.1)",
  duration = 800,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    let start: number | null = null
    const initialValue = animatedValue
    const delta = value - initialValue

    const step = (timestamp: number) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      setAnimatedValue(initialValue + delta * progress)
      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }

    requestAnimationFrame(step)
  }, [value, duration])

  const offset = circumference - (animatedValue / 100) * circumference

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size}>
        <circle
          stroke={bgColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="absolute text-xl font-semibold">
        {animatedValue.toFixed(2)}%
      </span>
    </div>
  )
}
