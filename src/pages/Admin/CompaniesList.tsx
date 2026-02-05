import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import { getAllCompaniesApi, deleteCompanyApi } from '../../Api/api';
import showMessage from '../../components/Alerts/showMessage';
import { Link } from 'react-router-dom';
import IconEdit from '../../components/Icon/IconEdit';
import IconTrash from '../../components/Icon/IconTrash';
import IconBuilding from '../../components/Icon/IconBuilding'; // Import department icon

interface Company {
    _id: string;
    companyName: string;
    registrationDate: string;
    contactEmail: string;
    isActive: boolean;
    subscriptionEndDate: string;
}

const CompaniesList: React.FC = () => {
    const dispatch = useDispatch();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        dispatch(setPageTitle('Companies List'));
        fetchCompanies();
    }, [dispatch]);

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

    const handleDelete = async (companyId: string) => {
        if (window.confirm('Are you sure you want to delete this company and all its associated data? This action cannot be undone.')) {
            try {
                setLoading(true);
                const response = await deleteCompanyApi(companyId);
                if (response.success) {
                    showMessage({ message: response.message, success: true });
                    fetchCompanies(); // Refresh the list
                } else {
                    showMessage({ message: response.message, success: false });
                }
            } catch (error) {
                console.error('Failed to delete company:', error);
                showMessage({ message: 'Failed to delete company.', success: false });
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="panel">
            <h2 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl mb-5">Registered Companies</h2>
            {loading ? (
                <div className="flex justify-center items-center">
                    <span className="animate-spin border-[3px] border-success border-l-transparent rounded-full w-6 h-6 inline-block"></span>
                    <span className="ltr:ml-2 rtl:mr-2">Loading Companies...</span>
                </div>
            ) : (
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Company Name</th>
                                <th>Contact Email</th>
                                <th>Registration Date</th>
                                <th>Status</th>
                                <th>Subscription End</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {companies.map((company) => (
                                <tr key={company._id}>
                                    <td>{company.companyName}</td>
                                    <td>{company.contactEmail}</td>
                                    <td>{new Date(company.registrationDate).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`badge ${company.isActive ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                                            {company.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>{new Date(company.subscriptionEndDate).toLocaleDateString()}</td>
                                    <td className="text-center p-2">
                                        <div className="flex items-center justify-center gap-2">
                                            <Link to={`/admin/companies/edit/${company._id}`} className="btn btn-sm btn-outline-primary">
                                                <IconEdit className="w-4 h-4" />
                                            </Link>
                                            <Link to={`/admin/departments/company/${company._id}`} className="btn btn-sm btn-outline-info">
                                                <IconBuilding className="w-4 h-4" />
                                            </Link>
                                            <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(company._id)}>
                                                <IconTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CompaniesList;
