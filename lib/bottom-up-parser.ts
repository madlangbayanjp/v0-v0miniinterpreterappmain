import type { Token } from "./tokenizer"
import { InterpreterError } from "./errors"
import type { ASTNode } from "./tokenizer"

// Grammar rules for bottom-up parsing
interface GrammarRule {
  lhs: string // Left-hand side (non-terminal)
  rhs: string[] // Right-hand side (terminals and non-terminals)
  action: (children: (ASTNode | Token)[]) => ASTNode
}

export interface ParseStep {
  step: number
  action: "shift" | "reduce" | "accept"
  stack: string[]
  input: string[]
  rule?: string
  description: string
}

export class BottomUpParser {
  private tokens: Token[]
  private stack: (Token | ASTNode)[] = []
  private stackTypes: string[] = [] // Track the type of each stack item
  private currentIndex = 0
  private steps: ParseStep[] = []
  private stepCounter = 0

  private rules: GrammarRule[] = [
    // F -> NUMBER (highest precedence - base case)
    {
      lhs: "F",
      rhs: ["NUMBER"],
      action: (children) => {
        const token = children[0] as Token
        return {
          type: "Number",
          value: Number.parseFloat(token.value),
        }
      },
    },
    // F -> ( E )
    {
      lhs: "F",
      rhs: ["(", "E", ")"],
      action: (children) => children[1] as ASTNode,
    },
    // F -> + F (unary plus)
    {
      lhs: "F",
      rhs: ["+", "F"],
      action: (children) => ({
        type: "UnaryOp",
        value: "+",
        operand: children[1] as ASTNode,
      }),
    },
    // F -> - F (unary minus)
    {
      lhs: "F",
      rhs: ["-", "F"],
      action: (children) => ({
        type: "UnaryOp",
        value: "-",
        operand: children[1] as ASTNode,
      }),
    },
    // T -> F
    {
      lhs: "T",
      rhs: ["F"],
      action: (children) => children[0] as ASTNode,
    },
    // T -> T * F (higher precedence)
    {
      lhs: "T",
      rhs: ["T", "*", "F"],
      action: (children) => ({
        type: "BinaryOp",
        left: children[0] as ASTNode,
        value: "*",
        right: children[2] as ASTNode,
      }),
    },
    // T -> T / F
    {
      lhs: "T",
      rhs: ["T", "/", "F"],
      action: (children) => ({
        type: "BinaryOp",
        left: children[0] as ASTNode,
        value: "/",
        right: children[2] as ASTNode,
      }),
    },
    // E -> T
    {
      lhs: "E",
      rhs: ["T"],
      action: (children) => children[0] as ASTNode,
    },
    // E -> E + T (lowest precedence)
    {
      lhs: "E",
      rhs: ["E", "+", "T"],
      action: (children) => ({
        type: "BinaryOp",
        left: children[0] as ASTNode,
        value: "+",
        right: children[2] as ASTNode,
      }),
    },
    // E -> E - T
    {
      lhs: "E",
      rhs: ["E", "-", "T"],
      action: (children) => ({
        type: "BinaryOp",
        left: children[0] as ASTNode,
        value: "-",
        right: children[2] as ASTNode,
      }),
    },
  ]

  constructor(tokens: Token[]) {
    this.tokens = tokens.filter((t) => t.type !== "EOF")
    this.tokens.push({ type: "EOF", value: "$", position: tokens[tokens.length - 1]?.position || 0 })
  }

  private getCurrentToken(): Token {
    return this.currentIndex < this.tokens.length
      ? this.tokens[this.currentIndex]
      : { type: "EOF", value: "$", position: 0 }
  }

  private getSymbol(item: Token | ASTNode, index?: number): string {
    if (index !== undefined && index < this.stackTypes.length) {
      return this.stackTypes[index]
    }

    if ("type" in item && typeof item.type === "string") {
      // Check if it's a token
      if (item.type === "NUMBER") return "NUMBER"
      if (item.type === "OPERATOR") return (item as Token).value
      if (item.type === "LPAREN") return "("
      if (item.type === "RPAREN") return ")"
      if (item.type === "EOF") return "$"

      // It's an AST node - shouldn't reach here if stackTypes is maintained
      return "E"
    }
    return "UNKNOWN"
  }

