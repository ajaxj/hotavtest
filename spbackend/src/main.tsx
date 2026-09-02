import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { ThemeProvider } from "@/components/theme-provider.tsx"

import { router } from "@/routers"
import { RouterProvider } from "react-router-dom"
import { TooltipProvider } from "@/components/ui/tooltip.tsx"
import { Toaster } from "@/components/ui/toast"
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>

        <TooltipProvider>
          <RouterProvider router={router} />
        </TooltipProvider>
        <Toaster />

    </ThemeProvider>
  </StrictMode>
)
