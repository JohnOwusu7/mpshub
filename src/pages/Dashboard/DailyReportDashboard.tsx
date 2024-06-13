// pages/AdminPanel.tsx

import React from 'react';
import ReportsList from '../../components/Dashboard/DailyReportList';
import ReportListPage from '../../components/Dashboard/IssueReportList';

const DailyReportDashboard: React.FC = () => {
    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-6">Report Lists</h1>
            <ReportsList />
            <h1 className="text-3xl font-bold mb-6">Issues Lists</h1>
            <ReportListPage />
        </div>
    );
};

export default DailyReportDashboard;
