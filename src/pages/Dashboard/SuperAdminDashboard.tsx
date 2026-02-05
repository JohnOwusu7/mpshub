import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import { Company, getAllCompaniesApi, getAllUsersAcrossCompaniesApi } from '../../Api/api';
import { Link } from 'react-router-dom';
import IconBuilding from '../../components/Icon/IconBuilding';
import IconUsers from '../../components/Icon/IconUsers';
import IconSquareCheck from '../../components/Icon/IconSquareCheck';
import IconSettings from '../../components/Icon/IconSettings';
import IconBolt from '../../components/Icon/IconBolt';
import IconInfoTriangle from '../../components/Icon/IconInfoTriangle';
import IconCalendar from '../../components/Icon/IconCalendar';
import IconNotes from '../../components/Icon/IconNotes';
import IconBox from '../../components/Icon/IconBox';
import showMessage from '../../components/Alerts/showMessage';

interface CompanyStats {
    totalCompanies: number;
    totalUsers: number;
    activeUsers: number;
    totalSubscribedModules: { [key: string]: number };
    expiringSubscriptions: number;
    expiredSubscriptions: number;
}


interface ModuleInfo {
    name: string;
    displayName: string;
    icon: JSX.Element;
}

const ALL_AVAILABLE_MODULES: ModuleInfo[] = [
    {
        name: 'issueReporting',
        displayName: 'Issue Reporting',
        icon: <IconNotes className="w-5 h-5" />,
    },
    {
        name: 'inventory',
        displayName: 'Inventory Management',
        icon: <IconBox className="w-5 h-5" />,
    },
    {
        name: 'safetyPJO',
        displayName: 'Safety PJO',
        icon: <IconSquareCheck className="w-5 h-5" />,
    },
    {
        name: 'prestartChecks',
        displayName: 'Prestart Checks',
        icon: <IconSquareCheck className="w-5 h-5" />,
    },
    {
        name: 'ipAddress',
        displayName: 'IP Address Management',
        icon: <IconSettings className="w-5 h-5" />,
    },
    {
        name: 'reports',
        displayName: 'Reports',
        icon: <IconSquareCheck className="w-5 h-5" />,
    },
];

