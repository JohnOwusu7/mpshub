import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { setPageTitle } from '../../store/themeConfigSlice';
import { Company, getCompanyByIdApi } from '../../Api/api';
import { IRootState } from '../../store';
import IconCalendar from '../../components/Icon/IconCalendar';
import IconBuilding from '../../components/Icon/IconBuilding';
import IconCircleCheck from '../../components/Icon/IconCircleCheck';
import IconAlertTriangle from '../../components/Icon/IconInfoTriangle';
import IconXCircle from '../../components/Icon/IconXCircle';
import IconClock from '../../components/Icon/IconClock';

interface ModuleDefinition {
    name: string;
    displayName: string;
}

const ALL_SYSTEM_MODULES: ModuleDefinition[] = [
    { name: 'issueReporting', displayName: 'Issue Reporting' },
    { name: 'inventory', displayName: 'Inventory Management' },
    { name: 'safetyPJO', displayName: 'Safety PJO' },
    { name: 'prestartChecks', displayName: 'Prestart Checks' },
    { name: 'ipAddress', displayName: 'IP Address Management' },
    { name: 'reports', displayName: 'Reports' },
];

const SubscriptionStatus: React.FC = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: IRootState) => state.user.user);
    const [companyInfo, setCompanyInfo] = useState<Company | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        dispatch(setPageTitle('Subscription Status'));
        if (user?.companyId && user?.roleName !== 'SUPER-ADMIN') {
            fetchCompanyDetails(user.companyId);
        } else {
            setLoading(false);
            if (user?.roleName === 'SUPER-ADMIN') {
                setError('Super Admin does not have a company subscription.');
            } else {
                setError('Company information not available.');
            }
        }
    }, [dispatch, user?.companyId, user?.roleName]);

    const fetchCompanyDetails = async (companyId: string) => {
        try {
            setLoading(true);
            setError(null);
            const data = await getCompanyByIdApi(companyId);
            setCompanyInfo(data);
        } catch (error: any) {
            console.error('Failed to fetch company details:', error);
            if (error.response?.status === 403) {
                setError('You do not have permission to view subscription details.');
            } else {
                setError('Failed to load subscription information.');
            }
        } finally {
            setLoading(false);
        }
    };

    const calculateRemainingDays = (endDate: string): number => {
        if (!endDate) return 0;
        const now = new Date();
        const end = new Date(endDate);
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getSubscriptionStatus = (endDate: string): { status: 'active' | 'expiring' | 'expired'; color: string; icon: JSX.Element; message: string } => {
        if (!endDate) {
            return {
                status: 'expired',
                color: 'danger',
                icon: <IconXCircle className="w-6 h-6" />,
                message: 'Not Configured'
            };
        }

        const remainingDays = calculateRemainingDays(endDate);
        
        if (remainingDays < 0) {
            return {
                status: 'expired',
                color: 'danger',
                icon: <IconXCircle className="w-6 h-6" />,
                message: 'Expired'
            };
        } else if (remainingDays <= 7) {
            return {
                status: 'expiring',
                color: 'warning',
                icon: <IconAlertTriangle className="w-6 h-6" />,
                message: 'Expiring Soon'
            };
        } else {
            return {
                status: 'active',
                color: 'success',
                icon: <IconCircleCheck className="w-6 h-6" />,
                message: 'Active'
            };
        }
    };

    const getModuleDisplayName = (moduleName: string): string => {
        const module = ALL_SYSTEM_MODULES.find(m => m.name === moduleName);
        return module ? module.displayName : moduleName;
    };

    if (loading) {
        return (
            <div className="panel">
                <div className="flex justify-center items-center h-64">
                    <span className="animate-spin border-[3px] border-success border-l-transparent rounded-full w-8 h-8 inline-block"></span>
                    <span className="ltr:ml-3 rtl:mr-3">Loading subscription information...</span>
                </div>
            </div>
        );
    }

    if (error || !companyInfo) {
        return (
            <div className="panel">
                <div className="text-center py-10">
                    <IconXCircle className="w-16 h-16 text-danger mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Unable to Load Subscription</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'Company information not available.'}</p>
                    <Link to="/users/profile" className="btn btn-primary">
                        Back to Profile
                    </Link>
                </div>
            </div>
        );
    }

    const remainingDays = calculateRemainingDays(companyInfo.subscriptionEndDate);
    const subscriptionStatus = getSubscriptionStatus(companyInfo.subscriptionEndDate);
    const subscribedModules = companyInfo.subscribedModules || [];

    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse mb-5">
                <li>
                    <Link to="/users/profile" className="text-primary hover:underline">
                        Profile
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Subscription Status</span>
                </li>
            </ul>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Subscription Overview Card */}
                <div className="lg:col-span-2">
                    <div className="panel">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Subscription Overview</h2>
                            <span className={`badge badge-outline-${subscriptionStatus.color}`}>
                                {subscriptionStatus.icon}
                                <span className="ml-2">{subscriptionStatus.message}</span>
                            </span>
                        </div>

                        <div className="space-y-6">
                            {/* Company Info */}
                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <IconBuilding className="w-8 h-8 text-primary shrink-0" />
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Company</p>
                                    <p className="font-semibold text-lg">{companyInfo.companyName}</p>
                                </div>
                            </div>

                            {/* Subscription Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <IconCalendar className="w-5 h-5 text-primary" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
                                    </div>
                                    <p className="font-semibold text-lg">
                                        {companyInfo.subscriptionStartDate
                                            ? new Date(companyInfo.subscriptionStartDate).toLocaleDateString('en-US', {
                                                  year: 'numeric',
                                                  month: 'long',
                                                  day: 'numeric',
                                              })
                                            : 'N/A'}
                                    </p>
                                </div>

                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <IconCalendar className="w-5 h-5 text-primary" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400">End Date</p>
                                    </div>
                                    <p className="font-semibold text-lg">
                                        {companyInfo.subscriptionEndDate
                                            ? new Date(companyInfo.subscriptionEndDate).toLocaleDateString('en-US', {
                                                  year: 'numeric',
                                                  month: 'long',
                                                  day: 'numeric',
                                              })
                                            : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* Remaining Days */}
                            <div className={`p-6 rounded-lg ${
                                remainingDays < 0
                                    ? 'bg-danger/10 border-2 border-danger'
                                    : remainingDays <= 7
                                    ? 'bg-warning/10 border-2 border-warning'
                                    : 'bg-success/10 border-2 border-success'
                            }`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <IconClock className={`w-8 h-8 ${
                                            remainingDays < 0
                                                ? 'text-danger'
                                                : remainingDays <= 7
                                                ? 'text-warning'
                                                : 'text-success'
                                        }`} />
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Days Remaining</p>
                                            <p className={`text-3xl font-bold ${
                                                remainingDays < 0
                                                    ? 'text-danger'
                                                    : remainingDays <= 7
                                                    ? 'text-warning'
                                                    : 'text-success'
                                            }`}>
                                                {remainingDays < 0 ? Math.abs(remainingDays) : remainingDays}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {remainingDays < 0
                                                    ? 'days expired'
                                                    : remainingDays === 0
                                                    ? 'expires today'
                                                    : remainingDays === 1
                                                    ? 'day remaining'
                                                    : 'days remaining'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status Message */}
                            {remainingDays <= 7 && remainingDays >= 0 && (
                                <div className="p-4 bg-warning/10 border border-warning rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <IconAlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-warning">Subscription Expiring Soon</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                Your subscription will expire in {remainingDays} day(s). Please contact your administrator to renew.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {remainingDays < 0 && (
                                <div className="p-4 bg-danger/10 border border-danger rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <IconXCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-danger">Subscription Expired</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                Your subscription expired {Math.abs(remainingDays)} day(s) ago. Please contact your administrator to renew.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Subscribed Modules Card */}
                <div className="lg:col-span-1">
                    <div className="panel">
                        <h3 className="text-xl font-bold mb-6">Subscribed Modules</h3>

                        {subscribedModules.length === 0 ? (
                            <div className="text-center py-8">
                                <IconAlertTriangle className="w-12 h-12 text-warning mx-auto mb-3" />
                                <p className="text-gray-600 dark:text-gray-400">No modules subscribed</p>
                                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                    Contact your administrator to subscribe to modules.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {subscribedModules.map((moduleName) => (
                                    <div
                                        key={moduleName}
                                        className="p-4 bg-success/10 border border-success/20 rounded-lg"
                                    >
                                        <div className="flex items-center gap-2">
                                            <IconCircleCheck className="w-5 h-5 text-success shrink-0" />
                                            <p className="font-semibold">{getModuleDisplayName(moduleName)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Available Modules Info */}
                        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                <strong>Available Modules:</strong>
                            </p>
                            <ul className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                                {ALL_SYSTEM_MODULES.map((module) => (
                                    <li key={module.name} className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${
                                            subscribedModules.includes(module.name)
                                                ? 'bg-success'
                                                : 'bg-gray-400'
                                        }`}></span>
                                        {module.displayName}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionStatus;

