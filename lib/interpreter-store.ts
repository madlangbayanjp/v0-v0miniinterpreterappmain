"use client"

import { create } from "zustand"
import { tokenizeExpression, type Token } from "./tokenizer"
import { parseExpressionWithStrategy, astToString, type ASTNode, type ParseStep } from "./parser"
import { evaluateExpression, evaluateWithSteps } from "./evaluator"

interface InterpreterState {
  expression: string
  tokens: Token[]
  parseTree: string
  ast: ASTNode | null
  result: number | null
  evaluationSteps: string[]
  parsingSteps: ParseStep[]
  error: string
  isLoading: boolean
  parsingStrategy: "top-down" | "bottom-up"

  setExpression: (expression: string) => void
  processExpression: (expression: string) => Promise<void>
  reset: () => void
  setParsingStrategy: (strategy: "top-down" | "bottom-up") => void
}

export const useInterpreterStore = create<InterpreterState>((set, get) => ({
  expression: "2 + 3 * 4",
  tokens: [],
  parseTree: "",
  ast: null,
  result: null,
  evaluationSteps: [],
  parsingSteps: [],
  error: "",
  isLoading: false,
  parsingStrategy: "top-down",

  setExpression: (expression: string) => {
    set({ expression, error: "" })
  },

  setParsingStrategy: (strategy: "top-down" | "bottom-up") => {
    set({ parsingStrategy: strategy })
  },

  processExpression: async (expression: string) => {
    set({ isLoading: true, error: "", result: null, parseTree: "", ast: null, evaluationSteps: [], parsingSteps: [] })

    try {
      // Add small delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 100))

      const tokenList = tokenizeExpression(expression)
      const filteredTokens = tokenList.filter((token) => token.type !== "EOF")

      const parseResult = parseExpressionWithStrategy(tokenList, get().parsingStrategy)
      const treeString = astToString(parseResult.ast)

      const finalResult = evaluateExpression(parseResult.ast)
      const { steps } = evaluateWithSteps(parseResult.ast)

      set({
        expression,
        tokens: filteredTokens,
        parseTree: treeString,
        ast: parseResult.ast,
        result: finalResult,
        evaluationSteps: steps,
        parsingSteps: parseResult.steps,
        isLoading: false,
      })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Unknown error occurred",
        tokens: [],
        parseTree: "",
        ast: null,
        result: null,
        evaluationSteps: [],
        parsingSteps: [],
        isLoading: false,
      })
      throw err
    }
  },

  reset: () => {
    set({
      expression: "",
      tokens: [],
      parseTree: "",
      ast: null,
      result: null,
      evaluationSteps: [],
      parsingSteps: [],
      error: "",
      isLoading: false,
    })
  },
}))
