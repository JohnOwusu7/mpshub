import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import { Company, getAllCompaniesApi, updateCompanyModulesApi } from '../../Api/api';
import { updateCompanyInfo } from '../../store/companySlice';
import showMessage from '../../components/Alerts/showMessage';
import IconSquareCheck from '../../components/Icon/IconSquareCheck';
import IconX from '../../components/Icon/IconX';
import IconBolt from '../../components/Icon/IconBolt';
import { IRootState } from '../../store';

interface ModuleDefinition {
    name: string;
    displayName: string;
}

const ALL_SYSTEM_MODULES: ModuleDefinition[] = [
    { name: 'issueReporting', displayName: 'Issue Reporting' },
    { name: 'inventory', displayName: 'Inventory Management' },
    { name: 'safetyPJO', displayName: 'Safety PJO' },
    { name: 'prestartChecks', displayName: 'Prestart Checks' },
    { name: 'equipmentAndOperator', displayName: 'Equipment & Operators' },
    { name: 'ipAddress', displayName: 'IP Address Management' },
    { name: 'reports', displayName: 'Reports' },
];

const ModuleSubscriptionManagement: React.FC = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: IRootState) => state.user.user);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [updatingModules, setUpdatingModules] = useState<boolean>(false);

    useEffect(() => {
        dispatch(setPageTitle('Module Subscription Management'));
        if (user?.roleName === 'SUPER-ADMIN') {
            fetchCompanies();
        } else {
            setLoading(false);
            showMessage({ message: 'Unauthorized Access', success: false });
        }
    }, [dispatch, user?.roleName]);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const data = await getAllCompaniesApi();
            setCompanies(data);
        } catch (error) {
            console.error('Failed to fetch companies:', error);
            showMessage({ message: 'Failed to load companies.', success: false });
        } finally {
            setLoading(false);
        }
    };

    const handleCompanySelect = (company: Company) => {
        setSelectedCompany(company);
    };

    const toggleModuleSubscription = async (moduleName: string) => {
        if (!selectedCompany) return;

        setUpdatingModules(true);
        let updatedModules = [...(selectedCompany.subscribedModules || [])];

        if (updatedModules.includes(moduleName)) {
            updatedModules = updatedModules.filter(name => name !== moduleName);
        } else {
            updatedModules.push(moduleName);
        }

        try {
            const response = await updateCompanyModulesApi(selectedCompany._id, updatedModules);
            if (response.success) {
                showMessage({ message: response.message, success: true });
                // Update the local state for the selected company and overall companies list
                setSelectedCompany(prev => prev ? { ...prev, subscribedModules: updatedModules } : null);
                setCompanies(prevCompanies => 
                    prevCompanies.map(comp => 
                        comp._id === selectedCompany._id ? { ...comp, subscribedModules: updatedModules } : comp
                    )
                );
                
                // Refresh company info in Redux store to update menu immediately
                // Check if the updated company is the current user's company
                if (user?.companyId === selectedCompany._id) {
                    dispatch(updateCompanyInfo(selectedCompany._id) as any);
                }
            } else {
                showMessage({ message: response.message, success: false });
            }
        } catch (error) {
            console.error('Error updating modules:', error);
            showMessage({ message: 'Failed to update modules.', success: false });
        } finally {
            setUpdatingModules(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <span className="animate-spin border-[3px] border-success border-l-transparent rounded-full w-6 h-6 inline-block"></span>
                <span className="ltr:ml-2 rtl:mr-2">Loading Companies...</span>
            </div>
        );
    }

    if (user?.roleName !== 'SUPER-ADMIN') {
        return <div className="panel">Access Denied. Only Super-Admins can manage module subscriptions.</div>;
    }

    return (
        <div className="panel">
            <h2 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl mb-6">Module Subscription Management</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Company Selection */}
                <div>
                    <h3 className="text-xl font-bold mb-4">Select Company</h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {companies.length > 0 ? (
                            companies.map(company => (
                                <div
                                    key={company._id}
                                    className={`p-4 rounded-md cursor-pointer flex items-center justify-between ${selectedCompany?._id === company._id ? 'bg-primary-light dark:bg-primary-dark text-primary' : 'bg-gray-100 dark:bg-gray-700'} `}
                                    onClick={() => handleCompanySelect(company)}
                                >
                                    <span className="font-semibold text-lg">{company.companyName}</span>
                                    {selectedCompany?._id === company._id && (
                                        <IconSquareCheck className="w-5 h-5" />
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-600 dark:text-gray-400">No companies registered.</p>
                        )}
                    </div>
                </div>

                {/* Module Toggling */}
                <div>
                    <h3 className="text-xl font-bold mb-4">Manage Modules for {selectedCompany?.companyName || 'No Company Selected'}</h3>
                    {selectedCompany ? (
                        <div className="space-y-4">
                            {ALL_SYSTEM_MODULES.map(moduleDef => {
                                const isSubscribed = selectedCompany.subscribedModules?.includes(moduleDef.name);
                                return (
                                    <button
                                        key={moduleDef.name}
                                        type="button"
                                        className={`btn w-full flex items-center justify-between ${isSubscribed ? 'btn-success' : 'btn-outline-dark'} ${updatingModules ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        onClick={() => toggleModuleSubscription(moduleDef.name)}
                                        disabled={updatingModules}
                                    >
                                        <span>{moduleDef.displayName}</span>
                                        {isSubscribed ? <IconSquareCheck className="w-5 h-5" /> : <IconX className="w-5 h-5" />}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-600 dark:text-gray-400">Please select a company from the left to manage its module subscriptions.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModuleSubscriptionManagement;
