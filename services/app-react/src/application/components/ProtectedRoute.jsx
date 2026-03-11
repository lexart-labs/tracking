import { Navigate, Outlet } from "react-router-dom";
import sessionStore from "@/stores/session";

const ProtectedRoute = () => {
    const { user, token } = sessionStore();

    if (!user || !token) {
        // Since this app runs in an iframe and the parent handles the "login" state,
        // we show nothing until the session is established.
        return null;
    }

    return <Outlet />;
};

export default ProtectedRoute;
