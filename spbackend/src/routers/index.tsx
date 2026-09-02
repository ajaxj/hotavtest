import { createBrowserRouter } from "react-router-dom"
import App from "@/App.tsx"
import About from "@/pages/About.tsx"
import NotFound from "@/pages/NotFound.tsx"

import Layout from "@/layouts/default.tsx"


export const router = createBrowserRouter([

  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
            <App />
        ),
      },
      {
        path: "/about",
        element: (

            <About />

        ),
      },

    ],
  },
  { path: "*", element: <NotFound /> },
])
