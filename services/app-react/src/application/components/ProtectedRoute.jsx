import { Navigate, Outlet } from "react-router-dom";
import sessionStore from "@/stores/session";

const ProtectedRoute = () => {
    const { user, token } = sessionStore();

    if (!user || !token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
