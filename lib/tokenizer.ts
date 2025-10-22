import { InterpreterError } from "./errors"

export interface Token {
  type: "NUMBER" | "OPERATOR" | "LPAREN" | "RPAREN" | "EOF"
  value: string
  position: number
}

export type ASTNode =
  | {
      type: "Number"
      value: number
    }
  | {
      type: "UnaryOp"
      value: string
      operand: ASTNode
    }
  | {
      type: "BinaryOp"
      value: string
      left: ASTNode
      right: ASTNode
    }

export class Tokenizer {
  private input: string
  private position = 0
  private currentChar: string | null = null

  constructor(input: string) {
    this.input = input.trim()
    this.currentChar = this.input.length > 0 ? this.input[0] : null
  }

  private advance(): void {
    this.position++
    if (this.position >= this.input.length) {
      this.currentChar = null
    } else {
      this.currentChar = this.input[this.position]
    }
  }

  private skipWhitespace(): void {
    while (this.currentChar !== null && /\s/.test(this.currentChar)) {
      this.advance()
    }
  }

  private readNumber(): string {
    let result = ""
    let hasDecimal = false

    while (this.currentChar !== null && (/\d/.test(this.currentChar) || this.currentChar === ".")) {
      if (this.currentChar === ".") {
        if (hasDecimal) {
          throw new InterpreterError(`Invalid number format: multiple decimal points`, this.position, "TOKENIZER")
        }
        hasDecimal = true
      }
      result += this.currentChar
      this.advance()
    }

    // Check for invalid number formats
    if (result === "." || result.endsWith(".")) {
      throw new InterpreterError(`Invalid number format: '${result}'`, this.position - result.length, "TOKENIZER")
    }

    return result
  }

  public tokenize(): Token[] {
    const tokens: Token[] = []

    // Handle empty input
    if (this.input.length === 0) {
      throw new InterpreterError("Empty expression", 0, "TOKENIZER")
    }

    while (this.currentChar !== null) {
      this.skipWhitespace()

      if (this.currentChar === null) {
        break
      }

      const position = this.position

      // Numbers
      if (/\d/.test(this.currentChar) || this.currentChar === ".") {
        const value = this.readNumber()
        tokens.push({
          type: "NUMBER",
          value,
          position,
        })
        continue
      }

      // Operators
      if (["+", "-", "*", "/"].includes(this.currentChar)) {
        tokens.push({
          type: "OPERATOR",
          value: this.currentChar,
          position,
        })
        this.advance()
        continue
      }

      // Left parenthesis
      if (this.currentChar === "(") {
        tokens.push({
          type: "LPAREN",
          value: this.currentChar,
          position,
        })
        this.advance()
        continue
      }

      // Right parenthesis
      if (this.currentChar === ")") {
        tokens.push({
          type: "RPAREN",
          value: this.currentChar,
          position,
        })
        this.advance()
        continue
      }

      // Invalid character
      throw new InterpreterError(`Invalid character '${this.currentChar}'`, this.position, "TOKENIZER")
    }

    // Check for valid token sequence
    if (tokens.length === 0) {
      throw new InterpreterError("No valid tokens found", 0, "TOKENIZER")
    }

    // Add EOF token
    tokens.push({
      type: "EOF",
      value: "",
      position: this.position,
    })

    return tokens
  }
}

export function tokenizeExpression(expression: string): Token[] {
  const tokenizer = new Tokenizer(expression)
  return tokenizer.tokenize()
}
