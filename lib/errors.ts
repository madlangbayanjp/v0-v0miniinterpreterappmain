export class InterpreterError extends Error {
  public position: number
  public type: "TOKENIZER" | "PARSER" | "EVALUATOR"

  constructor(message: string, position = 0, type: "TOKENIZER" | "PARSER" | "EVALUATOR" = "TOKENIZER") {
    super(message)
    this.name = "InterpreterError"
    this.position = position
    this.type = type
  }
}

export function formatError(error: InterpreterError, expression: string): string {
  const lines = [`${error.type} ERROR: ${error.message}`, "", `Expression: ${expression}`]

  if (error.position >= 0 && error.position < expression.length) {
    const pointer = " ".repeat(12 + error.position) + "^"
    lines.push(pointer)
  }

  return lines.join("\n")
}
