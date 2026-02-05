import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import { User, getAllUsersAcrossCompaniesApi, blockUserApi, unBlockUserApi, deleteUserApi, Company, getAllCompaniesApi } from '../../Api/api';
import showMessage from '../../components/Alerts/showMessage';
import IconUsers from '../../components/Icon/IconUsers';
import IconBuilding from '../../components/Icon/IconBuilding';
import IconSettings from '../../components/Icon/IconSettings';
import IconUser from '../../components/Icon/IconUser';
import IconLock from '../../components/Icon/IconLock';
import IconTrash from '../../components/Icon/IconTrash';
import { IRootState } from '../../store';

interface UserData extends User {
    companyName?: string; // To display company name directly
}

const AllCompanyUsers: React.FC = () => {
    const dispatch = useDispatch();
    const userState = useSelector((state: IRootState) => state.user);
    const [loading, setLoading] = useState<boolean>(true);
    const [users, setUsers] = useState<UserData[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [groupedUsers, setGroupedUsers] = useState<{ [companyId: string]: UserData[] }>({});
    const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('all'); // 'all' or company._id

    useEffect(() => {
        dispatch(setPageTitle('All Company Users Management'));
        if (userState.user?.roleName === 'SUPER-ADMIN') {
            fetchAllCompanyData();
        } else {
            setLoading(false);
            showMessage({ message: 'Unauthorized Access', success: false });
        }
    }, [dispatch, userState.user?.roleName]);

    const fetchAllCompanyData = async () => {
        setLoading(true);
        try {
            const [usersData, companiesData] = await Promise.all([
                getAllUsersAcrossCompaniesApi(),
                getAllCompaniesApi()
            ]);

            if (Array.isArray(usersData) && Array.isArray(companiesData)) {
                setCompanies(companiesData);

                const companyMap = new Map<string, string>();
                companiesData.forEach(company => companyMap.set(company._id, company.companyName));

                const usersWithCompanyNames = usersData.map(userData => ({
                    ...userData,
                    companyName: companyMap.get(userData.companyId || '') || 'N/A'
                }));
                setUsers(usersWithCompanyNames);
                groupUsersByCompany(usersWithCompanyNames);
            } else {
                showMessage({ message: 'Failed to fetch user or company data.', success: false });
            }
        } catch (error) {
            console.error('Error fetching all company data:', error);
            showMessage({ message: 'Failed to load all company data.', success: false });
        } finally {
            setLoading(false);
        }
    };

    const groupUsersByCompany = (allUsers: UserData[]) => {
        const grouped: { [companyId: string]: UserData[] } = {};
        allUsers.forEach(user => {
            // Only include users from client companies, exclude Qaretech Innovative
            const company = companies.find(c => c._id === user.companyId);
            if (company && company.companyName === 'Qaretech Innovative') {
                return; // Skip Qaretech Innovative users
            }
            const companyId = user.companyId || 'no_company';
            if (!grouped[companyId]) {
                grouped[companyId] = [];
            }
            grouped[companyId].push(user);
        });
        setGroupedUsers(grouped);
    };

    const handleCompanyFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCompanyFilter(e.target.value);
    };

    const filteredCompanies = selectedCompanyFilter === 'all'
        ? companies.filter(company => company.companyName !== 'Qaretech Innovative')
        : companies.filter(company => company._id === selectedCompanyFilter && company.companyName !== 'Qaretech Innovative');

    const filteredGroupedUsers = Object.keys(groupedUsers).reduce((acc, companyId) => {
        const company = companies.find(c => c._id === companyId);
        if (company && company.companyName === 'Qaretech Innovative') {
            return acc; // Exclude Qaretech Innovative from grouped users
        }
        if (selectedCompanyFilter === 'all' || companyId === selectedCompanyFilter) {
            acc[companyId] = groupedUsers[companyId];
        }
        return acc;
    }, {} as { [companyId: string]: UserData[] });

    const handleUserAction = async (userId: string, action: 'block' | 'unblock' | 'delete') => {
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
            return;
        }
        try {
            let response;
            switch (action) {
                case 'block':
                    response = await blockUserApi(userId);
                    break;
                case 'unblock':
                    response = await unBlockUserApi(userId);
                    break;
                case 'delete':
                    response = await deleteUserApi(userId);
                    break;
                default:
                    return;
            }

            if (response.success) {
                showMessage({ message: response.message, success: true });
                fetchAllCompanyData(); // Refresh data
            } else {
                showMessage({ message: response.message, success: false });
            }
        } catch (error) {
            console.error(`Error ${action}ing user:`, error);
            showMessage({ message: `Failed to ${action} user.`, success: false });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <span className="animate-spin border-[3px] border-success border-l-transparent rounded-full w-6 h-6 inline-block"></span>
                <span className="ltr:ml-2 rtl:mr-2">Loading Users...</span>
            </div>
        );
    }

    if (userState.user?.roleName !== 'SUPER-ADMIN') {
        return <div className="panel">Access Denied. Only Super-Admins can manage all company users.</div>;
    }

    return (
        <div className="panel">
            <h2 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl mb-6">All Company Users Management</h2>

            <div className="mb-6 flex justify-end">
                <select
                    value={selectedCompanyFilter}
                    onChange={handleCompanyFilterChange}
                    className="form-select w-auto"
                >
                    <option value="all">All Companies</option>
                    {companies.filter(company => company.companyName !== 'Qaretech Innovative').map(company => (
                        <option key={company._id} value={company._id}>
                            {company.companyName}
                        </option>
                    ))}
                </select>
            </div>

            {Object.keys(filteredGroupedUsers).length > 0 ? (
                filteredCompanies.map(company => {
                    const usersInCompany = filteredGroupedUsers[company._id];
                    if (!usersInCompany || usersInCompany.length === 0) return null;

                    return (
                        <div key={company._id} className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <IconBuilding className="w-6 h-6 text-primary" />
                                <h3 className="text-2xl font-bold text-primary">{company.companyName}</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {usersInCompany.map(userData => (
                                    <div key={userData._id} className="bg-white dark:bg-[#1c232f] rounded-md shadow p-6 relative">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <div className="bg-gray-200 dark:bg-gray-800 rounded-full w-12 h-12 flex items-center justify-center">
                                                <IconUser className="w-6 h-6 text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-semibold">{`${userData.firstName} ${userData.lastName}`}</p>
                                                <p className="text-sm text-gray-500">{userData.roleName}</p>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 mb-2"><span className="font-semibold">ID:</span> {userData.identityNo}</p>
                                        <p className="text-gray-600 dark:text-gray-400 mb-2"><span className="font-semibold">Email:</span> {userData.email}</p>
                                        <p className="text-gray-600 dark:text-gray-400 mb-2"><span className="font-semibold">Phone:</span> {userData.phone}</p>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4"><span className="font-semibold">Status:</span> <span className={`${userData.status === 'ACTIVE' ? 'text-green-500' : 'text-red-500'} font-medium`}>{userData.status}</span></p>

                                        <div className="flex justify-end space-x-2 mt-4">
                                            {userData.status === 'ACTIVE' ? (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-warning"
                                                    onClick={() => handleUserAction(userData._id, 'block')}
                                                >
                                                    <IconLock className="w-4 h-4 mr-2" />Block
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-success"
                                                    onClick={() => handleUserAction(userData._id, 'unblock')}
                                                >
                                                    <IconLock className="w-4 h-4 mr-2" />Unblock
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleUserAction(userData._id, 'delete')}
                                            >
                                                <IconTrash className="w-4 h-4 mr-2" />Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })
            ) : (
                <p className="text-gray-600 dark:text-gray-400">No users found across any companies.</p>
            )}
        </div>
    );
};

export default AllCompanyUsers;
