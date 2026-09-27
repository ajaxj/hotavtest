import { createBrowserRouter } from "react-router-dom"
import App from "@/App.tsx"
import About from "@/pages/About.tsx"
import NotFound from "@/pages/NotFound.tsx"
import { Login } from "@/pages/Login.tsx"
import Layout from "@/layouts/default.tsx"
// import { ProtectedRoute } from "@/components/ProtectedRoute"
import TaskList from "@/pages/sys/TaskList.tsx"
import LogInfoList from "@/pages/sys/LogInfoList.tsx"
import TempCategoryList from "@/pages/temp/TempCategoryList.tsx"
import TempTagList from "@/pages/temp/TempTagList.tsx"
import TempMovieList from "@/pages/temp/TempMovieList.tsx"
import FetchSiteList from "@/pages/sys/FetchSiteList.tsx"
import Setting from "@/pages/Setting.tsx"

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
        path: "/setting",
        element: (
          // <ProtectedRoute>
            <Setting />
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
        path: "/temp/category-list",
        element: (
          // <ProtectedRoute>
            <TempCategoryList />
          // </ProtectedRoute>
        ),
      },
      {
        path: "/temp/movie-list",
        element: (
          // <ProtectedRoute>
            <TempMovieList />
          // </ProtectedRoute>
        ),
      },
      {
        path: "/temp/tag-list",
        element: (
          // <ProtectedRoute>
            <TempTagList />
          // </ProtectedRoute>
        ),
      }
    ],
  },
  { path: "*", element: <NotFound /> },
])
