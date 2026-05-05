import React from 'react'
import {Navigate,Outlet} from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import {useAuth} from '../../context/AuthContext';
import Spinner from '../common/Spinner';
const ProtectedRoute = () => {
    const {isAuthenticated, loading} = useAuth();

    if(loading){
        return <Spinner/>;
    }
  return isAuthenticated ? (
    <AppLayout>
        <Outlet/>
    </AppLayout>
  ) : ( <Navigate to='/login' />);
}

export default ProtectedRoute;
