import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { setPageTitle } from '../../store/themeConfigSlice';
import axiosInstance from '../../Api/axiosInstance';
import { API_CONFIG } from '../../Api/apiConfig';
import IconNotes from '../../components/Icon/IconNotes';
import IconClock from '../../components/Icon/IconClock';
import IconSquareCheck from '../../components/Icon/IconSquareCheck';
import IconInfoTriangle from '../../components/Icon/IconInfoTriangle';
import IconSearch from '../../components/Icon/IconSearch';
import showMessage from '../../components/Alerts/showMessage';
import { fetchCompanyInfo } from '../../store/companySlice';
import ModuleNotSubscribed from '../../components/ModuleNotSubscribed';

const ISSUE_REPORTING_MODULE = 'issueReporting';

type IssueProgress = 'new' | 'in-progress' | 'complete' | string | null | undefined;

interface Issue {
    _id: string;
    title?: string;
    description?: string;
    descriptionText?: string;
    status?: string;
    progress?: IssueProgress;
    priority?: string;
    location?: string;
    isComplete?: boolean;
    createdAt: string;
    updatedAt: string;
    sectionId?: { _id: string; name: string } | string | null;
    departmentId?: { _id: string; name: string } | string | null;
    reportedBy?: {
        firstName?: string;
        lastName?: string;
    };
    completedBy?: {
        _id: string;
        firstName?: string;
        lastName?: string;
    } | string | null;
    assignedTo?: {
        _id: string;
        firstName?: string;
        lastName?: string;
    } | string | null;
}

type FilterTab = 'all' | 'open' | 'in-progress' | 'completed';

