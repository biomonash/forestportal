import { lazy } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'

const Layout = lazy(() => import('./features/manager/Layout'))
const UploadPage = lazy(() => import('./features/manager/components/UploadPage'))
const SpeciesTable = lazy(() => import('./features/manager/components/SpeciesTable'))
const SitesTable = lazy(() => import('./features/manager/components/SitesTable'))

const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, element: <Navigate to="/upload" replace /> },
      { path: 'upload', Component: UploadPage },
      { path: 'species', Component: SpeciesTable },
      { path: 'sites', Component: SitesTable },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
