import { createBrowserRouter } from "react-router-dom"
import App from "@/App.tsx"
import About from "@/pages/About.tsx"
import NotFound from "@/pages/NotFound.tsx"
import { Login } from "@/pages/Login.tsx"
import Layout from "@/layouts/default.tsx"
// import { ProtectedRoute } from "@/components/ProtectedRoute"
import TaskList from "@/pages/sys/TaskList.tsx"
import LogInfoList from "@/pages/sys/LogInfoList.tsx"
import TitanLeagueList from "@/pages/titan/fb/LeagueList.tsx"
import NsLeagueList from "@/pages/ns/fb/LeagueList.tsx"
import TeamList from "@/pages/titan/fb/TeamList.tsx"
import MatchList from "@/pages/titan/fb/MatchList.tsx"
import CountryList from "@/pages/ns/fb/CountryList.tsx"

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
        path: "/titan/fb/league-list",
        element: (
          // <ProtectedRoute>
            <TitanLeagueList />
          // </ProtectedRoute>
        ),
      },
      {
        path: "/titan/fb/team-list",
        element: (
          // <ProtectedRoute>
            <TeamList />
          // </ProtectedRoute>
        ),
      },
      {
        path: "/titan/fb/match-list",
        element: (
          // <ProtectedRoute>
            <MatchList />
          // </ProtectedRoute>
        ),
      },
      {
        path: "/ns/fb/country-list",
        element: (
          // <ProtectedRoute>
            <CountryList />
          // </ProtectedRoute>
        ),
      },
      {
        path: "/ns/fb/league-list",
        element: (
          // <ProtectedRoute>
            <NsLeagueList />
          // </ProtectedRoute>
        ),
      },
      {
        path: "/ns/fb/team-list",
        element: (
          // <ProtectedRoute>
            <TeamList />
          // </ProtectedRoute>
        ),
      },
      {
        path: "/ns/fb/match-list",
        element: (
          // <ProtectedRoute>
            <MatchList />
          // </ProtectedRoute>
        ),
      },
    ],
  },
  { path: "*", element: <NotFound /> },
])
