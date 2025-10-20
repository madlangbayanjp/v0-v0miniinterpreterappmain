"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { useInterpreterStore } from "@/lib/interpreter-store"
import { InterpreterError, formatError } from "@/lib/errors"
import { NavigationProgress } from "@/components/navigation-progress"
import { PageTransition } from "@/components/page-transition"

export default function InputPage() {
  const router = useRouter()
  const { expression, setExpression, processExpression, error, isLoading, parsingStrategy, setParsingStrategy } =
    useInterpreterStore()
  const [localError, setLocalError] = useState("")

  const handleInterpret = async () => {
    if (!expression.trim()) {
      setLocalError("Please enter an expression")
      return
    }

    setLocalError("")

    try {
      await processExpression(expression)
      // Navigate to tokens page with animation
      router.push("/tokens")
    } catch (err) {
      if (err instanceof InterpreterError) {
        setLocalError(formatError(err, expression))
      } else {
        setLocalError(err instanceof Error ? err.message : "Unknown error occurred")
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleInterpret()
    }
  }

  const exampleExpressions = ["2 + 3 * 4", "(5 + 3) * 2", "10 - 4 / 2", "2 * (3 + 4) - 1", "-5 + 3"]

  return (
    <PageTransition>
      <NavigationProgress />
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <motion.header
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl font-bold text-foreground mb-2">Mini Interpreter</h1>
              <p className="text-muted-foreground text-lg">
                Interactive demonstration of expression parsing and evaluation
              </p>
            </motion.header>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </span>
                    Expression Input
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={expression}
                      onChange={(e) => setExpression(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter arithmetic expression (e.g., 2 + 3 * 4)"
                      className="flex-1 font-mono text-lg"
                      disabled={isLoading}
                    />
                    <Button onClick={handleInterpret} className="px-8 gap-2" disabled={isLoading} size="lg">
                      {isLoading ? (
                        "Processing..."
                      ) : (
                        <>
                          Interpret
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Parsing Strategy:</p>
                    <div className="flex gap-2">
                      <Button
                        variant={parsingStrategy === "top-down" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setParsingStrategy("top-down")}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        Top-Down (Recursive Descent)
                      </Button>
                      <Button
                        variant={parsingStrategy === "bottom-up" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setParsingStrategy("bottom-up")}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        Bottom-Up (Shift-Reduce)
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Try these examples:</p>
                    <div className="flex flex-wrap gap-2">
                      {exampleExpressions.map((expr, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setExpression(expr)}
                            className="font-mono text-xs hover:scale-105 transition-transform"
                            disabled={isLoading}
                          >
                            {expr}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Error Display */}
              {(error || localError) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert variant="destructive" className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <pre className="font-mono text-sm whitespace-pre-wrap">{error || localError}</pre>
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {/* Navigation Steps Preview */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                {[
                  { step: 1, title: "Input", active: true },
                  { step: 2, title: "Tokens", active: false },
                  { step: 3, title: "Parse Tree", active: false },
                  { step: 4, title: "Result", active: false },
                ].map((item, index) => (
                  <Card
                    key={index}
                    className={`transition-all duration-300 ${item.active ? "ring-2 ring-primary" : "opacity-50"}`}
                  >
                    <CardContent className="p-4 text-center">
                      <div
                        className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center text-sm font-bold ${
                          item.active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {item.step}
                      </div>
                      <p className="text-sm font-medium">{item.title}</p>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
