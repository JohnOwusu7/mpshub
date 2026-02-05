import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconMail from '../../components/Icon/IconMail';
import IconLockDots from '../../components/Icon/IconLockDots';
import IconUser from '../../components/Icon/IconUser';
import IconPhone from '../../components/Icon/IconPhone';
import IconBolt from '../../components/Icon/IconBolt';
import showMessage from '../../components/Alerts/showMessage';
import { hideLoading, showLoading } from '../../store/features/alertSlice';
import axios from 'axios';
import { API_CONFIG } from '../../Api/apiConfig';

const RegisterCompany: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [companyName, setCompanyName] = useState('');
    const [adminFirstName, setAdminFirstName] = useState('');
    const [adminLastName, setAdminLastName] = useState('');
    const [adminIdentityNo, setAdminIdentityNo] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPhone, setAdminPhone] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [adminPosition, setAdminPosition] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        dispatch(setPageTitle('Register Company'));
    }, [dispatch]);

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        dispatch(showLoading());

        try {
            const response = await axios.post(`${API_CONFIG.baseURL}/register-company`, {
                companyName,
                adminFirstName,
                adminLastName,
                adminIdentityNo,
                adminEmail,
                adminPhone,
                adminPassword,
                adminPosition,
            });

            if (response.data.success) {
                showMessage({ message: response.data.message, success: true });
                navigate('/admin/companies'); // Redirect to Companies List after successful registration
            } else {
                showMessage({ message: response.data.message, success: false });
            }
        } catch (error: any) {
            console.error('Company registration error:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            
            // Show more detailed error message
            let errorMessage = 'An error occurred during registration.';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            showMessage({ message: errorMessage, success: false });
        } finally {
            setLoading(false);
            dispatch(hideLoading());
        }
    };

    return (
        <div className="panel">
            <div className="mb-5">
                <h2 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">Register New Company</h2>
                <p className="text-base font-bold leading-normal text-white-dark">Provide company details and the initial admin user information for this company.</p>
            </div>
            <form className="space-y-5 dark:text-white" onSubmit={handleRegister}>
                {/* Company Name */}
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

                {/* Admin First Name */}
                <div>
                    <label htmlFor="adminFirstName">Admin First Name</label>
                    <div className="relative text-white-dark">
                        <input
                            id="adminFirstName"
                            type="text"
                            placeholder="Enter Admin First Name"
                            value={adminFirstName}
                            onChange={(e) => setAdminFirstName(e.target.value)}
                            className="form-input ps-10 placeholder:text-white-dark" />
                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                            <IconUser fill={true} />
                        </span>
                    </div>
                </div>

                {/* Admin Last Name */}
                <div>
                    <label htmlFor="adminLastName">Admin Last Name</label>
                    <div className="relative text-white-dark">
                        <input
                            id="adminLastName"
                            type="text"
                            placeholder="Enter Admin Last Name"
                            value={adminLastName}
                            onChange={(e) => setAdminLastName(e.target.value)}
                            className="form-input ps-10 placeholder:text-white-dark" />
                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                            <IconUser fill={true} />
                        </span>
                    </div>
                </div>

                {/* Admin Employee ID */}
                <div>
                    <label htmlFor="adminIdentityNo">Admin Employee ID</label>
                    <div className="relative text-white-dark">
                        <input
                            id="adminIdentityNo"
                            type="text"
                            placeholder="Enter Admin Employee ID"
                            value={adminIdentityNo}
                            onChange={(e) => setAdminIdentityNo(e.target.value)}
                            className="form-input ps-10 placeholder:text-white-dark" />
                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                            <IconUser fill={true} />
                        </span>
                    </div>
                </div>

                {/* Admin Email */}
                <div>
                    <label htmlFor="adminEmail">Admin Email</label>
                    <div className="relative text-white-dark">
                        <input
                            id="adminEmail"
                            type="email"
                            placeholder="Enter Admin Email"
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
                            className="form-input ps-10 placeholder:text-white-dark" />
                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                            <IconMail fill={true} />
                        </span>
                    </div>
                </div>

                {/* Admin Phone */}
                <div>
                    <label htmlFor="adminPhone">Admin Phone</label>
                    <div className="relative text-white-dark">
                        <input
                            id="adminPhone"
                            type="text"
                            placeholder="Enter Admin Phone Number"
                            value={adminPhone}
                            onChange={(e) => setAdminPhone(e.target.value)}
                            className="form-input ps-10 placeholder:text-white-dark" />
                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                            <IconPhone fill={true} />
                        </span>
                    </div>
                </div>

                {/* Admin Position */}
                <div>
                    <label htmlFor="adminPosition">Admin Position</label>
                    <div className="relative text-white-dark">
                        <input
                            id="adminPosition"
                            type="text"
                            placeholder="Enter Admin Position"
                            value={adminPosition}
                            onChange={(e) => setAdminPosition(e.target.value)}
                            className="form-input ps-10 placeholder:text-white-dark" />
                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                            <IconUser fill={true} />
                        </span>
                    </div>
                </div>

                {/* Admin Password */}
                <div>
                    <label htmlFor="adminPassword">Admin Password</label>
                    <div className="relative text-white-dark">
                        <input
                            id="adminPassword"
                            type="password"
                            placeholder="Enter Admin Password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            className="form-input ps-10 placeholder:text-white-dark" />
                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                            <IconLockDots fill={true} />
                        </span>
                    </div>
                </div>

                <button type="submit" className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]">
                    {loading ? <span className="animate-spin border-[3px] border-success border-l-transparent rounded-full w-6 h-6 inline-block align-middle m-auto mb-10"></span> : 'Register Company'}
                </button>
            </form>
        </div>
    );
};

export default RegisterCompany;
