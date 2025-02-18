import { createBrowserRouter, RouterProvider, redirect } from "react-router-dom";
import App from "./App";
import Home from "./Home";
import CompareSongs from "./compareSongs";
import RankingList from "./RankingList";
import ProtectedRoute from "./ProtectedRoute";

// Define the routes
const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            { index: true, element: <Home /> },
            { path: '/compare', element: <ProtectedRoute><CompareSongs /></ProtectedRoute> },
            { path: '/ranking', element: <ProtectedRoute><RankingList /></ProtectedRoute> }
        ]
    }
]);

export default router;