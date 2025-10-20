"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, TreePine, List, Play } from "lucide-react"
import { motion } from "framer-motion"
import { useInterpreterStore } from "@/lib/interpreter-store"
import { TreeVisualizer } from "@/components/tree-visualizer"
import { NavigationProgress } from "@/components/navigation-progress"
import { PageTransition } from "@/components/page-transition"
import { ParsingAnimation } from "@/components/parsing-animation"

export default function ParseTreePage() {
  const router = useRouter()
  const { ast, parseTree, parsingSteps, expression, parsingStrategy } = useInterpreterStore()

  useEffect(() => {
    if (!expression || !ast) {
      router.push("/input")
    }
  }, [expression, ast, router])

  if (!expression || !ast) {
    return null
  }

  const strategyLabel = parsingStrategy === "bottom-up" ? "Bottom-Up (Shift-Reduce)" : "Top-Down (Recursive Descent)"
  const strategyDescription =
    parsingStrategy === "bottom-up"
      ? 'Abstract Syntax Tree for "' + expression + '" using shift-reduce parsing'
      : 'Abstract Syntax Tree for "' + expression + '" using recursive descent parsing'

  return (
    <PageTransition>
      <NavigationProgress />
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <motion.header
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-foreground">Parse Tree</h1>
                <Badge variant={parsingStrategy === "bottom-up" ? "secondary" : "default"} className="text-sm">
                  {strategyLabel}
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg">{strategyDescription}</p>
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
                      3
                    </span>
                    Parse Tree Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="visual-tree" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="visual-tree" className="gap-2">
                        <TreePine className="w-4 h-4" />
                        Visual Tree
                      </TabsTrigger>
                      <TabsTrigger value="text-tree" className="gap-2">
                        <List className="w-4 h-4" />
                        Text Tree
                      </TabsTrigger>
                      <TabsTrigger value="parsing-steps" className="gap-2">
                        <ArrowRight className="w-4 h-4" />
                        Steps
                      </TabsTrigger>
                      <TabsTrigger value="animated-parsing" className="gap-2">
                        <Play className="w-4 h-4" />
                        Animation
                      </TabsTrigger>
                      <TabsTrigger value="comparison" className="gap-2">
                        <TreePine className="w-4 h-4" />
                        Comparison
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="visual-tree" className="mt-6">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                      >
                        <TreeVisualizer ast={ast} />
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="text-tree" className="mt-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                      >
                        <pre className="font-mono text-sm bg-muted/50 p-6 rounded-lg overflow-x-auto whitespace-pre-wrap border">
                          {parseTree}
                        </pre>
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="parsing-steps" className="mt-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <Badge variant={parsingStrategy === "bottom-up" ? "secondary" : "default"}>
                            {strategyLabel}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {parsingStrategy === "bottom-up"
                              ? "Starts from tokens, shifts and reduces to build tree"
                              : "Starts from root, works down to leaves"}
                          </span>
                        </div>

                        <div className="bg-muted/50 p-6 rounded-lg border">
                          <h4 className="font-semibold mb-3 text-sm">Parsing Steps:</h4>
                          <div className="space-y-2">
                            {parsingSteps.map((step, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                                className="flex items-center gap-3 text-sm"
                              >
                                <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-mono">
                                  {index + 1}
                                </span>
                                <div className="flex-1">
                                  <span className="font-mono">{step.description}</span>
                                  {parsingStrategy === "bottom-up" && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {step.stack.length > 0 && <span>Stack: [{step.stack.join(", ")}]</span>}
                                      {step.input.length > 0 && <span> | Input: [{step.input.join(", ")}]</span>}
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="animated-parsing" className="mt-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                      >
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={parsingStrategy === "bottom-up" ? "secondary" : "default"}>
                              {strategyLabel}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Interactive step-by-step parsing animation
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {parsingStrategy === "bottom-up"
                              ? "Watch how the parser shifts tokens onto the stack and reduces them according to grammar rules, building the tree from bottom to top."
                              : "Watch how the parser starts from the root expression and recursively breaks it down into smaller components."}
                          </p>
                        </div>
                        <ParsingAnimation steps={parsingSteps} strategy={parsingStrategy} />
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="comparison" className="mt-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="space-y-6"
                      >
                        <div className="text-center mb-6">
                          <h3 className="text-lg font-semibold mb-2">Parsing Strategy Comparison</h3>
                          <p className="text-sm text-muted-foreground">
                            Educational comparison of top-down vs bottom-up parsing approaches
                          </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Top-Down Section */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Badge variant="default">Top-Down</Badge>
                                <span className="text-sm font-normal text-muted-foreground">
                                  {parsingStrategy === "top-down" ? "(Currently Used)" : "(Alternative)"}
                                </span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <h4 className="font-semibold text-sm mb-2">How it works:</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  <li>• Starts with the goal (expression)</li>
                                  <li>• Recursively breaks down into smaller parts</li>
                                  <li>• Uses recursive descent parsing</li>
                                  <li>• Builds tree from root to leaves</li>
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm mb-2">Advantages:</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  <li>• Easy to understand and implement</li>
                                  <li>• Natural for recursive grammars</li>
                                  <li>• Good error recovery</li>
                                </ul>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Bottom-Up Section */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Badge variant="secondary">Bottom-Up</Badge>
                                <span className="text-sm font-normal text-muted-foreground">
                                  {parsingStrategy === "bottom-up" ? "(Currently Used)" : "(Alternative)"}
                                </span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <h4 className="font-semibold text-sm mb-2">How it works:</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  <li>• Starts with tokens (leaves)</li>
                                  <li>• Shifts and reduces using grammar rules</li>
                                  <li>• Uses shift-reduce parsing</li>
                                  <li>• Builds tree from leaves to root</li>
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm mb-2">Advantages:</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  <li>• Handles more grammar types</li>
                                  <li>• More powerful than top-down</li>
                                  <li>• Used in parser generators</li>
                                </ul>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <Card className="bg-muted/50">
                          <CardContent className="p-6">
                            <h4 className="font-semibold mb-3">Why we use {strategyLabel}:</h4>
                            <p className="text-sm text-muted-foreground">
                              {parsingStrategy === "bottom-up"
                                ? "Bottom-up (shift-reduce) parsing is more powerful and can handle a wider variety of grammars. It works by reading tokens from left to right, shifting them onto a stack, and reducing them according to grammar rules. This approach is used in many professional parser generators like YACC and Bison."
                                : "Top-down parsing is more intuitive for educational purposes as it mirrors how humans naturally think about breaking down problems. It's easier to visualize and understand the parsing process when starting from the high-level goal and working down to the details. Bottom-up parsing, while more powerful, can be harder to follow as it builds the solution from the ground up."}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </TabsContent>
                  </Tabs>

                  <motion.div
                    className="mt-6 p-4 bg-muted/50 rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    <h4 className="font-semibold mb-2">Understanding the Tree:</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• The tree shows operator precedence: multiplication/division before addition/subtraction</p>
                      <p>• Leaf nodes (circles) contain numbers</p>
                      <p>• Internal nodes (squares) contain operators</p>
                      <p>• The tree is evaluated from bottom to top</p>
                      <p>
                        • <strong>{strategyLabel}:</strong>{" "}
                        {parsingStrategy === "bottom-up"
                          ? "Starts with tokens and builds up the tree by shifting and reducing"
                          : "Starts with the goal (expression) and breaks it down into smaller parts"}
                      </p>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>

              <motion.div
                className="flex justify-between"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
              >
                <Button variant="outline" onClick={() => router.push("/tokens")} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Tokens
                </Button>
                <Button onClick={() => router.push("/result")} className="gap-2">
                  View Result
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
