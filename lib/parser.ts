import type { Token } from "./tokenizer"
import { InterpreterError } from "./errors"
import type { ASTNode } from "./tokenizer"
import { parseExpressionBottomUp } from "./bottom-up-parser"

export type ParsingStrategy = "top-down" | "bottom-up"

export interface ParseStep {
  step: number
  action: "shift" | "reduce" | "accept" | "process"
  stack: string[]
  input: string[]
  rule?: string
  description: string
}

export interface ParseResult {
  ast: ASTNode
  steps: ParseStep[]
  strategy: ParsingStrategy
}

export class Parser {
  private tokens: Token[]
  private currentTokenIndex = 0
  private currentToken: Token

  constructor(tokens: Token[]) {
    this.tokens = tokens
    this.currentToken = this.tokens[0]
  }

  private error(message: string): never {
    throw new InterpreterError(message, this.currentToken.position, "PARSER")
  }

  private eat(tokenType: Token["type"]): void {
    if (this.currentToken.type === tokenType) {
      this.currentTokenIndex++
      if (this.currentTokenIndex < this.tokens.length) {
        this.currentToken = this.tokens[this.currentTokenIndex]
      }
    } else {
      this.error(`Expected ${tokenType}, got ${this.currentToken.type}`)
    }
  }

  protected factor(): ASTNode {
    const token = this.currentToken

    if (token.type === "OPERATOR" && (token.value === "+" || token.value === "-")) {
      this.eat("OPERATOR")
      const operand = this.factor()
      return {
        type: "UnaryOp",
        value: token.value,
        operand,
      }
    } else if (token.type === "NUMBER") {
      this.eat("NUMBER")
      const numValue = Number.parseFloat(token.value)
      if (isNaN(numValue)) {
        throw new InterpreterError(`Invalid number: '${token.value}'`, token.position, "PARSER")
      }
      return {
        type: "Number",
        value: numValue,
      }
    } else if (token.type === "LPAREN") {
      this.eat("LPAREN")
      const node = this.expr()
      this.eat("RPAREN")
      return node
    }

    this.error(`Unexpected token: ${token.type} '${token.value}'`)
  }

  protected term(): ASTNode {
    let node = this.factor()

    while (
      this.currentToken.type === "OPERATOR" &&
      (this.currentToken.value === "*" || this.currentToken.value === "/")
    ) {
      const token = this.currentToken
      this.eat("OPERATOR")

      node = {
        type: "BinaryOp",
        left: node,
        value: token.value,
        right: this.factor(),
      }
    }

    return node
  }

  protected expr(): ASTNode {
    let node = this.term()

    while (
      this.currentToken.type === "OPERATOR" &&
      (this.currentToken.value === "+" || this.currentToken.value === "-")
    ) {
      const token = this.currentToken
      this.eat("OPERATOR")

      node = {
        type: "BinaryOp",
        left: node,
        value: token.value,
        right: this.term(),
      }
    }

    return node
  }

  public parse(): ASTNode {
    if (this.tokens.length === 0 || (this.tokens.length === 1 && this.tokens[0].type === "EOF")) {
      throw new InterpreterError("Empty expression", 0, "PARSER")
    }

    const node = this.expr()

    if (this.currentToken.type !== "EOF") {
      this.error(`Unexpected token at end: ${this.currentToken.type} '${this.currentToken.value}'`)
    }

    return node
  }
}

export class TopDownParser extends Parser {
  private steps: ParseStep[] = []
  private stepCounter = 0

  constructor(tokens: Token[]) {
    super(tokens)
    this.steps.push({
      step: 0,
      action: "process",
      stack: [],
      input: tokens.map((t) => t.value),
      description: "Starting top-down parsing...",
    })
  }