  private shouldReduce(): { rule: GrammarRule; ruleIndex: number } | null {
    const lookahead = this.getCurrentToken()
    const lookaheadSymbol = this.getSymbol(lookahead)

    // Try to find a matching rule from longest to shortest
    for (let i = 0; i < this.rules.length; i++) {
      const rule = this.rules[i]
      if (this.stackTypes.length >= rule.rhs.length) {
        const topSymbols = this.stackTypes.slice(-rule.rhs.length)

        // Check if top of stack matches rule exactly
        if (this.exactlyMatchesRule(topSymbols, rule.rhs)) {
          // Use lookahead to decide if we should reduce
          if (this.canReduceWithLookahead(rule.lhs, lookaheadSymbol)) {
            return { rule, ruleIndex: i }
          }
        }
      }
    }
    return null
  }

  private exactlyMatchesRule(stackSymbols: string[], ruleRhs: string[]): boolean {
    if (stackSymbols.length !== ruleRhs.length) return false

    for (let i = 0; i < stackSymbols.length; i++) {
      if (stackSymbols[i] !== ruleRhs[i]) {
        return false
      }
    }
    return true
  }

  private canReduceWithLookahead(lhs: string, lookahead: string): boolean {
    // Can always reduce if we're at end of input
    if (lookahead === "$") return true

    // Reduce rules for non-terminals based on lookahead
    if (lhs === "E") {
      // E can be reduced when followed by +, -, ), or $
      return ["+", "-", ")", "$"].includes(lookahead)
    }
    if (lhs === "T") {
      // T can be reduced when followed by +, -, *, /, ), or $
      return ["+", "-", "*", "/", ")", "$"].includes(lookahead)
    }
    if (lhs === "F") {
      // F can be reduced when followed by +, -, *, /, ), or $
      return ["+", "-", "*", "/", ")", "$"].includes(lookahead)
    }

    return true
  }

  private shift(): void {
    const token = this.getCurrentToken()
    this.stack.push(token)
    this.stackTypes.push(this.getSymbol(token))
    this.currentIndex++

    this.steps.push({
      step: ++this.stepCounter,
      action: "shift",
      stack: [...this.stackTypes],
      input: this.tokens.slice(this.currentIndex).map((t) => t.value),
      description: `Shift token: ${token.value}`,
    })
  }

  private reduce(rule: GrammarRule, ruleIndex: number): void {
    const children: (ASTNode | Token)[] = []

    // Get items from stack according to rule (before popping)
    for (let i = 0; i < rule.rhs.length; i++) {
      children.unshift(this.stack[this.stack.length - rule.rhs.length + i] as ASTNode | Token)
    }

    // Now pop items from stack according to rule
    for (let i = 0; i < rule.rhs.length; i++) {
      this.stack.pop()
      this.stackTypes.pop()
    }

    // Apply rule action to create new AST node
    const newNode = rule.action(children)
    this.stack.push(newNode)
    this.stackTypes.push(rule.lhs)

    this.steps.push({
      step: ++this.stepCounter,
      action: "reduce",
      stack: [...this.stackTypes],
      input: this.tokens.slice(this.currentIndex).map((t) => t.value),
      rule: `${rule.lhs} → ${rule.rhs.join(" ")}`,
      description: `Reduce by rule: ${rule.lhs} → ${rule.rhs.join(" ")}`,
    })
  }

  public parse(): { ast: ASTNode; steps: ParseStep[] } {
    if (this.tokens.length <= 1) {
      throw new InterpreterError("Empty expression", 0, "PARSER")
    }

    this.steps.push({
      step: 0,
      action: "shift",
      stack: [],
      input: this.tokens.map((t) => t.value),
      description: "Starting bottom-up parsing...",
    })

    let iterations = 0
    const maxIterations = 1000

    while (iterations < maxIterations) {
      iterations++
      const currentToken = this.getCurrentToken()

      if (this.stackTypes.length === 1 && currentToken.type === "EOF" && this.stackTypes[0] === "E") {
        this.steps.push({
          step: ++this.stepCounter,
          action: "accept",
          stack: [...this.stackTypes],
          input: [],
          description: "Accept: Parsing complete",
        })
        return { ast: this.stack[0] as ASTNode, steps: this.steps }
      }

      // Check if we can reduce
      const reduction = this.shouldReduce()

      if (reduction) {
        this.reduce(reduction.rule, reduction.ruleIndex)
      } else if (currentToken.type !== "EOF") {
        // Shift
        this.shift()
      } else {
        // Error - can't reduce and at end of input
        throw new InterpreterError("Syntax error: unexpected end of expression", currentToken.position, "PARSER")
      }
    }

    throw new InterpreterError("Parser error: maximum iterations exceeded", 0, "PARSER")
  }
}

export function parseExpressionBottomUp(tokens: Token[]): { ast: ASTNode; steps: ParseStep[] } {
  const parser = new BottomUpParser(tokens)
  return parser.parse()
}
