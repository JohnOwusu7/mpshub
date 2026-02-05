import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { IRootState } from '../../store';
import { setPageTitle } from '../../store/themeConfigSlice';
import { fetchCompanyInfo } from '../../store/companySlice';
import axiosInstance from '../../Api/axiosInstance';
import { API_CONFIG } from '../../Api/apiConfig';
import { getAllDepartmentsApi, getAllSectionsByDepartmentApi, getAllServicesApi } from '../../Api/api';
import IconBuilding from '../../components/Icon/IconBuilding';
import IconUsers from '../../components/Icon/IconUsers';
import IconNotes from '../../components/Icon/IconNotes';
import IconSquareCheck from '../../components/Icon/IconSquareCheck';
import IconClock from '../../components/Icon/IconClock';
import IconDollarSign from '../../components/Icon/IconDollarSign';
import IconCalendar from '../../components/Icon/IconCalendar';
import IconArrowForward from '../../components/Icon/IconArrowForward';
import IconPlus from '../../components/Icon/IconPlus';
import IconMenuUsers from '../../components/Icon/Menu/IconMenuUsers';
import IconServer from '../../components/Icon/IconServer';
import IconInfoTriangle from '../../components/Icon/IconInfoTriangle';
import IconTrendingUp from '../../components/Icon/IconTrendingUp';
import showMessage from '../../components/Alerts/showMessage';
import CreateTicketModal from '../../components/CreateTicketModal';

const CountBadge: React.FC<{ count: number; variant?: 'info' | 'warning' }> = ({ count, variant = 'info' }) => {
    if (count <= 0) return null;
    const isWarning = variant === 'warning';
    return (
        <span
            className={`
                inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full text-xs font-bold text-white
                shadow-lg animate-pulse
                ${isWarning ? 'bg-warning shadow-warning/50 ring-2 ring-warning/40' : 'bg-info shadow-info/50 ring-2 ring-info/40'}
            `}
        >
            {count > 99 ? '99+' : count}
        </span>
    );
};

