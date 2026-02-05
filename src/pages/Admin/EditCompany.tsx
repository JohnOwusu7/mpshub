import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { setPageTitle } from '../../store/themeConfigSlice';
import { getCompanyByIdApi, updateCompanyApi, ApiResponse } from '../../Api/api';
import showMessage from '../../components/Alerts/showMessage';
import IconBolt from '../../components/Icon/IconBolt';
import IconMail from '../../components/Icon/IconMail';
import IconCalendar from '../../components/Icon/IconCalendar';
import { IRootState } from '../../store';

interface Company {
    _id: string;
    companyName: string;
    registrationDate: string;
    contactEmail: string;
    isActive: boolean;
    subscriptionStartDate: string;
    subscriptionEndDate: string;
}

const EditCompany: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { companyId } = useParams<{ companyId: string }>();
    const user = useSelector((state: IRootState) => state.user.user);
    const isSuperAdmin = user?.roleName === 'SUPER-ADMIN';

    const [companyName, setCompanyName] = useState<string>('');
    const [contactEmail, setContactEmail] = useState<string>('');
    const [isActive, setIsActive] = useState<boolean>(true);
    const [subscriptionStartDate, setSubscriptionStartDate] = useState<string>('');
    const [subscriptionEndDate, setSubscriptionEndDate] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        dispatch(setPageTitle('Edit Company'));
        if (companyId) {
            fetchCompanyDetails(companyId);
        }
    }, [dispatch, companyId]);

    const fetchCompanyDetails = async (id: string) => {
        try {
            setLoading(true);
            const data = await getCompanyByIdApi(id);
            setCompanyName(data.companyName);
            setContactEmail(data.contactEmail);
            setIsActive(data.isActive);
            setSubscriptionStartDate(data.subscriptionStartDate ? new Date(data.subscriptionStartDate).toISOString().split('T')[0] : '');
            setSubscriptionEndDate(data.subscriptionEndDate ? new Date(data.subscriptionEndDate).toISOString().split('T')[0] : '');
        } catch (error) {
            console.error('Failed to fetch company details:', error);
            showMessage({ message: 'Failed to load company details.', success: false });
            navigate('/admin/companies'); // Redirect if company not found or error
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (companyId) {
                const updatePayload: any = { companyName, contactEmail, isActive };
                
                // Only SUPER-ADMIN can update subscription dates
                if (isSuperAdmin) {
                    if (subscriptionStartDate) {
                        updatePayload.subscriptionStartDate = subscriptionStartDate;
                    }
                    if (subscriptionEndDate) {
                        updatePayload.subscriptionEndDate = subscriptionEndDate;
                    }
                }
                
                const response: ApiResponse = await updateCompanyApi(companyId, updatePayload);
                if (response.success) {
                    showMessage({ message: response.message, success: true });
                    navigate('/admin/companies');
                } else {
                    showMessage({ message: response.message, success: false });
                }
            }
        } catch (error: any) {
            console.error('Company update error:', error);
            showMessage({ message: error.response?.data?.message || 'An error occurred during update.', success: false });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="panel">
                <div className="flex justify-center items-center">
                    <span className="animate-spin border-[3px] border-success border-l-transparent rounded-full w-6 h-6 inline-block"></span>
                    <span className="ltr:ml-2 rtl:mr-2">Loading Company Details...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="panel">
            <h2 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl mb-5">Edit Company</h2>
            <form className="space-y-5 dark:text-white" onSubmit={handleUpdate}>
                <div>
                    <label htmlFor="companyName">Company Name</label>
                    <div className="relative text-white-dark">
                        <input
                            id="companyName"
                            type="text"
                            placeholder="Enter Company Name"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="form-input ps-10 placeholder:text-white-dark" />
                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                            <IconBolt fill={true} />
                        </span>
                    </div>
                </div>
                <div>
                    <label htmlFor="contactEmail">Contact Email</label>
                    <div className="relative text-white-dark">
                        <input
                            id="contactEmail"
                            type="email"
                            placeholder="Enter Contact Email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            className="form-input ps-10 placeholder:text-white-dark" />
                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                            <IconMail fill={true} />
                        </span>
                    </div>
                </div>

                <div>
                    <label htmlFor="isActive">Active</label>
                    <input
                        id="isActive"
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="form-checkbox ml-2"
                    />
                </div>

                {isSuperAdmin && (
                    <>
                        <div>
                            <label htmlFor="subscriptionStartDate" className="flex items-center gap-2">
                                <IconCalendar className="w-5 h-5" />
                                Subscription Start Date
                            </label>
                            <input
                                id="subscriptionStartDate"
                                type="date"
                                value={subscriptionStartDate}
                                onChange={(e) => setSubscriptionStartDate(e.target.value)}
                                className="form-input"
                            />
                        </div>

                        <div>
                            <label htmlFor="subscriptionEndDate" className="flex items-center gap-2">
                                <IconCalendar className="w-5 h-5" />
                                Subscription End Date
                            </label>
                            <input
                                id="subscriptionEndDate"
                                type="date"
                                value={subscriptionEndDate}
                                onChange={(e) => setSubscriptionEndDate(e.target.value)}
                                className="form-input"
                            />
                        </div>
                    </>
                )}

                {!isSuperAdmin && (
                    <>
                        <div>
                            <label htmlFor="subscriptionStartDate">Subscription Start Date</label>
                            <input
                                id="subscriptionStartDate"
                                type="text"
                                value={subscriptionStartDate ? new Date(subscriptionStartDate).toLocaleDateString() : 'N/A'}
                                className="form-input"
                                disabled
                            />
                        </div>

                        <div>
                            <label htmlFor="subscriptionEndDate">Subscription End Date</label>
                            <input
                                id="subscriptionEndDate"
                                type="text"
                                value={subscriptionEndDate ? new Date(subscriptionEndDate).toLocaleDateString() : 'N/A'}
                                className="form-input"
                                disabled
                            />
                        </div>
                    </>
                )}

                <button type="submit" className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]">
                    Update Company
                </button>
            </form>
        </div>
    );
};

export default EditCompany;
