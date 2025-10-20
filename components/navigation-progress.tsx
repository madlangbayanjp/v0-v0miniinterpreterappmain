"use client"

import { motion } from "framer-motion"
import { usePathname } from "next/navigation"

const steps = [
  { path: "/input", title: "Input", step: 1 },
  { path: "/tokens", title: "Tokens", step: 2 },
  { path: "/parse-tree", title: "Parse Tree", step: 3 },
  { path: "/result", title: "Result", step: 4 },
]

export function NavigationProgress() {
  const pathname = usePathname()
  const currentStepIndex = steps.findIndex((step) => step.path === pathname)

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <motion.div
        className="bg-card/95 backdrop-blur-sm border rounded-full px-6 py-3 shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-4">
          {steps.map((step, index) => (
            <div key={step.path} className="flex items-center gap-2">
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  index <= currentStepIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
                animate={{
                  scale: index === currentStepIndex ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                {step.step}
              </motion.div>
              <span
                className={`text-sm font-medium ${
                  index <= currentStepIndex ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className="w-8 h-0.5 bg-border mx-2">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: index < currentStepIndex ? "100%" : "0%" }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