  protected override factor(): ASTNode {
    const token = this.currentToken
    this.steps.push({
      step: ++this.stepCounter,
      action: "process",
      stack: [],
      input: [],
      description: `Processing factor: ${token.value}`,
    })

    if (token.type === "OPERATOR" && (token.value === "+" || token.value === "-")) {
      this.eat("OPERATOR")
      const operand = this.factor()
      const node = {
        type: "UnaryOp" as const,
        value: token.value,
        operand,
      }
      this.steps.push({
        step: ++this.stepCounter,
        action: "reduce",
        stack: [],
        input: [],
        description: `Created unary operation: ${token.value}`,
      })
      return node
    } else if (token.type === "NUMBER") {
      this.eat("NUMBER")
      const numValue = Number.parseFloat(token.value)
      if (isNaN(numValue)) {
        throw new InterpreterError(`Invalid number: '${token.value}'`, token.position, "PARSER")
      }
      const node = {
        type: "Number" as const,
        value: numValue,
      }
      this.steps.push({
        step: ++this.stepCounter,
        action: "reduce",
        stack: [],
        input: [],
        description: `Created number node: ${numValue}`,
      })
      return node
    } else if (token.type === "LPAREN") {
      this.steps.push({
        step: ++this.stepCounter,
        action: "process",
        stack: [],
        input: [],
        description: "Processing parenthesized expression",
      })
      this.eat("LPAREN")
      const node = this.expr()
      this.eat("RPAREN")
      this.steps.push({
        step: ++this.stepCounter,
        action: "reduce",
        stack: [],
        input: [],
        description: "Completed parenthesized expression",
      })
      return node
    }

    this.error(`Unexpected token: ${token.type} '${token.value}'`)
  }

  protected override term(): ASTNode {
    this.steps.push({
      step: ++this.stepCounter,
      action: "process",
      stack: [],
      input: [],
      description: "Processing term",
    })
    let node = this.factor()

    while (
      this.currentToken.type === "OPERATOR" &&
      (this.currentToken.value === "*" || this.currentToken.value === "/")
    ) {
      const token = this.currentToken
      this.eat("OPERATOR")
      const right = this.factor()

      node = {
        type: "BinaryOp",
        left: node,
        value: token.value,
        right,
      }
      this.steps.push({
        step: ++this.stepCounter,
        action: "reduce",
        stack: [],
        input: [],
        rule: `T → T ${token.value} F`,
        description: `Created binary operation: ${token.value}`,
      })
    }

    return node
  }

  protected override expr(): ASTNode {
    this.steps.push({
      step: ++this.stepCounter,
      action: "process",
      stack: [],
      input: [],
      description: "Processing expression",
    })
    let node = this.term()

    while (
      this.currentToken.type === "OPERATOR" &&
      (this.currentToken.value === "+" || this.currentToken.value === "-")
    ) {
      const token = this.currentToken
      this.eat("OPERATOR")
      const right = this.term()

      node = {
        type: "BinaryOp",
        left: node,
        value: token.value,
        right,
      }
      this.steps.push({
        step: ++this.stepCounter,
        action: "reduce",
        stack: [],
        input: [],
        rule: `E → E ${token.value} T`,
        description: `Created binary operation: ${token.value}`,
      })
    }

    return node
  }

  public parseWithSteps(): ParseResult {
    if (this.tokens.length === 0 || (this.tokens.length === 1 && this.tokens[0].type === "EOF")) {
      throw new InterpreterError("Empty expression", 0, "PARSER")
    }

    const ast = this.expr()

    if (this.currentToken.type !== "EOF") {
      this.error(`Unexpected token at end: ${this.currentToken.type} '${this.currentToken.value}'`)
    }

    this.steps.push({
      step: ++this.stepCounter,
      action: "accept",
      stack: [],
      input: [],
      description: "Parsing complete",
    })
    return { ast, steps: this.steps, strategy: "top-down" }
  }
}

export function parseExpression(tokens: Token[]): ASTNode {
  const parser = new Parser(tokens)
  return parser.parse()
}

export function parseExpressionWithStrategy(tokens: Token[], strategy: ParsingStrategy = "top-down"): ParseResult {
  if (strategy === "bottom-up") {
    const { ast, steps } = parseExpressionBottomUp(tokens)
    return { ast, steps, strategy: "bottom-up" }
  } else {
    const parser = new TopDownParser(tokens)
    return parser.parseWithSteps()
  }
}

// Helper function to convert AST to a readable string representation
export function astToString(node: ASTNode, indent = 0): string {
  const spaces = "  ".repeat(indent)

  switch (node.type) {
    case "Number":
      return `${spaces}Number(${node.value})`

    case "UnaryOp":
      return `${spaces}UnaryOp(${node.value})\n${astToString(node.operand!, indent + 1)}`

    case "BinaryOp":
      return `${spaces}BinaryOp(${node.value})\n${astToString(node.left!, indent + 1)}\n${astToString(node.right!, indent + 1)}`

    default:
      return `${spaces}Unknown node type`
  }
}
