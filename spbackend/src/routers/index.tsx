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
import BsCountryList from "@/pages/ns/bs/CountryList.tsx"
import BsLeagueList from "@/pages/ns/bs/LeagueList.tsx"
import BsTeamList from "@/pages/ns/bs/TeamList.tsx"
import ArticleList from "@/pages/article/ArticleList.tsx"
import CategoryList from "@/pages/article/CategoryList.tsx"
import FetchSiteList from "@/pages/sys/FetchSiteList.tsx"

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
        path: "/article/article-list",
        element: (
          // <ProtectedRoute>
          <ArticleList />
          // </ProtectedRoute>
        ),
      },
      {
        path: "/article/category-list",
        element: (
          // <ProtectedRoute>
          <CategoryList />
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
        path: "/sys/fetch-site-list",
        element: (
          // <ProtectedRoute>
          <FetchSiteList />
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
      {
        path: "/ns/bs/country-list",
        element: (
          // <ProtectedRoute>
          <BsCountryList />
          // </ProtectedRoute>
        ),
      },
      {
        path: "/ns/bs/league-list",
        element: (
          // <ProtectedRoute>
          <BsLeagueList />
          // </ProtectedRoute>
        ),
      },
      {
        path: "/ns/bs/team-list",
        element: (
          // <ProtectedRoute>
          <BsTeamList />
          // </ProtectedRoute>
        ),
      },
    ],
  },
  { path: "*", element: <NotFound /> },
])
