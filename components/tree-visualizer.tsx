"use client"

import type { ASTNode } from "@/lib/parser"

interface TreeNodeProps {
  node: ASTNode
  x: number
  y: number
  level: number
}

interface TreeVisualizerProps {
  ast: ASTNode | null
}

function TreeNode({ node, x, y, level }: TreeNodeProps) {
  const nodeRadius = 25
  const levelHeight = 80
  const nodeSpacing = 60

  // Calculate positions for child nodes
  const getChildPositions = (node: ASTNode, parentX: number, parentY: number) => {
    const childY = parentY + levelHeight
    const positions: { node: ASTNode; x: number; y: number }[] = []

    if (node.type === "BinaryOp") {
      // For binary operations, place left child to the left and right child to the right
      positions.push(
        { node: node.left!, x: parentX - nodeSpacing, y: childY },
        { node: node.right!, x: parentX + nodeSpacing, y: childY },
      )
    } else if (node.type === "UnaryOp") {
      // For unary operations, place the operand directly below
      positions.push({ node: node.operand!, x: parentX, y: childY })
    }

    return positions
  }

  const childPositions = getChildPositions(node, x, y)

  // Get node color based on type
  const getNodeColor = (type: string) => {
    switch (type) {
      case "Number":
        return "fill-blue-500 text-white"
      case "BinaryOp":
        return "fill-green-500 text-white"
      case "UnaryOp":
        return "fill-purple-500 text-white"
      default:
        return "fill-gray-500 text-white"
    }
  }

  // Get display text for node
  const getNodeText = (node: ASTNode) => {
    switch (node.type) {
      case "Number":
        return node.value?.toString() || "0"
      case "BinaryOp":
      case "UnaryOp":
        return node.value?.toString() || "?"
      default:
        return "?"
    }
  }

  return (
    <g>
      {/* Draw lines to children */}
      {childPositions.map((child, index) => (
        <line
          key={index}
          x1={x}
          y1={y}
          x2={child.x}
          y2={child.y}
          stroke="currentColor"
          strokeWidth="2"
          className="text-border"
        />
      ))}

      {/* Draw current node */}
      <circle cx={x} cy={y} r={nodeRadius} className={getNodeColor(node.type)} stroke="currentColor" strokeWidth="2" />

      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-sm font-mono font-bold"
        fill="currentColor"
      >
        {getNodeText(node)}
      </text>

      {/* Render children */}
      {childPositions.map((child, index) => (
        <TreeNode key={index} node={child.node} x={child.x} y={child.y} level={level + 1} />
      ))}
    </g>
  )
}

export function TreeVisualizer({ ast }: TreeVisualizerProps) {
  if (!ast) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>Visual tree will appear here after interpretation</p>
      </div>
    )
  }

  // Calculate tree dimensions
  const calculateTreeDimensions = (node: ASTNode, level = 0): { width: number; height: number } => {
    const levelHeight = 80
    const nodeSpacing = 60
    const minWidth = 120

    let maxWidth = minWidth
    let maxHeight = levelHeight * (level + 1)

    if (node.type === "BinaryOp") {
      const leftDim = calculateTreeDimensions(node.left!, level + 1)
      const rightDim = calculateTreeDimensions(node.right!, level + 1)
      maxWidth = Math.max(maxWidth, leftDim.width + rightDim.width + nodeSpacing)
      maxHeight = Math.max(maxHeight, leftDim.height, rightDim.height)
    } else if (node.type === "UnaryOp") {
      const operandDim = calculateTreeDimensions(node.operand!, level + 1)
      maxWidth = Math.max(maxWidth, operandDim.width)
      maxHeight = Math.max(maxHeight, operandDim.height)
    }

    return { width: maxWidth, height: maxHeight }
  }

  const { width, height } = calculateTreeDimensions(ast)
  const svgWidth = Math.max(400, width + 100)
  const svgHeight = Math.max(200, height + 50)

  return (
    <div className="w-full overflow-x-auto">
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="mx-auto bg-muted/20 rounded border"
      >
        <TreeNode node={ast} x={svgWidth / 2} y={50} level={0} />
      </svg>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <span>Numbers</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span>Binary Operations</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-purple-500"></div>
          <span>Unary Operations</span>
        </div>
      </div>
    </div>
  )
}
