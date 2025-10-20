"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { useInterpreterStore } from "@/lib/interpreter-store"
import { NavigationProgress } from "@/components/navigation-progress"
import { PageTransition } from "@/components/page-transition"

export default function TokensPage() {
  const router = useRouter()
  const { tokens, expression } = useInterpreterStore()

  useEffect(() => {
    if (!expression || tokens.length === 0) {
      router.push("/input")
    }
  }, [expression, tokens, router])

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

  if (!expression || tokens.length === 0) {
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
              <h1 className="text-4xl font-bold text-foreground mb-2">Tokenization</h1>
              <p className="text-muted-foreground text-lg">Breaking down "{expression}" into meaningful tokens</p>
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
                      2
                    </span>
                    Tokens
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Each token represents a meaningful unit in the expression:
                    </p>

                    <div className="flex flex-wrap gap-3">
                      {tokens.map((token, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: 0.4 + index * 0.1,
                            type: "spring",
                            stiffness: 200,
                          }}
                        >
                          <Badge
                            variant="outline"
                            className={`font-mono text-base px-4 py-2 ${getTokenColor(token.type)} hover:scale-105 transition-transform`}
                          >
                            <span className="font-semibold">{token.type}</span>
                            <span className="mx-2">:</span>
                            <span className="font-bold">{token.value}</span>
                          </Badge>
                        </motion.div>
                      ))}
                    </div>

                    <motion.div
                      className="mt-6 p-4 bg-muted/50 rounded-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 1 }}
                    >
                      <h4 className="font-semibold mb-2">Token Types:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">NUMBER</Badge>
                          <span className="text-muted-foreground">Numeric values</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">OPERATOR</Badge>
                          <span className="text-muted-foreground">+, -, *, /</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">PAREN</Badge>
                          <span className="text-muted-foreground">( and )</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation */}
              <motion.div
                className="flex justify-between"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <Button variant="outline" onClick={() => router.push("/input")} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Input
                </Button>
                <Button onClick={() => router.push("/parse-tree")} className="gap-2">
                  View Parse Tree
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
