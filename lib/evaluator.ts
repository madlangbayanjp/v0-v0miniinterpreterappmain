import type { ASTNode } from "./tokenizer"
import { InterpreterError } from "./errors"

export class Evaluator {
  public evaluate(node: ASTNode): number {
    switch (node.type) {
      case "Number":
        const numValue = node.value as number
        if (!isFinite(numValue)) {
          throw new InterpreterError(`Invalid number value: ${numValue}`, 0, "EVALUATOR")
        }
        return numValue

      case "UnaryOp":
        const operandValue = this.evaluate(node.operand!)
        switch (node.value) {
          case "+":
            return +operandValue
          case "-":
            return -operandValue
          default:
            throw new InterpreterError(`Unknown unary operator: ${node.value}`, 0, "EVALUATOR")
        }

      case "BinaryOp":
        const leftValue = this.evaluate(node.left!)
        const rightValue = this.evaluate(node.right!)

        // Check for invalid operands
        if (!isFinite(leftValue) || !isFinite(rightValue)) {
          throw new InterpreterError("Invalid operand values", 0, "EVALUATOR")
        }

        switch (node.value) {
          case "+":
            const addResult = leftValue + rightValue
            if (!isFinite(addResult)) {
              throw new InterpreterError("Addition result overflow", 0, "EVALUATOR")
            }
            return addResult
          case "-":
            const subResult = leftValue - rightValue
            if (!isFinite(subResult)) {
              throw new InterpreterError("Subtraction result overflow", 0, "EVALUATOR")
            }
            return subResult
          case "*":
            const mulResult = leftValue * rightValue
            if (!isFinite(mulResult)) {
              throw new InterpreterError("Multiplication result overflow", 0, "EVALUATOR")
            }
            return mulResult
          case "/":
            if (rightValue === 0) {
              throw new InterpreterError("Division by zero", 0, "EVALUATOR")
            }
            const divResult = leftValue / rightValue
            if (!isFinite(divResult)) {
              throw new InterpreterError("Division result overflow", 0, "EVALUATOR")
            }
            return divResult
          default:
            throw new InterpreterError(`Unknown binary operator: ${node.value}`, 0, "EVALUATOR")
        }

      default: {
        const _exhaustive: never = node
        throw new InterpreterError(`Unknown node type`, 0, "EVALUATOR")
      }
    }
  }
}

export function evaluateExpression(ast: ASTNode): number {
  const evaluator = new Evaluator()
  return evaluator.evaluate(ast)
}

// Helper function to show step-by-step evaluation
export function evaluateWithSteps(node: ASTNode, depth = 0): { result: number; steps: string[] } {
  const indent = "  ".repeat(depth)
  const steps: string[] = []

  switch (node.type) {
    case "Number":
      steps.push(`${indent}Evaluating Number: ${node.value}`)
      return { result: node.value as number, steps }

    case "UnaryOp":
      steps.push(`${indent}Evaluating UnaryOp: ${node.value}`)
      const operandEval = evaluateWithSteps(node.operand!, depth + 1)
      steps.push(...operandEval.steps)

      let unaryResult: number
      switch (node.value) {
        case "+":
          unaryResult = +operandEval.result
          break
        case "-":
          unaryResult = -operandEval.result
          break
        default:
          throw new InterpreterError(`Unknown unary operator: ${node.value}`, 0, "EVALUATOR")
      }

      steps.push(`${indent}Result: ${node.value}${operandEval.result} = ${unaryResult}`)
      return { result: unaryResult, steps }

    case "BinaryOp":
      steps.push(`${indent}Evaluating BinaryOp: ${node.value}`)

      const leftEval = evaluateWithSteps(node.left!, depth + 1)
      steps.push(...leftEval.steps)

      const rightEval = evaluateWithSteps(node.right!, depth + 1)
      steps.push(...rightEval.steps)

      let binaryResult: number
      switch (node.value) {
        case "+":
          const addResult = leftEval.result + rightEval.result
          if (!isFinite(addResult)) {
            throw new InterpreterError("Addition result overflow", 0, "EVALUATOR")
          }
          binaryResult = addResult
          break
        case "-":
          const subResult = leftEval.result - rightEval.result
          if (!isFinite(subResult)) {
            throw new InterpreterError("Subtraction result overflow", 0, "EVALUATOR")
          }
          binaryResult = subResult
          break
        case "*":
          const mulResult = leftEval.result * rightEval.result
          if (!isFinite(mulResult)) {
            throw new InterpreterError("Multiplication result overflow", 0, "EVALUATOR")
          }
          binaryResult = mulResult
          break
        case "/":
          if (rightEval.result === 0) {
            throw new InterpreterError("Division by zero", 0, "EVALUATOR")
          }
          const divResult = leftEval.result / rightEval.result
          if (!isFinite(divResult)) {
            throw new InterpreterError("Division result overflow", 0, "EVALUATOR")
          }
          binaryResult = divResult
          break
        default:
          throw new InterpreterError(`Unknown binary operator: ${node.value}`, 0, "EVALUATOR")
      }

      steps.push(`${indent}Result: ${leftEval.result} ${node.value} ${rightEval.result} = ${binaryResult}`)
      return { result: binaryResult, steps }

    default: {
      const _exhaustive: never = node
      throw new InterpreterError(`Unknown node type`, 0, "EVALUATOR")
    }
  }
}