const MyAssignedIssues: React.FC = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: IRootState) => state.user.user);
    const companyInfo = useSelector((state: IRootState) => state.company?.companyInfo);

    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [moduleNotSubscribed, setModuleNotSubscribed] = useState<boolean>(false);
    const [selectedTab, setSelectedTab] = useState<FilterTab>('open');
    const [search, setSearch] = useState<string>('');

    const permissions: string[] = user?.permissions || [];
    const canWorkOn = permissions.includes('issue:work_on') || permissions.includes('all:access');
    const canResolve = permissions.includes('issue:resolve') || permissions.includes('all:access');

    useEffect(() => {
        dispatch(setPageTitle('My Assigned Issues'));
    }, [dispatch]);

    useEffect(() => {
        if (user?.companyId && !companyInfo) {
            dispatch(fetchCompanyInfo(user.companyId) as any);
        }
    }, [user?.companyId, companyInfo, dispatch]);

    useEffect(() => {
        if (!user?._id) return;
        const subscribed = companyInfo?.subscribedModules ?? [];
        if (companyInfo && !subscribed.includes(ISSUE_REPORTING_MODULE)) {
            setModuleNotSubscribed(true);
            setLoading(false);
            return;
        }
        if (companyInfo && subscribed.includes(ISSUE_REPORTING_MODULE)) {
            setModuleNotSubscribed(false);
        }
        fetchAssignedIssues();
    }, [user?._id, companyInfo]);

    const fetchAssignedIssues = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(API_CONFIG.issues.endpoints.list);
            const allIssues: Issue[] = response.data || [];

            // Normalize: subsectionId can be string or object (e.g. from localStorage); also fallback to localStorage so re-login isn't required
            const rawSub = user?.subsectionId ?? (typeof localStorage !== 'undefined' ? localStorage.getItem('subsectionId') : null);
            const userSubsectionId = rawSub != null && rawSub !== ''
                ? String(typeof rawSub === 'object' && rawSub !== null && '_id' in rawSub ? (rawSub as { _id: string })._id : rawSub)
                : null;
            const myIssues = allIssues.filter((issue: any) => {
                const assigned = issue.assignedTo;
                const assignedId = assigned ? (typeof assigned === 'string' ? assigned : (assigned._id || assigned)) : null;
                const subsectionId = issue.assignedToSubsectionId
                    ? (typeof issue.assignedToSubsectionId === 'string' ? issue.assignedToSubsectionId : (issue.assignedToSubsectionId._id || issue.assignedToSubsectionId))
                    : null;
                if (assignedId && String(assignedId) === String(user?._id)) return true;
                if (subsectionId && userSubsectionId && String(subsectionId) === userSubsectionId) return true;
                return false;
            });

            // Sort by most recently updated first
            myIssues.sort(
                (a, b) =>
                    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );

            setIssues(myIssues);
        } catch (error: any) {
            if (error?.response?.data?.code === 'MODULE_NOT_SUBSCRIBED') {
                setModuleNotSubscribed(true);
            } else {
                console.error('Error fetching assigned issues:', error);
                showMessage({ message: 'Failed to load your assigned issues.', success: false });
            }
        } finally {
            setLoading(false);
        }
    };

    const stats = useMemo(() => {
        const total = issues.length;
        const inProgress = issues.filter(
            (i) => i.progress === 'in-progress' && !i.isComplete
        ).length;
        const completed = issues.filter((i) => i.isComplete).length;
        const open = issues.filter(
            (i) =>
                !i.isComplete &&
                (i.progress === 'new' ||
                    i.progress === null ||
                    i.progress === undefined ||
                    i.progress === '' ||
                    i.progress === 'pending')
        ).length;
        return { total, inProgress, completed, open };
    }, [issues]);

    const filteredIssues = useMemo(() => {
        let res = issues;
        if (selectedTab === 'open') {
            res = res.filter(
                (i) =>
                    !i.isComplete &&
                    (i.progress === 'new' ||
                        i.progress === null ||
                        i.progress === undefined ||
                        i.progress === '' ||
                        i.progress === 'pending')
            );
        } else if (selectedTab === 'in-progress') {
            res = res.filter((i) => i.progress === 'in-progress' && !i.isComplete);
        } else if (selectedTab === 'completed') {
            res = res.filter((i) => i.isComplete);
        }

        if (search.trim()) {
            const term = search.toLowerCase();
            res = res.filter((i) => {
                const title = (i.title || '').toLowerCase();
                const desc = (i.description || i.descriptionText || '').toLowerCase();
                const location = (i.location || '').toLowerCase();
                return (
                    title.includes(term) ||
                    desc.includes(term) ||
                    location.includes(term)
                );
            });
        }
        return res;
    }, [issues, selectedTab, search]);

    const getPriorityBadgeClass = (priority?: string) => {
        switch ((priority || '').toLowerCase()) {
            case 'high':
                return 'badge bg-danger text-white';
            case 'medium':
                return 'badge bg-warning text-white';
            case 'low':
                return 'badge bg-success text-white';
            default:
                return 'badge bg-primary text-white';
        }
    };

    const getProgressBadgeClass = (progress?: IssueProgress, isComplete?: boolean) => {
        if (isComplete) return 'badge bg-success text-white';
        switch ((progress || '').toLowerCase()) {
            case 'in-progress':
                return 'badge bg-info text-white';
            case 'complete':
                return 'badge bg-success text-white';
            default:
                return 'badge bg-secondary text-white';
        }
    };

    const handleStartProgress = async (issue: Issue) => {
        if (!canWorkOn) {
            showMessage({ message: 'You do not have permission to start work on issues.', success: false });
            return;
        }
        try {
            await axiosInstance.put(`/issues/start-progress/${issue._id}`);
            showMessage({ message: 'Progress started successfully.', success: true });
            setSelectedTab('in-progress');
            await fetchAssignedIssues();
        } catch (error: any) {
            console.error('Error starting progress:', error);
            const msg =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                'Failed to start progress.';
            showMessage({ message: msg, success: false });
        }
    };

    const handleCompleteProgress = async (issue: Issue) => {
        if (!canResolve && !canWorkOn) {
            showMessage({ message: 'You do not have permission to complete issues.', success: false });
            return;
        }
        try {
            await axiosInstance.put(
                `${API_CONFIG.issues.endpoints.completeProgress}/${issue._id}`
            );
            showMessage({ message: 'Issue marked as completed.', success: true });
            fetchAssignedIssues();
        } catch (error: any) {
            console.error('Error completing issue:', error);
            const msg =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                'Failed to complete issue.';
            showMessage({ message: msg, success: false });
        }
    };

    if (moduleNotSubscribed) {
        return <ModuleNotSubscribed moduleName="Issues" />;
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="loader" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold">My Assigned Issues</h2>
                    <p className="text-sm text-white-dark">
                        View and process issues that are assigned directly to you.
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="panel">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-white-dark">Total Assigned</p>
                            <h3 className="text-2xl font-bold">{stats.total}</h3>
                        </div>
                        <div className="p-2 bg-primary/10 rounded-full">
                            <IconNotes className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                </div>
                <div className="panel">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-white-dark">Open</p>
                            <h3 className="text-2xl font-bold">{stats.open}</h3>
                        </div>
                        <div className="p-2 bg-warning/10 rounded-full">
                            <IconInfoTriangle className="w-6 h-6 text-warning" />
                        </div>
                    </div>
                </div>
                <div className="panel">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-white-dark">In Progress</p>
                            <h3 className="text-2xl font-bold">{stats.inProgress}</h3>
                        </div>
                        <div className="p-2 bg-info/10 rounded-full">
                            <IconClock className="w-6 h-6 text-info" />
                        </div>
                    </div>
                </div>
                <div className="panel">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-white-dark">Completed</p>
                            <h3 className="text-2xl font-bold">{stats.completed}</h3>
                        </div>
                        <div className="p-2 bg-success/10 rounded-full">
                            <IconSquareCheck className="w-6 h-6 text-success" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters + Search */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        className={`btn btn-sm ${
                            selectedTab === 'open'
                                ? 'btn-primary'
                                : 'btn-outline-primary'
                        }`}
                        onClick={() => setSelectedTab('open')}
                    >
                        Open
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm ${
                            selectedTab === 'in-progress'
                                ? 'btn-primary'
                                : 'btn-outline-primary'
                        }`}
                        onClick={() => setSelectedTab('in-progress')}
                    >
                        In Progress
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm ${
                            selectedTab === 'completed'
                                ? 'btn-primary'
                                : 'btn-outline-primary'
                        }`}
                        onClick={() => setSelectedTab('completed')}
                    >
                        Completed
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm ${
                            selectedTab === 'all'
                                ? 'btn-primary'
                                : 'btn-outline-primary'
                        }`}
                        onClick={() => setSelectedTab('all')}
                    >
                        All
                    </button>
                </div>

                <div className="relative w-full max-w-xs">
                    <input
                        type="text"
                        className="form-input w-full ltr:pr-10 rtl:pl-10"
                        placeholder="Search by title, description, or location..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <div className="absolute top-1/2 -translate-y-1/2 ltr:right-3 rtl:left-3 text-white-dark">
                        <IconSearch className="w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="panel p-0">
                {filteredIssues.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <IconNotes className="w-12 h-12 mb-3 text-white-dark" />
                        <p className="font-semibold mb-1">No issues found</p>
                        <p className="text-sm text-white-dark">
                            You currently have no issues in this view.
                        </p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table-hover">
                            <thead>
                                <tr className="text-xs text-white-dark uppercase">
                                    <th className="ltr:pl-4 rtl:pr-4">Issue</th>
                                    <th>Section</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Reported By</th>
                                    <th>Completed By</th>
                                    <th className="ltr:pr-4 rtl:pl-4 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredIssues.map((issue) => {
                                    const sectionName =
                                        typeof issue.sectionId === 'string'
                                            ? issue.sectionId
                                            : (issue.sectionId as any)?.name;
                                    const deptName =
                                        typeof issue.departmentId === 'string'
                                            ? issue.departmentId
                                            : (issue.departmentId as any)?.name;
                                    const desc =
                                        issue.description || issue.descriptionText || '';

                                    return (
                                        <tr key={issue._id}>
                                            <td className="align-top ltr:pl-4 rtl:pr-4">
                                                <div className="font-semibold mb-1">
                                                    {issue.title || 'No title'}
                                                </div>
                                                <div className="text-xs text-white-dark line-clamp-2">
                                                    {desc || 'No description.'}
                                                </div>
                                                {issue.location && (
                                                    <div className="text-[11px] text-white-dark mt-1">
                                                        <span className="font-semibold">
                                                            Location:
                                                        </span>{' '}
                                                        {issue.location}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="align-top">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="badge badge-outline-success whitespace-nowrap">
                                                        {sectionName || '—'}
                                                    </span>
                                                    {deptName && (
                                                        <span className="text-[11px] text-white-dark truncate max-w-[8rem]">
                                                            {deptName}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="align-top">
                                                <span
                                                    className={getPriorityBadgeClass(
                                                        issue.priority
                                                    )}
                                                >
                                                    {issue.priority || 'normal'}
                                                </span>
                                            </td>
                                            <td className="align-top">
                                                <span
                                                    className={getProgressBadgeClass(
                                                        issue.progress,
                                                        issue.isComplete
                                                    )}
                                                >
                                                    {issue.isComplete
                                                        ? 'Completed'
                                                        : issue.progress === 'in-progress'
                                                        ? 'In Progress'
                                                        : 'Open'}
                                                </span>
                                            </td>
                                            <td className="align-top text-xs text-white-dark">
                                                {new Date(
                                                    issue.createdAt
                                                ).toLocaleString()}
                                            </td>
                                            <td className="align-top text-xs text-white-dark">
                                                {issue.reportedBy
                                                    ? `${issue.reportedBy.firstName || ''} ${
                                                          issue.reportedBy.lastName || ''
                                                      }`.trim()
                                                    : '—'}
                                            </td>
                                            <td className="align-top text-xs text-white-dark">
                                                {issue.isComplete && issue.completedBy
                                                    ? typeof issue.completedBy === 'object' && issue.completedBy !== null
                                                        ? `${(issue.completedBy as any).firstName || ''} ${(issue.completedBy as any).lastName || ''}`.trim() || '—'
                                                        : '—'
                                                    : '—'}
                                            </td>
                                            <td className="align-top ltr:pr-4 rtl:pl-4">
                                                <div className="flex justify-end gap-2">
                                                    {!issue.isComplete && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="btn btn-xs btn-outline-info"
                                                                onClick={() =>
                                                                    handleStartProgress(issue)
                                                                }
                                                                disabled={
                                                                    !canWorkOn ||
                                                                    issue.progress ===
                                                                        'in-progress'
                                                                }
                                                            >
                                                                Start
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-xs btn-success"
                                                                onClick={() =>
                                                                    handleCompleteProgress(
                                                                        issue
                                                                    )
                                                                }
                                                                disabled={!canResolve && !canWorkOn}
                                                            >
                                                                Complete
                                                            </button>
                                                        </>
                                                    )}
                                                    {issue.isComplete && (
                                                        <span className="text-xs text-success font-semibold">
                                                            Done
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyAssignedIssues;

