"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, RotateCcw, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useInterpreterStore } from "@/lib/interpreter-store"
import { NavigationProgress } from "@/components/navigation-progress"
import { PageTransition } from "@/components/page-transition"

export default function ResultPage() {
  const router = useRouter()
  const { result, evaluationSteps, expression, reset } = useInterpreterStore()

  useEffect(() => {
    if (!expression || result === null) {
      router.push("/input")
    }
  }, [expression, result, router])

  const handleStartOver = () => {
    reset()
    router.push("/input")
  }

  if (!expression || result === null) {
    return null
  }

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
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Evaluation Complete</h1>
              <p className="text-muted-foreground text-lg">Final result for "{expression}"</p>
            </motion.header>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* Result Display */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      4
                    </span>
                    Final Result
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <motion.div
                    className="text-center py-8"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6, type: "spring", stiffness: 150 }}
                  >
                    <div className="text-6xl font-mono font-bold text-primary mb-4">{result}</div>
                    <p className="text-muted-foreground">
                      The expression "{expression}" evaluates to {result}
                    </p>
                  </motion.div>
                </CardContent>
              </Card>

              {/* Evaluation Steps */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Step-by-Step Evaluation</CardTitle>
                </CardHeader>
                <CardContent>
                  {evaluationSteps.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.8 }}
                    >
                      <pre className="font-mono text-sm bg-muted/50 p-6 rounded-lg overflow-x-auto whitespace-pre-wrap border">
                        {evaluationSteps.join("\n")}
                      </pre>
                    </motion.div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No detailed steps available for this evaluation.</p>
                  )}
                </CardContent>
              </Card>

              {/* Summary */}
              <motion.div
                className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-500/20 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
              >
                <h3 className="font-semibold text-lg mb-2">Interpretation Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Expression:</span>
                    <p className="font-mono">{expression}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Tokens:</span>
                    <p>Successfully parsed</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Parse Tree:</span>
                    <p>AST generated</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Result:</span>
                    <p className="font-mono font-bold text-primary">{result}</p>
                  </div>
                </div>
              </motion.div>

              {/* Navigation */}
              <motion.div
                className="flex justify-between"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <Button variant="outline" onClick={() => router.push("/parse-tree")} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Parse Tree
                </Button>
                <Button onClick={handleStartOver} className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Start Over
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
