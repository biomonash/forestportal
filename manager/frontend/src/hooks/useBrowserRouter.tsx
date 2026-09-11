import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'

const UploadPage = lazy(() => import('../features/manager/components/UploadPage'))

const useBrowserRouter = () => {
    const router = createBrowserRouter([
        {
            path: '/',
            Component: UploadPage,
        },
    ])
    return router
}

export default useBrowserRouter