import './index.css'
import { lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'

const Manager = lazy(() => import('./features/manager'))

const router = createBrowserRouter([
  {
    path: '/',
    Component: Manager,
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
