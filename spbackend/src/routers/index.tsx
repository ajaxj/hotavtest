import { createBrowserRouter } from "react-router-dom"
import App from "@/App.tsx"
import About from "@/pages/About.tsx"
import NotFound from "@/pages/NotFound.tsx"
import { Login } from "@/pages/Login.tsx"
import Layout from "@/layouts/default.tsx"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import TaskList from "@/pages/sys/TaskList.tsx"
import LogInfoList from "@/pages/sys/LogInfoList.tsx"
import TitanLeagueList from "@/pages/titan/TitanLeagueList.tsx"
import TitanTeamList from "@/pages/titan/TitanTeamList.tsx"

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
          // <ProtectedRoute>
            <App />
          // </ProtectedRoute>
        ),
      },
      {
        path: "/about",
        element: (
          // <ProtectedRoute>
            <About />
          // </ProtectedRoute>
        ),
      },
      {
        path: "/sys/task-list",
        element: (
          // <ProtectedRoute>
            <TaskList />
          // </ProtectedRoute>
        ),
      },
      {
        path: "/sys/log-info-list",
        element: (
          // <ProtectedRoute>
            <LogInfoList />
          // </ProtectedRoute>
        ),
      },
      {
        path: "/titan/league-list",
        element: (
          // <ProtectedRoute>
            <TitanLeagueList />
          // </ProtectedRoute>
        ),
      },
      {
        path: "/titan/team-list",
        element: (
          // <ProtectedRoute>
            <TitanTeamList />
          // </ProtectedRoute>
        ),
      },
    ],
  },
  { path: "*", element: <NotFound /> },
])
