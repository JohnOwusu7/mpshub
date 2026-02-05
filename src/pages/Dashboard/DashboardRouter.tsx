import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { IRootState } from '../../store';
import CompanyDashboard from './CompanyDashboard';
import IssueAnalyticsDashboard from './IssueAnalyticsDashboard';
import OperatorDashboard from './OperatorDashboard';
import SuperAdminDashboard from './SuperAdminDashboard';

const DashboardRouter: React.FC = () => {
    const user = useSelector((state: IRootState) => state.user.user);
    const navigate = useNavigate();
    const userPermissions = user?.permissions || [];
    const roleName = user?.roleName;

    // Determine which dashboard to show based on role and permissions
    useEffect(() => {
        if (!user) {
            navigate('/auth/login');
            return;
        }

        // Super Admin sees Super Admin Dashboard at /
        if (roleName === 'SUPER-ADMIN') {
            return;
        }

        // Company users (ADMIN, MANAGER) see Company Dashboard at / – no redirect
        if (roleName === 'ADMIN' || roleName === 'MANAGER') {
            return;
        }

        // Other roles (OPERATOR, ENGINEER, LEAD_OPERATOR, VIEWER) go to My Dashboard
        navigate('/dashboard/my', { replace: true });
    }, [user, roleName, navigate]);

    // Super Admin: system-wide dashboard
    if (roleName === 'SUPER-ADMIN') {
        return <SuperAdminDashboard />;
    }

    // Company users: general company dashboard (one place for each company)
    if (roleName === 'ADMIN' || roleName === 'MANAGER') {
        return <CompanyDashboard />;
    }

    // Operators and others: personal dashboard
    return <OperatorDashboard />;
};

export default DashboardRouter;

