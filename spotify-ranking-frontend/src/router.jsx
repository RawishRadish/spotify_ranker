import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "./routes/Home";
import CompareSongs from "./routes/compareSongs";
import RankingList from "./routes/RankingList";
import ProtectedRoute from "./ProtectedRoute";

// Define the routes
const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            { index: true, element: <Home /> },
            { path: '/compare', element: <ProtectedRoute><CompareSongs /></ProtectedRoute> },
            { path: '/ranking', element: <ProtectedRoute><RankingList /></ProtectedRoute> },
        ]
    }
]);

export default router;