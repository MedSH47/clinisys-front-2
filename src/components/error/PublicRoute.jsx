import { Navigate, useNavigate } from "react-router-dom";

export default function PublicRoute({children}){
    if (localStorage.getItem('userRole')!="User") {
        return <Navigate to={"/AccessDenied"}/>
    }
    return children
}