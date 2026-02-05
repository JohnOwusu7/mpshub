import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { setPageTitle } from '../../store/themeConfigSlice';
import ReactApexChart from 'react-apexcharts';
import axiosInstance from '../../Api/axiosInstance';
import { API_CONFIG } from '../../Api/apiConfig';
import { getAllDepartmentsApi, getAllSectionsByDepartmentApi } from '../../Api/api';
import IconTrendingUp from '../../components/Icon/IconTrendingUp';
import IconSquareCheck from '../../components/Icon/IconSquareCheck';
import IconClock from '../../components/Icon/IconClock';
import IconUser from '../../components/Icon/IconUser';
import IconNotes from '../../components/Icon/IconNotes';
import IconBuilding from '../../components/Icon/IconBuilding';
import IconUsers from '../../components/Icon/IconUsers';
import { Link } from 'react-router-dom';
import showMessage from '../../components/Alerts/showMessage';

interface Issue {
    _id: string;
    title: string;
    status: string;
    priority: string;
    assignedTo?: {
        _id: string;
        firstName: string;
        lastName: string;
    };
    createdBy?: {
        firstName: string;
        lastName: string;
    };
    issuedDate?: string;
    createdAt?: string;
    isComplete: boolean;
    isAssigned: boolean;
}

const IssueAnalyticsDashboard: React.FC = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: IRootState) => state.user.user);
    const [totalCount, setTotalCount] = useState(0);
    const [completedIssueCount, setCompletedIssueCount] = useState(0);
    const [notCompletedIssueCount, setNotCompletedIssueCount] = useState(0);
    const [newUnassignedTask, setNewUnassignedTask] = useState(0);
    const [percentComplete, setPercentComplete] = useState(0);
    const [percentNotComplete, setPercentNotComplete] = useState(0);
    const [notCompleted, setNotCompleted] = useState<Issue[]>([]);
    const [topAssignees, setTopAssignees] = useState<any[]>([]);
    const [issuesCreatedOverTime, setIssuesCreatedOverTime] = useState<any>({ series: [{ data: [] }], options: {} });
    const [loading, setLoading] = useState<boolean>(true);
    
    // Company-wide statistics
    const [totalUsers, setTotalUsers] = useState(0);
    const [activeUsers, setActiveUsers] = useState(0);
    const [totalDepartments, setTotalDepartments] = useState(0);
    const [totalSections, setTotalSections] = useState(0);
    const [issuesByPriority, setIssuesByPriority] = useState({ high: 0, medium: 0, low: 0 });
    const [issuesByStatus, setIssuesByStatus] = useState({ pending: 0, inProgress: 0, completed: 0 });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        dispatch(setPageTitle('Company Analytics Dashboard'));
    }, [dispatch]);

    useEffect(() => {
        fetchIssues();
        fetchCompanyStatistics();
    }, [user]);

    const fetchIssues = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`${API_CONFIG.issues.endpoints.list}`);
            const issues = response.data || [];

            const count = issues.length;
            const completedTask = issues.filter((issue: Issue) => issue.isComplete).length;
            const notCompletedTask = issues.filter((issue: Issue) => !issue.isComplete).length;
            const newNotAssigned = issues.filter((issue: Issue) => !issue.isAssigned).length;
            const percentageComplete = count > 0 ? (completedTask / count) * 100 : 0;
            const percentageNotComplete = 100 - percentageComplete;
            const pending = issues.filter((issue: Issue) => !issue.isComplete);

            setTotalCount(count);
            setCompletedIssueCount(completedTask);
            setNotCompletedIssueCount(notCompletedTask);
            setNewUnassignedTask(newNotAssigned);
            setPercentComplete(percentageComplete);
            setPercentNotComplete(percentageNotComplete);
            setNotCompleted(pending);

            // Calculate top assignees with pending issues
            const assigneesWithPending: { [key: string]: { name: string; count: number } } = {};
            pending.forEach((issue: Issue) => {
                const assigneeName = issue?.assignedTo
                    ? `${issue.assignedTo.firstName} ${issue.assignedTo.lastName}`
                    : 'Unassigned';
                if (assigneesWithPending[assigneeName]) {
                    assigneesWithPending[assigneeName].count++;
                } else {
                    assigneesWithPending[assigneeName] = { name: assigneeName, count: 1 };
                }
            });

            const sortedAssignees = Object.values(assigneesWithPending)
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);
            setTopAssignees(sortedAssignees);

            // Process issues created over time
            const issuesByDate: { [key: string]: number } = {};
            issues.forEach((issue: Issue) => {
                const date = new Date(issue.issuedDate ?? issue.createdAt ?? 0).toISOString().split('T')[0];
                issuesByDate[date] = (issuesByDate[date] || 0) + 1;
            });

            const sortedDates = Object.keys(issuesByDate).sort();
            const seriesData = sortedDates.map((date) => issuesByDate[date]);

            setIssuesCreatedOverTime({
                series: [{ name: 'Issues Created', data: seriesData }],
                options: {
                    chart: {
                        height: 350,
                        type: 'line',
                        fontFamily: 'Nunito, sans-serif',
                        toolbar: {
                            show: true,
                        },
                    },
                    stroke: {
                        curve: 'smooth',
                        width: 3,
                    },
                    colors: ['#2196F3'],
                    grid: {
                        padding: {
                            top: 5,
                            bottom: 5,
                            left: 5,
                            right: 5,
                        },
                    },
                    xaxis: {
                        categories: sortedDates,
                        labels: {
                            rotate: -45,
                        },
                    },
                    title: {
                        text: 'Issues Created Over Time',
                        align: 'left',
                    },
                },
            });

            // Calculate issues by priority
            const priorityCounts = { high: 0, medium: 0, low: 0 };
            issues.forEach((issue: any) => {
                const priority = (issue.priority || 'low').toLowerCase();
                if (priority === 'high') priorityCounts.high++;
                else if (priority === 'medium') priorityCounts.medium++;
                else priorityCounts.low++;
            });
            setIssuesByPriority(priorityCounts);

            // Calculate issues by status
            const statusCounts = { pending: 0, inProgress: 0, completed: 0 };
            issues.forEach((issue: any) => {
                if (issue.isComplete) {
                    statusCounts.completed++;
                } else if (issue.status === 'IN_PROGRESS' || issue.progress === 'in-progress') {
                    statusCounts.inProgress++;
                } else {
                    statusCounts.pending++;
                }
            });
            setIssuesByStatus(statusCounts);

            // Get recent activity (last 10 issues)
            const recent = [...issues]
                .sort((a: any, b: any) => new Date(b.createdAt || b.issuedDate).getTime() - new Date(a.createdAt || a.issuedDate).getTime())
                .slice(0, 10);
            setRecentActivity(recent);
        } catch (error: any) {
            console.error('Error fetching issues:', error);
            showMessage({ message: 'Failed to load analytics data.', success: false });
        } finally {
            setLoading(false);
        }
    };

    const fetchCompanyStatistics = async () => {
        if (!user?.companyId) return;

        try {
            // Fetch users (the API endpoint automatically filters by companyId from headers)
            const usersResponse = await axiosInstance.get(API_CONFIG.users.endpoints.list);
            const users = usersResponse.data || [];
            const activeUsersCount = users.filter((u: any) => u.status === 'ACTIVE').length;
            setTotalUsers(users.length);
            setActiveUsers(activeUsersCount);

            // Fetch departments
            const departments = await getAllDepartmentsApi(user.companyId);
            setTotalDepartments(departments.length);

            // Fetch sections for all departments
            let totalSectionsCount = 0;
            for (const dept of departments) {
                try {
                    const sections = await getAllSectionsByDepartmentApi(dept._id, user.companyId);
                    totalSectionsCount += sections.length;
                } catch (error) {
                    console.error(`Error fetching sections for department ${dept._id}:`, error);
                }
            }
            setTotalSections(totalSectionsCount);
        } catch (error: any) {
            console.error('Error fetching company statistics:', error);
            // Don't show error message for stats, just log it
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-semibold">Company Analytics Dashboard</h2>
                    <p className="text-gray-600 dark:text-gray-400">Comprehensive overview of your company's systems and activities</p>
                </div>
                <Link to="/activity" className="btn btn-primary">
                    <IconNotes className="w-5 h-5 mr-2" />
                    View All Issues
                </Link>
            </div>

            {/* Company Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="panel">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 mb-1">Total Users</p>
                            <h3 className="text-2xl font-bold">{totalUsers}</h3>
                            <p className="text-sm text-success mt-1">{activeUsers} Active</p>
                        </div>
                        <div className="p-3 bg-primary/10 rounded-full">
                            <IconUsers className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 mb-1">Departments</p>
                            <h3 className="text-2xl font-bold">{totalDepartments}</h3>
                        </div>
                        <div className="p-3 bg-info/10 rounded-full">
                            <IconBuilding className="w-8 h-8 text-info" />
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 mb-1">Sections</p>
                            <h3 className="text-2xl font-bold">{totalSections}</h3>
                        </div>
                        <div className="p-3 bg-warning/10 rounded-full">
                            <IconBuilding className="w-8 h-8 text-warning" />
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 mb-1">Total Issues</p>
                            <h3 className="text-2xl font-bold">{totalCount}</h3>
                            <p className="text-sm text-success mt-1">{completedIssueCount} Completed</p>
                        </div>
                        <div className="p-3 bg-success/10 rounded-full">
                            <IconNotes className="w-8 h-8 text-success" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Issue Statistics by Priority and Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="panel">
                    <h5 className="font-semibold text-lg mb-5">Issues by Priority</h5>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-danger rounded-full"></div>
                                <span className="font-semibold">High Priority</span>
                            </div>
                            <span className="text-xl font-bold">{issuesByPriority.high}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-warning rounded-full"></div>
                                <span className="font-semibold">Medium Priority</span>
                            </div>
                            <span className="text-xl font-bold">{issuesByPriority.medium}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-success rounded-full"></div>
                                <span className="font-semibold">Low Priority</span>
                            </div>
                            <span className="text-xl font-bold">{issuesByPriority.low}</span>
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <h5 className="font-semibold text-lg mb-5">Issues by Status</h5>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-warning rounded-full"></div>
                                <span className="font-semibold">Pending</span>
                            </div>
                            <span className="text-xl font-bold">{issuesByStatus.pending}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-info rounded-full"></div>
                                <span className="font-semibold">In Progress</span>
                            </div>
                            <span className="text-xl font-bold">{issuesByStatus.inProgress}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-success rounded-full"></div>
                                <span className="font-semibold">Completed</span>
                            </div>
                            <span className="text-xl font-bold">{issuesByStatus.completed}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="panel">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 mb-1">Total Issues</p>
                            <h3 className="text-2xl font-bold">{totalCount}</h3>
                        </div>
                        <div className="p-3 bg-primary/10 rounded-full">
                            <IconNotes className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 mb-1">Completed</p>
                            <h3 className="text-2xl font-bold">{completedIssueCount}</h3>
                            <p className="text-sm text-success mt-1">{percentComplete.toFixed(1)}%</p>
                        </div>
                        <div className="p-3 bg-success/10 rounded-full">
                            <IconSquareCheck className="w-8 h-8 text-success" />
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 mb-1">In Progress</p>
                            <h3 className="text-2xl font-bold">{notCompletedIssueCount}</h3>
                            <p className="text-sm text-warning mt-1">{percentNotComplete.toFixed(1)}%</p>
                        </div>
                        <div className="p-3 bg-warning/10 rounded-full">
                            <IconClock className="w-8 h-8 text-warning" />
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 mb-1">Unassigned</p>
                            <h3 className="text-2xl font-bold">{newUnassignedTask}</h3>
                        </div>
                        <div className="p-3 bg-danger/10 rounded-full">
                            <IconUser className="w-8 h-8 text-danger" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts and Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="panel">
                    <h5 className="font-semibold text-lg mb-5">Issues Created Over Time</h5>
                    {issuesCreatedOverTime.series[0].data.length > 0 ? (
                        <ReactApexChart
                            series={issuesCreatedOverTime.series}
                            options={issuesCreatedOverTime.options}
                            type="line"
                            height={350}
                        />
                    ) : (
                        <div className="flex justify-center items-center h-64 text-gray-500">
                            <p>No data available</p>
                        </div>
                    )}
                </div>

                <div className="panel">
                    <h5 className="font-semibold text-lg mb-5">Top Assignees (Pending Issues)</h5>
                    {topAssignees.length > 0 ? (
                        <div className="space-y-4">
                            {topAssignees.map((assignee, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                            <IconUser className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{assignee.name}</p>
                                            <p className="text-sm text-gray-500">{assignee.count} pending issue(s)</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex justify-center items-center h-64 text-gray-500">
                            <p>No pending issues</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Uncompleted Issues */}
            <div className="panel">
                <div className="flex items-center justify-between mb-5">
                    <h5 className="font-semibold text-lg">Recent Uncompleted Issues</h5>
                    <Link to="/activity" className="text-primary hover:underline text-sm">
                        View All
                    </Link>
                </div>
                {notCompleted.length > 0 ? (
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Priority</th>
                                    <th>Assigned To</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {notCompleted.slice(0, 10).map((issue) => (
                                    <tr key={issue._id}>
                                        <td>
                                            <Link
                                                to="/activity"
                                                className="font-semibold hover:text-primary"
                                            >
                                                {issue.title}
                                            </Link>
                                        </td>
                                        <td>
                                            <span className={`badge ${
                                                issue.priority === 'HIGH' ? 'bg-danger' :
                                                issue.priority === 'MEDIUM' ? 'bg-warning' :
                                                'bg-success'
                                            } text-white`}>
                                                {issue.priority || 'NORMAL'}
                                            </span>
                                        </td>
                                        <td>
                                            {issue.assignedTo
                                                ? `${issue.assignedTo.firstName} ${issue.assignedTo.lastName}`
                                                : 'Unassigned'}
                                        </td>
                                        <td>
                                            <span className={`badge ${
                                                issue.isComplete ? 'bg-success' :
                                                issue.status === 'IN_PROGRESS' ? 'bg-info' :
                                                'bg-warning'
                                            } text-white`}>
                                                {issue.isComplete ? 'COMPLETED' : issue.status || 'PENDING'}
                                            </span>
                                        </td>
                                        <td>{new Date(issue.issuedDate ?? issue.createdAt ?? 0).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <IconSquareCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>All issues are completed!</p>
                    </div>
                )}
            </div>

            {/* Recent Activity */}
            <div className="panel">
                <div className="flex items-center justify-between mb-5">
                    <h5 className="font-semibold text-lg">Recent Activity</h5>
                    <Link to="/activity" className="text-primary hover:underline text-sm">
                        View All
                    </Link>
                </div>
                {recentActivity.length > 0 ? (
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Assigned To</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentActivity.map((issue: any) => (
                                    <tr key={issue._id}>
                                        <td>
                                            <Link
                                                to="/activity"
                                                className="font-semibold hover:text-primary"
                                            >
                                                {issue.title}
                                            </Link>
                                        </td>
                                        <td>
                                            <span className={`badge ${
                                                (issue.priority || 'low').toLowerCase() === 'high' ? 'bg-danger' :
                                                (issue.priority || 'low').toLowerCase() === 'medium' ? 'bg-warning' :
                                                'bg-success'
                                            } text-white`}>
                                                {(issue.priority || 'low').toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${
                                                issue.isComplete ? 'bg-success' :
                                                issue.status === 'IN_PROGRESS' || issue.progress === 'in-progress' ? 'bg-info' :
                                                'bg-warning'
                                            } text-white`}>
                                                {issue.isComplete ? 'COMPLETED' : 
                                                 issue.status === 'IN_PROGRESS' || issue.progress === 'in-progress' ? 'IN PROGRESS' : 
                                                 'PENDING'}
                                            </span>
                                        </td>
                                        <td>
                                            {issue.assignedTo
                                                ? `${issue.assignedTo.firstName || ''} ${issue.assignedTo.lastName || ''}`
                                                : 'Unassigned'}
                                        </td>
                                        <td>{new Date(issue.createdAt ?? issue.issuedDate ?? 0).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <IconNotes className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No recent activity</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IssueAnalyticsDashboard;

