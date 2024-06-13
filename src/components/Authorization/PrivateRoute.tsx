import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "../../store/features/alertSlice";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { API_CONFIG } from "../../Api/apiConfig";
import { logout } from "../../store/userSlice"; // Import action to clear user
import { IRootState } from "../../store";

interface PrivateRouteProps {
  path: string;
  element: React.ReactNode;
  allowedRoles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  path,
  element,
  allowedRoles,
}) => {
  const [userLoading, setUserLoading] = useState(true);
  const user = useSelector((state: IRootState) => state.user.user);
  const dispatch = useDispatch();


  useEffect(() => {
    const getUser = async () => {
      try {
        dispatch(showLoading());
        console.log('Before');
        const { data } = await axios.post(
          `${API_CONFIG.baseURL}${API_CONFIG.users.endpoints.getUser}`,
          { token: localStorage.getItem("token") },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        dispatch(hideLoading());
        if (!data.success) {
          localStorage.clear();
          dispatch(logout()); // Clear user from Redux store
          setUserLoading(false);
        } else {
          setUserLoading(false);
        }
        console.log('Data', data);
      } catch (error) {
        localStorage.clear();
        dispatch(logout()); // Clear user from Redux store
        dispatch(hideLoading());
        setUserLoading(false);
        console.log(error);
      }
    };

    if (!user) {
      getUser();
    } else {
      setUserLoading(false);
    }
    getUser();
  }, [user, dispatch]);

  if (userLoading) {
    return <div>Loading user...</div>;
  }

  if (!localStorage.getItem("token")) {
    return <Navigate to="/sign-out" />;
  }

  if (allowedRoles && allowedRoles.length > 0 && user) {
    const userRole = user.role;
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" />;
    }
  }

  return <>{element}</>;
};

export default PrivateRoute;
