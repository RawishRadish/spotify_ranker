import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "./routes/Home";
import CompareSongs from "./routes/compareSongs";
import RankingList from "./routes/RankingList";
import ProtectedRoute from "./ProtectedRoute";
import LoginForm from "./LoginForm";
import RegisterForm from "./routes/RegisterForm";
import Statistics from "./routes/Statistics";

// Define the routes
const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            { index: true, element: <ProtectedRoute><Home /></ProtectedRoute> },
            { path: '/login', element: <LoginForm /> },
            { path: '/register', element: <RegisterForm /> },
            { path: '/compare', element: <ProtectedRoute><CompareSongs /></ProtectedRoute> },
            { path: '/ranking', element: <ProtectedRoute><RankingList /></ProtectedRoute> },
            { path: '/statistics', element: <ProtectedRoute><Statistics /></ProtectedRoute> },
        ]
    }
]);

export default router;