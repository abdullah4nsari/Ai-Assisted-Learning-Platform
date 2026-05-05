import React from "react";
import { Navigate,Outlet } from "react-router-dom";
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const {isAuthenticated,loading} = useAuth();
    {console.log(isAuthenticated)}
    if(loading){
        return <div>Loading...</div>
    }

    return isAuthenticated ? (
        <AppLayout >
            <Outlet/>
        </AppLayout>
    ) : <Navigate to="/login" replace/>;
};

export default ProtectedRoute;