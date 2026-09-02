import { createBrowserRouter } from "react-router-dom"
import App from "@/App.tsx"
import About from "@/pages/About.tsx"
import NotFound from "@/pages/NotFound.tsx"
import { Login } from "@/pages/Login.tsx"
import Layout from "@/layouts/default.tsx"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import TaskList from "@/pages/sys/TaskList.tsx"

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        ),
      },
      {
        path: "/about",
        element: (
          <ProtectedRoute>
            <About />
          </ProtectedRoute>
        ),
      },
      {
        path: "/sys/task-list",
        element: (
          <ProtectedRoute>
            <TaskList />
          </ProtectedRoute>
        ),
      },
    ],
  },
  { path: "*", element: <NotFound /> },
])