const SuperAdminDashboard: React.FC = () => {
    const dispatch = useDispatch();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [stats, setStats] = useState<CompanyStats>({
        totalCompanies: 0,
        totalUsers: 0,
        activeUsers: 0,
        totalSubscribedModules: {},
        expiringSubscriptions: 0,
        expiredSubscriptions: 0,
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [expiringCompanies, setExpiringCompanies] = useState<Company[]>([]);
    const [companiesWithModules, setCompaniesWithModules] = useState<Company[]>([]);

    useEffect(() => {
        dispatch(setPageTitle('Super Admin Dashboard'));
    }, [dispatch]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch all companies
            const companiesData = await getAllCompaniesApi();
            setCompanies(companiesData);

            // Calculate statistics
            let totalUsersCount = 0;
            let activeUsersCount = 0;
            const moduleCounts: { [key: string]: number } = {};
            let expiringCount = 0;
            let expiredCount = 0;
            const expiring: Company[] = [];
            const companiesWithSubs: Company[] = [];

            // Use getAllUsersAcrossCompaniesApi to get all users at once (more efficient)
            try {
                const allUsers = await getAllUsersAcrossCompaniesApi();
                totalUsersCount = allUsers.length;
                activeUsersCount = allUsers.filter((u: any) => u.status === 'ACTIVE').length;
            } catch (error) {
                console.error('Error fetching all users:', error);
            }

            // Process companies for subscriptions and modules
            const now = new Date();
            const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

            companiesData.forEach((company) => {
                // Count subscribed modules
                if (company.subscribedModules && company.subscribedModules.length > 0) {
                    company.subscribedModules.forEach((module: string) => {
                        moduleCounts[module] = (moduleCounts[module] || 0) + 1;
                    });
                    companiesWithSubs.push(company);
                }

                // Check subscription expiration
                if (company.subscriptionEndDate) {
                    const endDate = new Date(company.subscriptionEndDate);
                    if (endDate < now) {
                        expiredCount++;
                    } else if (endDate <= thirtyDaysFromNow) {
                        expiringCount++;
                        expiring.push(company);
                    }
                }
            });

            // Sort expiring companies by expiration date
            expiring.sort((a, b) => {
                const dateA = a.subscriptionEndDate ? new Date(a.subscriptionEndDate).getTime() : 0;
                const dateB = b.subscriptionEndDate ? new Date(b.subscriptionEndDate).getTime() : 0;
                return dateA - dateB;
            });

            setExpiringCompanies(expiring.slice(0, 5)); // Top 5 expiring
            setCompaniesWithModules(companiesWithSubs);

            setStats({
                totalCompanies: companiesData.length,
                totalUsers: totalUsersCount,
                activeUsers: activeUsersCount,
                totalSubscribedModules: moduleCounts,
                expiringSubscriptions: expiringCount,
                expiredSubscriptions: expiredCount,
            });
        } catch (error: any) {
            console.error('Error fetching dashboard data:', error);
            showMessage({ message: 'Failed to load dashboard data.', success: false });
        } finally {
            setLoading(false);
        }
    };

    const getModuleDisplayName = (moduleName: string): string => {
        const module = ALL_AVAILABLE_MODULES.find(m => m.name === moduleName);
        return module ? module.displayName : moduleName;
    };

    const getDaysUntilExpiration = (endDate: string): number => {
        const end = new Date(endDate);
        const now = new Date();
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getSubscriptionStatus = (company: Company): { status: string; color: string } => {
        if (!company.subscriptionEndDate) {
            return { status: 'No expiration set', color: 'text-gray-500' };
        }

        const daysLeft = getDaysUntilExpiration(company.subscriptionEndDate);
        if (daysLeft < 0) {
            return { status: 'Expired', color: 'text-danger' };
        } else if (daysLeft <= 7) {
            return { status: `${daysLeft} days left`, color: 'text-danger' };
        } else if (daysLeft <= 30) {
            return { status: `${daysLeft} days left`, color: 'text-warning' };
        } else {
            return { status: `${daysLeft} days left`, color: 'text-success' };
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
                    <h2 className="text-xl font-semibold">Super Admin Dashboard</h2>
                    <p className="text-gray-600 dark:text-gray-400">System-wide overview and management</p>
                </div>
                <Link to="/admin/register-company" className="btn btn-primary">
                    <IconBolt className="w-5 h-5 mr-2" />
                    Register New Company
                </Link>
            </div>

            {/* System Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="panel">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 mb-1">Total Companies</p>
                            <h3 className="text-2xl font-bold">{stats.totalCompanies}</h3>
                        </div>
                        <div className="p-3 bg-primary/10 rounded-full">
                            <IconBuilding className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 mb-1">Total Users</p>
                            <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
                            <p className="text-sm text-success mt-1">{stats.activeUsers} Active</p>
                        </div>
                        <div className="p-3 bg-info/10 rounded-full">
                            <IconUsers className="w-8 h-8 text-info" />
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 mb-1">Expiring Subscriptions</p>
                            <h3 className="text-2xl font-bold text-warning">{stats.expiringSubscriptions}</h3>
                            <p className="text-sm text-danger mt-1">{stats.expiredSubscriptions} Expired</p>
                        </div>
                        <div className="p-3 bg-warning/10 rounded-full">
                            <IconInfoTriangle className="w-8 h-8 text-warning" />
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 mb-1">Active Modules</p>
                            <h3 className="text-2xl font-bold">{Object.keys(stats.totalSubscribedModules).length}</h3>
                            <p className="text-sm text-gray-500 mt-1">Subscribed</p>
                        </div>
                        <div className="p-3 bg-success/10 rounded-full">
                            <IconSquareCheck className="w-8 h-8 text-success" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Subscription Expiration Alerts */}
                <div className="panel">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-semibold text-lg">Expiring Subscriptions</h5>
                        <Link to="/admin/module-subscriptions" className="text-primary hover:underline text-sm">
                            Manage
                        </Link>
                    </div>
                    {expiringCompanies.length > 0 ? (
                        <div className="space-y-3">
                            {expiringCompanies.map((company) => {
                                const status = getSubscriptionStatus(company);
                                return (
                                    <div
                                        key={company._id}
                                        className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <Link
                                                to={`/admin/companies/${company._id}`}
                                                className="font-semibold hover:text-primary text-sm"
                                            >
                                                {company.companyName}
                                            </Link>
                                            <span className={`text-xs font-semibold ${status.color}`}>
                                                {status.status}
                                            </span>
                                        </div>
                                        {company.subscriptionEndDate && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <IconCalendar className="w-3 h-3" />
                                                Expires: {new Date(company.subscriptionEndDate).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <IconCalendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No expiring subscriptions</p>
                        </div>
                    )}
                </div>

                {/* Available Modules */}
                <div className="panel">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-semibold text-lg">Available Modules</h5>
                        <Link to="/admin/module-subscriptions" className="text-primary hover:underline text-sm">
                            Manage
                        </Link>
                    </div>
                    <div className="space-y-2">
                        {ALL_AVAILABLE_MODULES.map((module) => {
                            const subscriptionCount = stats.totalSubscribedModules[module.name] || 0;
                            return (
                                <div
                                    key={module.name}
                                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            {module.icon}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{module.displayName}</p>
                                            <p className="text-xs text-gray-500">
                                                {subscriptionCount} {subscriptionCount === 1 ? 'company' : 'companies'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Companies with Modules */}
                <div className="panel">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-semibold text-lg">Companies & Modules</h5>
                        <Link to="/admin/companies" className="text-primary hover:underline text-sm">
                            View All
                        </Link>
                    </div>
                    {companiesWithModules.length > 0 ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {companiesWithModules.slice(0, 10).map((company) => (
                                <div
                                    key={company._id}
                                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                                >
                                    <Link
                                        to={`/admin/companies/${company._id}`}
                                        className="font-semibold hover:text-primary text-sm block mb-2"
                                    >
                                        {company.companyName}
                                    </Link>
                                    <div className="flex flex-wrap gap-1">
                                        {company.subscribedModules?.slice(0, 3).map((module) => (
                                            <span
                                                key={module}
                                                className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
                                            >
                                                {getModuleDisplayName(module)}
                                            </span>
                                        ))}
                                        {company.subscribedModules && company.subscribedModules.length > 3 && (
                                            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                                +{company.subscribedModules.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <IconBuilding className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No companies with modules</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Module Subscription Statistics */}
            <div className="panel mb-6">
                <div className="flex items-center justify-between mb-5">
                    <h5 className="font-semibold text-lg">Module Subscription Statistics</h5>
                    <Link to="/admin/module-subscriptions" className="text-primary hover:underline text-sm">
                        Manage Module Subscriptions
                    </Link>
                </div>
                {Object.keys(stats.totalSubscribedModules).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(stats.totalSubscribedModules)
                            .sort((a, b) => b[1] - a[1])
                            .map(([moduleName, count]) => (
                                <div
                                    key={moduleName}
                                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            {ALL_AVAILABLE_MODULES.find(m => m.name === moduleName)?.icon || <IconSquareCheck className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{getModuleDisplayName(moduleName)}</p>
                                            <p className="text-sm text-gray-500">
                                                {count} {count === 1 ? 'company' : 'companies'} subscribed
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-primary">{count}</div>
                                </div>
                            ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <IconSquareCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No module subscriptions yet</p>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="panel">
                <h5 className="font-semibold text-lg mb-5">Quick Actions</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link
                        to="/admin/register-company"
                        className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <IconBolt className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-semibold">Register Company</p>
                            <p className="text-sm text-gray-500">Add a new company</p>
                        </div>
                    </Link>

                    <Link
                        to="/admin/module-subscriptions"
                        className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <div className="p-2 bg-success/10 rounded-lg">
                            <IconSettings className="w-5 h-5 text-success" />
                        </div>
                        <div>
                            <p className="font-semibold">Module Management</p>
                            <p className="text-sm text-gray-500">Manage subscriptions</p>
                        </div>
                    </Link>

                    <Link
                        to="/admin/companies"
                        className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <div className="p-2 bg-info/10 rounded-lg">
                            <IconBuilding className="w-5 h-5 text-info" />
                        </div>
                        <div>
                            <p className="font-semibold">Manage Companies</p>
                            <p className="text-sm text-gray-500">View all companies</p>
                        </div>
                    </Link>

                    <Link
                        to="/admin/all-company-users"
                        className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <div className="p-2 bg-warning/10 rounded-lg">
                            <IconUsers className="w-5 h-5 text-warning" />
                        </div>
                        <div>
                            <p className="font-semibold">All Users</p>
                            <p className="text-sm text-gray-500">View all users</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
