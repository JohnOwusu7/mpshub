import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "../../store/features/alertSlice";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { API_CONFIG } from "../../Api/apiConfig";
import { logout, setUserData } from "../../store/userSlice"; // Import action to clear user and setUserData
import { IRootState } from "../../store";

interface PrivateRouteProps {
  path: string;
  element: React.ReactNode;
  allowedRoles?: string[]; // Keep for backward compatibility, though new routes use permissions
  allowedPermissions?: string[]; // New prop for permission-based access control
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  path,
  element,
  allowedRoles,
  allowedPermissions, // Destructure new prop
}) => {
  const [userLoading, setUserLoading] = useState(true);
  const user = useSelector((state: IRootState) => state.user.user);
  const dispatch = useDispatch();


  useEffect(() => {
    const getUser = async () => {
      try {
        dispatch(showLoading());
        const { data } = await axios.get( // Changed to axios.get
          `${API_CONFIG.baseURL}${API_CONFIG.users.endpoints.getUser}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              companyid: localStorage.getItem("companyId"), // Ensure companyId is sent
            },
          }
        );
        dispatch(hideLoading());
        if (data.success) {
          dispatch(setUserData(data.data)); // Dispatch fetched user data to Redux
          setUserLoading(false);
        } else {
          localStorage.clear();
          dispatch(logout()); // Clear user from Redux store
          setUserLoading(false);
        }
      } catch (error) {
        localStorage.clear();
        dispatch(logout()); // Clear user from Redux store
        dispatch(hideLoading());
        setUserLoading(false);
        console.error('Error fetching user details in PrivateRoute:', error);
      }
    };

    const token = localStorage.getItem("token");
    if (!user && token) { // Only call getUser if user not in Redux and token exists
      getUser();
    } else if (!token) { // If no token, redirect to sign-out immediately
      dispatch(logout());
      setUserLoading(false);
    } else {
      setUserLoading(false);
    }
  }, [user, dispatch]);

  if (userLoading) {
    return <div>Loading user...</div>;
  }

  if (!localStorage.getItem("token")) {
    return <Navigate to="/sign-out" />;
  }

  if (allowedRoles && allowedRoles.length > 0 && user) {
    const userRole = user.roleName; // Use roleName from the user object
    console.log('PrivateRoute: User role from Redux:', userRole);
    console.log('PrivateRoute: Allowed roles for this path (deprecated):', allowedRoles);
    if (!allowedRoles.includes(userRole)) {
      console.log('PrivateRoute: User role not in allowed roles. Redirecting to unauthorized.');
      return <Navigate to="/unauthorized" />;
    }
  }

  // New permission-based authorization check
  if (allowedPermissions && allowedPermissions.length > 0 && user) {
    const userPermissions = user.permissions || [];
    const userRoleName = user.roleName; // Get roleName for SUPER-ADMIN bypass

    // SUPER-ADMIN always has access - check early to avoid unnecessary logging
    if (userRoleName === 'SUPER-ADMIN') {
      return <>{element}</>;
    }

    // Check for all:access permission (SUPER-ADMIN typically has this)
    if (userPermissions.includes('all:access')) {
      return <>{element}</>;
    }

    console.log('PrivateRoute: User roleName from Redux:', userRoleName);
    console.log('PrivateRoute: User permissions from Redux:', userPermissions);
    console.log('PrivateRoute: Required permissions for this path:', allowedPermissions);

    // Allow ADMIN/MANAGER to access main dashboard and issue-related routes even if role permissions are incomplete
    const issuePermissions = ['issue:view', 'issue:create', 'issue:assign', 'issue:manage', 'issue:work_on', 'issue:resolve'];
    const routeOnlyRequiresIssueOrDashboard =
      allowedPermissions.every((p) => issuePermissions.includes(p) || p === 'dashboard:view');
    if ((userRoleName === 'ADMIN' || userRoleName === 'MANAGER') && (path === '/' || routeOnlyRequiresIssueOrDashboard)) {
      return <>{element}</>;
    }

    const hasAllPermissions = allowedPermissions.every(permission => userPermissions.includes(permission));

    if (!hasAllPermissions) {
      console.log('PrivateRoute: User does not have all required permissions. Redirecting to unauthorized.');
      return <Navigate to="/unauthorized" />;
    }
  }

  return <>{element}</>;
};

export default PrivateRoute;
