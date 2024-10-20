import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import App from './pages/App.tsx'
import { authenticate } from './firebase/user.ts'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { Solutions } from './pages/Solutions.tsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/solutions",
    element: <Solutions />,
  },
]);


// Kick off auth
authenticate().then(console.log)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
