"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { tokenizeExpression, type Token } from "@/lib/tokenizer"
import { parseExpression, astToString, type ASTNode } from "@/lib/parser"
import { evaluateExpression, evaluateWithSteps } from "@/lib/evaluator"
import { TreeVisualizer } from "./tree-visualizer"
import { InterpreterError, formatError } from "@/lib/errors"

export function InterpreterInterface() {
  const [expression, setExpression] = useState("2 + 3 * 4")
  const [tokens, setTokens] = useState<Token[]>([])
  const [parseTree, setParseTree] = useState<string>("")
  const [ast, setAst] = useState<ASTNode | null>(null)
  const [result, setResult] = useState<number | null>(null)
  const [evaluationSteps, setEvaluationSteps] = useState<string[]>([])
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const handleInterpret = async () => {
    if (!expression.trim()) {
      setError("Please enter an expression")
      return
    }

    setIsLoading(true)

    try {
      setError("")
      setResult(null)
      setParseTree("")
      setAst(null)
      setEvaluationSteps([])

      // Add small delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 100))

      const tokenList = tokenizeExpression(expression)
      setTokens(tokenList.filter((token) => token.type !== "EOF"))

      const astNode = parseExpression(tokenList)
      setAst(astNode)
      setParseTree(astToString(astNode))

      const finalResult = evaluateExpression(astNode)
      setResult(finalResult)

      const { steps } = evaluateWithSteps(astNode)
      setEvaluationSteps(steps)

      console.log("Tokens:", tokenList)
      console.log("AST:", astNode)
      console.log("Result:", finalResult)
    } catch (err) {
      if (err instanceof InterpreterError) {
        setError(formatError(err, expression))
      } else {
        setError(err instanceof Error ? err.message : "Unknown error occurred")
      }
      setTokens([])
      setParseTree("")
      setAst(null)
      setResult(null)
      setEvaluationSteps([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleInterpret()
    }
  }

  const exampleExpressions = ["2 + 3 * 4", "(5 + 3) * 2", "10 - 4 / 2", "2 * (3 + 4) - 1", "-5 + 3", "1 / 0"]

  const getTokenColor = (type: string) => {
    switch (type) {
      case "NUMBER":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "OPERATOR":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "LPAREN":
      case "RPAREN":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Expression Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter arithmetic expression (e.g., 2 + 3 * 4)"
              className="flex-1 font-mono"
              disabled={isLoading}
            />
            <Button onClick={handleInterpret} className="px-8" disabled={isLoading}>
              {isLoading ? "Processing..." : "Interpret"}
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {exampleExpressions.map((expr, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setExpression(expr)}
                  className="font-mono text-xs"
                  disabled={isLoading}
                >
                  {expr}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <pre className="font-mono text-sm whitespace-pre-wrap">{error}</pre>
          </AlertDescription>
        </Alert>
      )}

      {/* Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tokens Section */}
        <Card>
          <CardHeader>
            <CardTitle>Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            {tokens.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tokens.map((token, index) => (
                  <Badge key={index} variant="outline" className={`font-mono ${getTokenColor(token.type)}`}>
                    <span className="font-semibold">{token.type}</span>
                    <span className="mx-1">:</span>
                    <span>{token.value}</span>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Tokens will appear here after interpretation</p>
            )}
          </CardContent>
        </Card>

        {/* Result Section */}
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            {result !== null ? (
              <div className="text-2xl font-mono font-bold text-primary">{result}</div>
            ) : (
              <p className="text-muted-foreground text-sm">Result will appear here after interpretation</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Parse Tree and Evaluation Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="visual-tree" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="visual-tree">Visual Tree</TabsTrigger>
              <TabsTrigger value="parse-tree">Parse Tree</TabsTrigger>
              <TabsTrigger value="evaluation">Evaluation Steps</TabsTrigger>
            </TabsList>

            <TabsContent value="visual-tree" className="mt-4">
              <TreeVisualizer ast={ast} />
            </TabsContent>

            <TabsContent value="parse-tree" className="mt-4">
              {parseTree ? (
                <pre className="font-mono text-sm bg-muted/50 p-4 rounded overflow-x-auto whitespace-pre-wrap">
                  {parseTree}
                </pre>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Parse tree structure will appear here after interpretation
                </p>
              )}
            </TabsContent>

            <TabsContent value="evaluation" className="mt-4">
              {evaluationSteps.length > 0 ? (
                <pre className="font-mono text-sm bg-muted/50 p-4 rounded overflow-x-auto whitespace-pre-wrap">
                  {evaluationSteps.join("\n")}
                </pre>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Step-by-step evaluation will appear here after interpretation
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
