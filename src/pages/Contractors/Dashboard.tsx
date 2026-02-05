import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

import IconMenuApps from '../../components/Icon/Menu/IconMenuApps';
import { setPageTitle } from '../../store/themeConfigSlice';
import { IRootState } from '../../store';
import { API_CONFIG } from '../../Api/apiConfig';
import IssueReportsUserList from '../../components/Dashboard/IssueReportsUserList';

interface Issue {
  progress: string;
  tag: string;
}

const ContractorsDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const authenticatedUser = useSelector((state: IRootState) => state.user.user);
  const [count, setCount] = useState(0);
  const [progCount, setProgCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(setPageTitle('Analytics Admin'));
  }, [dispatch]);

  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      try {
        const response = await axios.get<Issue[]>(`${API_CONFIG.baseURL}${API_CONFIG.issues.endpoints.list}`);
        const issues = response.data;

        // Filter issues by tag matching the user's role
        const filteredIssuesCount = issues.filter(issue => issue.tag === authenticatedUser?.roleName || authenticatedUser?.role);
        const filteredNewIssuesCount = filteredIssuesCount.filter(issue => issue.progress === 'new').length;
        const filteredProgressIssuesCount = filteredIssuesCount.filter(issue => issue.progress === 'in-progress').length;

        setCount(filteredNewIssuesCount);
        setProgCount(filteredProgressIssuesCount);
      } catch (error) {
        console.error('Error fetching issues:', (error as Error).message);
        setError('Error fetching issues');
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [authenticatedUser?.roleName, authenticatedUser?.role]);

  return (
    <div className="flex flex-col w-full px-4 sm:px-8 md:px-16 lg:px-24">
      <div className="flex flex-col sm:flex-row flex-auto sm:items-center min-w-0 my-8 sm:my-12 md:my-16">
        <div className="flex flex-auto items-center min-w-0">
          <div className="flex flex-col min-w-0 mx-4 sm:mx-8">
            <div className="text-lg md:text-3xl lg:text-5xl font-semibold tracking-tight leading-7 md:leading-snug truncate">
              {authenticatedUser ? `Welcome back, ${authenticatedUser.firstName} ${authenticatedUser.lastName || ''}!` : ''}
            </div>
            <div className="flex items-center mt-10">
              <IconMenuApps />
              <div className="mx-2 sm:mx-4 leading-6 truncate text-sm sm:text-base lg:text-1xl">
                {loading ? (
                  'Loading...'
                ) : error ?? (
                  <span>
                    You have <span className="text-blue-500 font-bold">{count}</span> new assigned tasks and <span className="text-green-500 font-bold">{progCount}</span> ongoing activities to be completed
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center mt-4 sm:mt-0 sm:mx-auto space-x-6 md:space-x-12">
          <a href="/activity" className="whitespace-nowrap bg-blue-500 text-white px-4 py-2 rounded-md">View issues</a>
          <a href="/daily/report" className="whitespace-nowrap bg-blue-500 text-white px-4 py-2 rounded-md">Daily Report</a>
        </div>
      </div>
      <IssueReportsUserList />
    </div>
  );
};

export default ContractorsDashboard;
