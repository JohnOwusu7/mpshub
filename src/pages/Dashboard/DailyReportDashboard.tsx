// pages/AdminPanel.tsx

import React, { useEffect } from 'react';
import ReportsList from '../../components/Dashboard/DailyReportList';
import ReportListPage from '../../components/Dashboard/IssueReportList';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';

const DailyReportDashboard: React.FC = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPageTitle('MineSphere Daily Report Dashboard'));
    }, [dispatch]);

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-6">MineSphere Issue Reports</h1>
            <ReportListPage />
            <h1 className="text-3xl font-bold mb-6">MineSphere Daily Activity Reports</h1>
            <ReportsList />
        </div>
    );
};

export default DailyReportDashboard;
