"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react"
import type { ParseStep } from "@/lib/bottom-up-parser"

interface ParsingAnimationProps {
  steps: ParseStep[] | string[]
  strategy: "top-down" | "bottom-up"
}

export function ParsingAnimation({ steps, strategy }: ParsingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000) // milliseconds

  const parseSteps: ParseStep[] =
    Array.isArray(steps) && typeof steps[0] === "object"
      ? (steps as ParseStep[])
      : (steps as string[]).map((step, index) => ({
          step: index,
          action: step.includes("SHIFT")
            ? ("shift" as const)
            : step.includes("REDUCE")
              ? ("reduce" as const)
              : step.includes("ACCEPT")
                ? ("accept" as const)
                : ("shift" as const),
          stack: [],
          input: [],
          description: step,
        }))

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && currentStep < parseSteps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep((prev) => prev + 1)
      }, speed)
    } else if (currentStep >= parseSteps.length - 1) {
      setIsPlaying(false)
    }
    return () => clearInterval(interval)
  }, [isPlaying, currentStep, parseSteps.length, speed])

  const handlePlay = () => setIsPlaying(!isPlaying)
  const handleReset = () => {
    setCurrentStep(0)
    setIsPlaying(false)
  }
  const handleNext = () => {
    if (currentStep < parseSteps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const currentStepData = parseSteps[currentStep]

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button onClick={handlePlay} variant="outline" size="sm">
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? "Pause" : "Play"}
        </Button>
        <Button onClick={handleReset} variant="outline" size="sm">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
        <Button onClick={handleNext} variant="outline" size="sm" disabled={currentStep >= parseSteps.length - 1}>
          <SkipForward className="w-4 h-4" />
          Next
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Speed:</span>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="bg-background border border-border rounded px-2 py-1 text-sm"
          >
            <option value={2000}>Slow</option>
            <option value={1000}>Normal</option>
            <option value={500}>Fast</option>
          </select>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Step {currentStep + 1} of {parseSteps.length}
          </span>
          <span>{Math.round(((currentStep + 1) / parseSteps.length) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / parseSteps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Current Step Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    currentStepData?.action === "shift"
                      ? "default"
                      : currentStepData?.action === "reduce"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {currentStepData?.action?.toUpperCase() || "STEP"}
                </Badge>
                <span className="font-mono text-sm">{currentStepData?.description}</span>
              </div>

              {strategy === "bottom-up" && currentStepData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Stack */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Stack:</h4>
                    <div className="flex flex-wrap gap-1">
                      {currentStepData.stack.length > 0 ? (
                        currentStepData.stack.map((symbol, index) => (
                          <motion.div
                            key={index}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Badge variant="outline" className="font-mono">
                              {symbol}
                            </Badge>
                          </motion.div>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">Empty</span>
                      )}
                    </div>
                  </div>

                  {/* Input */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Remaining Input:</h4>
                    <div className="flex flex-wrap gap-1">
                      {currentStepData.input.length > 0 ? (
                        currentStepData.input.map((token, index) => (
                          <motion.div
                            key={index}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Badge variant="outline" className="font-mono">
                              {token}
                            </Badge>
                          </motion.div>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">Empty</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentStepData?.rule && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <span className="font-semibold text-sm">Grammar Rule: </span>
                  <code className="font-mono text-sm">{currentStepData.rule}</code>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Step List */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">All Steps:</h4>
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {parseSteps.map((step, index) => (
            <motion.div
              key={index}
              className={`p-2 rounded text-sm cursor-pointer transition-colors ${
                index === currentStep
                  ? "bg-primary text-primary-foreground"
                  : index < currentStep
                    ? "bg-muted text-muted-foreground"
                    : "hover:bg-muted/50"
              }`}
              onClick={() => setCurrentStep(index)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="font-mono">{step.description}</span>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  )
}
