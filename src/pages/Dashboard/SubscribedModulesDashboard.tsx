import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { setPageTitle } from '../../store/themeConfigSlice';
import { Company, getCompanyByIdApi } from '../../Api/api';
import showMessage from '../../components/Alerts/showMessage';
import IconDesktop from '../../components/Icon/IconDesktop'; // Using IconDesktop as a general module icon
import IconBox from '../../components/Icon/IconBox'; // Icon for Inventory (exists)
import IconSquareCheck from '../../components/Icon/IconSquareCheck'; // Using IconSquareCheck for Safety PJO
import IconNotes from '../../components/Icon/IconNotes'; // Using IconNotes for Issue Reporting
import { Link } from 'react-router-dom';

interface ModuleInfo {
    name: string;
    displayName: string;
    icon: JSX.Element;
    description: string;
    path: string; // Path to the module's main page
}

const ALL_AVAILABLE_MODULES: ModuleInfo[] = [
    {
        name: 'issueReporting',
        displayName: 'Issue Reporting',
        icon: <IconNotes className="w-8 h-8 text-white" />,
        description: 'Manage and track all reported issues within your company.',
        path: '/activity',
    },
    {
        name: 'inventory',
        displayName: 'Inventory Management',
        icon: <IconBox className="w-8 h-8 text-white" />,
        description: 'Monitor and control your equipment and stock inventory.',
        path: '/inventory/equipment',
    },
    {
        name: 'safetyPJO',
        displayName: 'Safety PJO',
        icon: <IconSquareCheck className="w-8 h-8 text-white" />,
        description: 'Conduct and manage Planned Job Observations for safety compliance.',
        path: '/safety/planned-job',
    },
    // Add other modules here as needed
];

const SubscribedModulesDashboard: React.FC = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: IRootState) => state.user.user);
    const [companyInfo, setCompanyInfo] = useState<Company | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        dispatch(setPageTitle('Module Dashboard'));
        if (user?.companyId) {
            fetchCompanyDetails(user.companyId);
        } else {
            setLoading(false);
        }
    }, [dispatch, user?.companyId]);

    const fetchCompanyDetails = async (companyId: string) => {
        try {
            setLoading(true);
            const data = await getCompanyByIdApi(companyId);
            setCompanyInfo(data);
        } catch (error) {
            console.error('Failed to fetch company details for dashboard:', error);
            showMessage({ message: 'Failed to load company details.', success: false });
        } finally {
            setLoading(false);
        }
    };

    const subscribedModules = companyInfo?.subscribedModules || [];
    const activeModules = ALL_AVAILABLE_MODULES.filter(module => subscribedModules.includes(module.name));
    const availableButNotSubscribedModules = ALL_AVAILABLE_MODULES.filter(module => !subscribedModules.includes(module.name));

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <span className="animate-spin border-[3px] border-success border-l-transparent rounded-full w-6 h-6 inline-block"></span>
                <span className="ltr:ml-2 rtl:mr-2">Loading Modules...</span>
            </div>
        );
    }

    return (
        <div className="panel">
            <h2 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl mb-6">My Modules Dashboard</h2>

            {companyInfo && ( // Display company name only if companyInfo is available
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-6">Welcome to {companyInfo.companyName}!</p>
            )}

            <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Activated Modules</h3>
                {activeModules.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeModules.map((module) => (
                            <Link to={module.path} key={module.name} className="bg-gradient-to-r from-primary to-info rounded-lg shadow-lg p-6 flex flex-col items-center justify-center text-white text-center transition-transform transform hover:scale-105 duration-300">
                                <div className="mb-4 p-3 rounded-full bg-white bg-opacity-20">
                                    {module.icon}
                                </div>
                                <h4 className="text-xl font-semibold mb-2">{module.displayName}</h4>
                                <p className="text-sm opacity-80">{module.description}</p>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600 dark:text-gray-400">No modules are currently activated for your company. Please contact your Super Admin.</p>
                )}
            </div>

            {availableButNotSubscribedModules.length > 0 && (
                <div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Available Modules (Not Subscribed)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {availableButNotSubscribedModules.map((module) => (
                            <div key={module.name} className="bg-gray-100 dark:bg-gray-700 rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center text-gray-700 dark:text-gray-300">
                                <div className="mb-4 p-3 rounded-full bg-gray-300 dark:bg-gray-600 bg-opacity-50">
                                    {module.icon}
                                </div>
                                <h4 className="text-xl font-semibold mb-2">{module.displayName}</h4>
                                <p className="text-sm opacity-80">{module.description}</p>
                                <p className="mt-4 text-sm text-gray-500">Contact your Super Admin to subscribe to this module.</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscribedModulesDashboard;
