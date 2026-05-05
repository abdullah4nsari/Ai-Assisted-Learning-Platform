import React,{createContext, useContext, useState, useEffect} from "react";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if(!context){
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated,setIsAuthenticated] = useState(false);

    useEffect(()=>{
        checkAuthStatus();
    },[]);

    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');


            if(token && userStr){
                setUser(JSON.parse(userStr));
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = (userData,token) => {
        localStorage.setItem('user',JSON.stringify(userData));
        localStorage.setItem('token',token);
        setUser(userData);
        setIsAuthenticated(true);
        setLoading(false);
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        window.location.href = '/';
    };

    const updateUser = (updatedUserData) => {
        const newUserData = {...user, ...updatedUserData};
        localStorage.setItem('user', JSON.stringify(newUserData));
        setUser(newUserData);
    }
    

    const value ={
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        updateUser,
        checkAuthStatus
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;