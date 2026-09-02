import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { AuthProvider } from "@/contexts"
import { router } from "@/routers"
import { RouterProvider } from "react-router-dom"
import { TooltipProvider } from "@/components/ui/tooltip.tsx"
import { Toaster } from "@/components/ui/toast"
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
        <RouterProvider router={router} />
          </TooltipProvider>
          <Toaster />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
)