const CompanyDashboard: React.FC = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: IRootState) => state.user.user);
    const companyInfo = useSelector((state: IRootState) => state.company.companyInfo);

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalDepartments: 0,
        totalSections: 0,
        totalServices: 0,
        totalIssues: 0,
        openIssues: 0,
        completedIssues: 0,
        unassignedIssues: 0,
        myIncompleteIssues: 0,
        highPriorityOpen: 0,
        createdThisWeek: 0,
        completedThisWeek: 0,
        subscribedModulesCount: 0,
    });
    const [subscriptionDaysLeft, setSubscriptionDaysLeft] = useState<number | null>(null);
    const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);

    useEffect(() => {
        dispatch(setPageTitle('Dashboard'));
    }, [dispatch]);

    useEffect(() => {
        if (user?.companyId) {
            dispatch(fetchCompanyInfo(user.companyId) as any);
        }
    }, [dispatch, user?.companyId]);

    useEffect(() => {
        if (user?.companyId) {
            fetchDashboardData();
        } else {
            setLoading(false);
        }
    }, [user?.companyId]);

    useEffect(() => {
        const company = companyInfo;
        if (company?.subscriptionEndDate) {
            const end = new Date(company.subscriptionEndDate);
            const now = new Date();
            const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            setSubscriptionDaysLeft(diff);
        } else {
            setSubscriptionDaysLeft(null);
        }
        setStats((prev) => ({
            ...prev,
            subscribedModulesCount: company?.subscribedModules?.length ?? 0,
        }));
    }, [companyInfo]);

    const fetchDashboardData = async () => {
        if (!user?.companyId) return;
        setLoading(true);
        try {
            const [usersRes, issuesRes, departmentsData, servicesData] = await Promise.all([
                axiosInstance.get(API_CONFIG.users.endpoints.list),
                axiosInstance.get(API_CONFIG.issues.endpoints.list).catch(() => ({ data: [] })),
                getAllDepartmentsApi(user.companyId),
                getAllServicesApi(user.companyId).catch(() => []),
            ]);

            const users = usersRes.data || [];
            const issues = issuesRes.data || [];
            const services = Array.isArray(servicesData) ? servicesData : [];

            let sectionsCount = 0;
            for (const dept of departmentsData) {
                try {
                    const sections = await getAllSectionsByDepartmentApi(dept._id, user.companyId);
                    sectionsCount += sections.length;
                } catch {
                    // ignore
                }
            }

            const now = new Date();
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            const openIssues = issues.filter((i: any) => !i.isComplete);
            const unassigned = issues.filter((i: any) => {
                if (i.isComplete) return false;
                const at = i.assignedTo;
                const sub = i.assignedToSubsectionId;
                const atId = at ? (typeof at === 'string' ? at : at?._id) : null;
                const subId = sub ? (typeof sub === 'string' ? sub : sub?._id) : null;
                return !atId && !subId;
            });
            const userSubId = user?.subsectionId != null
                ? String(typeof user.subsectionId === 'object' && (user.subsectionId as any)?._id != null ? (user.subsectionId as any)._id : user.subsectionId)
                : (typeof localStorage !== 'undefined' ? localStorage.getItem('subsectionId') : null);
            const myIncomplete = issues.filter((i: any) => {
                if (i.isComplete) return false;
                const at = i.assignedTo;
                const sub = i.assignedToSubsectionId;
                const atId = at ? (typeof at === 'string' ? at : at?._id) : null;
                const subId = sub ? (typeof sub === 'string' ? sub : sub?._id) : null;
                if (atId && String(atId) === String(user?._id)) return true;
                if (subId && userSubId && String(subId) === userSubId) return true;
                return false;
            });
            const highPriorityOpen = openIssues.filter((i: any) => (i.priority || '').toLowerCase() === 'high').length;
            const createdThisWeek = issues.filter((i: any) => new Date(i.createdAt || i.issuedDate || 0) >= weekAgo).length;
            const completedThisWeek = issues.filter((i: any) => i.isComplete && new Date(i.updatedAt || i.completedAt || 0) >= weekAgo).length;

            setStats({
                totalUsers: users.length,
                activeUsers: users.filter((u: any) => u.status === 'ACTIVE').length,
                totalDepartments: departmentsData.length,
                totalSections: sectionsCount,
                totalServices: services.length,
                totalIssues: issues.length,
                openIssues: openIssues.length,
                completedIssues: issues.filter((i: any) => i.isComplete).length,
                unassignedIssues: unassigned.length,
                myIncompleteIssues: myIncomplete.length,
                highPriorityOpen,
                createdThisWeek,
                completedThisWeek,
                subscribedModulesCount: 0, // updated from companyInfo in useEffect
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            showMessage('Failed to load dashboard data.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const companyName = companyInfo?.companyName || user?.companyName || 'Your Company';
    const greeting = (() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    })();

    const userPermissions = user?.permissions || [];
    const canViewIssues = userPermissions.includes('issue:view') || userPermissions.includes('issue:assign');
    const canCreateIssue = userPermissions.includes('issue:create');
    const canViewUsers = userPermissions.includes('user:view');
    const canViewSubscription = true;

    const needAttention = stats.unassignedIssues + stats.highPriorityOpen;
    const subscriptionStatus =
        subscriptionDaysLeft === null
            ? 'unknown'
            : subscriptionDaysLeft < 0
            ? 'expired'
            : subscriptionDaysLeft <= 7
            ? 'expiring'
            : 'active';

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent" />
                <p className="mt-4 text-gray-500 dark:text-gray-400">Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome banner - full width */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 via-primary to-primary/80 dark:from-primary/80 dark:via-primary/70 dark:to-primary/60 p-8 md:p-10 text-white shadow-xl">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <p className="text-white/90 text-sm font-medium uppercase tracking-wider mb-1">{companyName}</p>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">
                            {greeting}, {user?.firstName || 'there'}!
                        </h1>
                        <p className="text-white/90 max-w-xl text-sm md:text-base">
                            Your organization at a glance. Use quick actions below to manage issues, users, and subscription.
                        </p>
                    </div>
                    <Link
                        to="/dashboard/home"
                        className="hidden md:inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium shrink-0"
                    >
                        <span>Company home</span>
                        <IconArrowForward className="w-4 h-4" />
                    </Link>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-white/5 rounded-full" />
            </div>

            {/* Two-column layout: Stats left, This week + Need attention right */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: At a glance - 2x3 grid of stats */}
                <div className="lg:col-span-2">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">At a glance</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="panel p-5 hover:shadow-lg transition-shadow border border-gray-200/50 dark:border-gray-700/50 rounded-xl">
                            <div className="flex items-start justify-between">
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Team</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalUsers}</p>
                                    <p className="text-xs text-success mt-0.5">{stats.activeUsers} active</p>
                                </div>
                                <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
                                    <IconUsers className="w-6 h-6 text-primary" />
                                </div>
                            </div>
                        </div>
                        <div className="panel p-5 hover:shadow-lg transition-shadow border border-gray-200/50 dark:border-gray-700/50 rounded-xl">
                            <div className="flex items-start justify-between">
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Structure</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalDepartments}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{stats.totalSections} sections</p>
                                </div>
                                <div className="p-2.5 rounded-xl bg-info/10 shrink-0">
                                    <IconBuilding className="w-6 h-6 text-info" />
                                </div>
                            </div>
                        </div>
                        <div className="panel p-5 hover:shadow-lg transition-shadow border border-gray-200/50 dark:border-gray-700/50 rounded-xl">
                            <div className="flex items-start justify-between">
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Services</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalServices}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">catalog</p>
                                </div>
                                <div className="p-2.5 rounded-xl bg-success/10 shrink-0">
                                    <IconServer className="w-6 h-6 text-success" />
                                </div>
                            </div>
                        </div>
                        <div className="panel p-5 hover:shadow-lg transition-shadow border border-gray-200/50 dark:border-gray-700/50 rounded-xl">
                            <div className="flex items-start justify-between">
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Issues</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalIssues}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{stats.openIssues} open · {stats.completedIssues} done</p>
                                </div>
                                <div className="p-2.5 rounded-xl bg-warning/10 shrink-0">
                                    <IconNotes className="w-6 h-6 text-warning" />
                                </div>
                            </div>
                        </div>
                        <div className="panel p-5 hover:shadow-lg transition-shadow border border-gray-200/50 dark:border-gray-700/50 rounded-xl">
                            <div className="flex items-start justify-between">
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Unassigned</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.unassignedIssues}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">open issues</p>
                                </div>
                                <div className="p-2.5 rounded-xl bg-danger/10 shrink-0">
                                    <IconClock className="w-6 h-6 text-danger" />
                                </div>
                            </div>
                        </div>
                        <div className="panel p-5 hover:shadow-lg transition-shadow border border-gray-200/50 dark:border-gray-700/50 rounded-xl">
                            <div className="flex items-start justify-between">
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Subscription</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                        {subscriptionDaysLeft === null ? '—' : subscriptionDaysLeft < 0 ? 'Expired' : `${subscriptionDaysLeft}d`}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {subscriptionStatus === 'active' && 'Active'}
                                        {subscriptionStatus === 'expiring' && 'Expiring soon'}
                                        {subscriptionStatus === 'expired' && 'Renew required'}
                                        {subscriptionStatus === 'unknown' && '—'}
                                    </p>
                                </div>
                                <div className="p-2.5 rounded-xl bg-success/10 shrink-0">
                                    <IconCalendar className="w-6 h-6 text-success" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: This week + Need attention */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">This week</h2>
                    <div className="panel p-5 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Created</span>
                                <span className="text-xl font-bold text-primary">{stats.createdThisWeek}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Completed</span>
                                <span className="text-xl font-bold text-success">{stats.completedThisWeek}</span>
                            </div>
                        </div>
                        <Link
                            to="/dashboard/issues"
                            className="mt-4 flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                        >
                            View analytics
                            <IconArrowForward className="w-4 h-4" />
                        </Link>
                    </div>

                    {needAttention > 0 && (
                        <div className="panel p-5 rounded-xl border-2 border-warning/40 bg-warning/5 dark:bg-warning/10">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-warning/20">
                                    <IconInfoTriangle className="w-5 h-5 text-warning" />
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Need attention</h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {stats.unassignedIssues} unassigned · {stats.highPriorityOpen} high priority open
                            </p>
                            <Link to="/activity" className="btn btn-warning btn-sm w-full justify-center">
                                View issues
                            </Link>
                        </div>
                    )}

                    {stats.subscribedModulesCount > 0 && (
                        <div className="panel p-5 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Active modules</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.subscribedModulesCount}</p>
                            <p className="text-xs text-gray-500 mt-0.5">subscribed</p>
                            <Link to="/users/subscription-status" className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">
                                Subscription
                                <IconArrowForward className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick actions - full width */}
            <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {canViewIssues && (
                        <Link
                            to="/activity"
                            className="panel p-5 flex items-center gap-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-warning/40 hover:shadow-md transition-all group relative"
                        >
                            <div className="p-3 rounded-xl bg-warning/10 group-hover:bg-warning/20 transition-colors shrink-0">
                                <IconSquareCheck className="w-6 h-6 text-warning" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-white">Activity Hub</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Assign and manage issues</p>
                            </div>
                            <CountBadge count={stats.unassignedIssues} variant="warning" />
                            <IconArrowForward className="w-5 h-5 text-gray-400 group-hover:text-warning shrink-0" />
                        </Link>
                    )}

                    {canViewIssues && (
                        <Link
                            to="/my-issues"
                            className="panel p-5 flex items-center gap-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-info/30 hover:shadow-md transition-all group relative"
                        >
                            <div className="p-3 rounded-xl bg-info/10 group-hover:bg-info/20 transition-colors shrink-0">
                                <IconClock className="w-6 h-6 text-info" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-white">My Issues</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Your assigned & incomplete</p>
                            </div>
                            <CountBadge count={stats.myIncompleteIssues} variant="info" />
                            <IconArrowForward className="w-5 h-5 text-gray-400 group-hover:text-info shrink-0" />
                        </Link>
                    )}

                    {canViewIssues && (
                        <Link
                            to="/dashboard/issues"
                            className="panel p-5 flex items-center gap-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-primary/30 hover:shadow-md transition-all group"
                        >
                            <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                <IconTrendingUp className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-white">Issue analytics</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Charts and breakdown</p>
                            </div>
                            <IconArrowForward className="w-5 h-5 text-gray-400 group-hover:text-primary shrink-0" />
                        </Link>
                    )}

                    {canCreateIssue && (
                        <button
                            type="button"
                            onClick={() => setShowCreateTicketModal(true)}
                            className="panel p-5 flex items-center gap-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-primary/30 hover:shadow-md transition-all group w-full text-left"
                        >
                            <div className="p-3 rounded-xl bg-success/10 group-hover:bg-success/20 transition-colors">
                                <IconPlus className="w-6 h-6 text-success" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-white">Create ticket</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Report an issue</p>
                            </div>
                            <IconArrowForward className="w-5 h-5 text-gray-400 group-hover:text-primary shrink-0" />
                        </button>
                    )}

                    {canViewUsers && (
                        <Link
                            to="/users/list"
                            className="panel p-5 flex items-center gap-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-primary/30 hover:shadow-md transition-all group"
                        >
                            <div className="p-3 rounded-xl bg-info/10 group-hover:bg-info/20 transition-colors">
                                <IconMenuUsers className="w-6 h-6 text-info" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-white">User management</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Team and roles</p>
                            </div>
                            <IconArrowForward className="w-5 h-5 text-gray-400 group-hover:text-primary shrink-0" />
                        </Link>
                    )}

                    {canViewSubscription && (
                        <Link
                            to="/users/subscription-status"
                            className="panel p-5 flex items-center gap-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-primary/30 hover:shadow-md transition-all group"
                        >
                            <div className="p-3 rounded-xl bg-warning/10 group-hover:bg-warning/20 transition-colors">
                                <IconDollarSign className="w-6 h-6 text-warning" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-white">Subscription</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Plan and modules</p>
                            </div>
                            <IconArrowForward className="w-5 h-5 text-gray-400 group-hover:text-primary shrink-0" />
                        </Link>
                    )}

                    {!canViewIssues && !canCreateIssue && !canViewUsers && canViewSubscription && (
                        <Link
                            to="/dashboard/my"
                            className="panel p-5 flex items-center gap-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-primary/30 hover:shadow-md transition-all group"
                        >
                            <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                <IconClock className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-white">My tasks</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Assigned issues</p>
                            </div>
                            <IconArrowForward className="w-5 h-5 text-gray-400 group-hover:text-primary shrink-0" />
                        </Link>
                    )}
                </div>
            </div>

            {/* Subscription callout when expiring soon */}
            {subscriptionDaysLeft !== null && subscriptionDaysLeft >= 0 && subscriptionDaysLeft <= 14 && (
                <div className="panel p-5 rounded-xl border-2 border-warning/50 bg-warning/5 dark:bg-warning/10">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="p-3 rounded-xl bg-warning/20 shrink-0">
                            <IconDollarSign className="w-8 h-8 text-warning" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Subscription {subscriptionDaysLeft === 0 ? 'expires today' : `expires in ${subscriptionDaysLeft} day${subscriptionDaysLeft === 1 ? '' : 's'}`}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Renew to avoid losing access. Contact your administrator or check subscription status.
                            </p>
                        </div>
                        <Link to="/users/subscription-status" className="btn btn-warning shrink-0">
                            View subscription
                        </Link>
                    </div>
                </div>
            )}
            <CreateTicketModal
                open={showCreateTicketModal}
                onClose={() => setShowCreateTicketModal(false)}
            />
        </div>
    );
};

export default CompanyDashboard;
