import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconMail from '../../components/Icon/IconMail';
import IconLockDots from '../../components/Icon/IconLockDots';
import { login } from '../../store/userSlice';
import showMessage from '../../components/Alerts/showMessage';
import { hideLoading, showLoading } from '../../store/features/alertSlice';
import { IRootState, AppDispatch } from '../../store';
import { unwrapResult } from '@reduxjs/toolkit';

const Login = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [identityNo, setIdentityNo] = useState('');
    const [password, setPassword] = useState('');

    const { loading } = useSelector((state: IRootState) => state.user);

    useEffect(() => {
        dispatch(setPageTitle('Login'));
    }, [dispatch]);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            dispatch(showLoading());
            const response = await dispatch(login({ identityNo, password }));
            const result = unwrapResult(response);

            if (result.success) {
                dispatch(hideLoading());
                showMessage({ message: result.message, success: true });
                const userRole = result.user?.role;

                switch (userRole) {
                    case 'SUPER-ADMIN':
                        navigate('/');
                        break;
                    case 'ADMIN':
                    case 'MANAGER':
                        navigate('/');
                        break;
                    case 'SAFETY':
                        navigate('/safety/pjo');
                        break;
                    case 'DISPATCH':
                    case 'SYSTEMS-ENGINEER':
                    case 'AFRIYIE':
                    case 'RAMJACK':
                    case 'BENEWISE':
                        navigate('/dashboard');
                        break;
                    default:
                        navigate('/users/profile');
                }
            } else {
                dispatch(hideLoading());
                showMessage({ message: result.message, success: false });
            }
        } catch (error: any) {
            dispatch(hideLoading());
            const errorPayload = error.payload || error;

            if (errorPayload?.code === 'SUBSCRIPTION_EXPIRED' || errorPayload?.code === 'COMPANY_INACTIVE' || errorPayload?.code === 'SUBSCRIPTION_NOT_CONFIGURED') {
                if (errorPayload.subscriptionEndDate) localStorage.setItem('subscriptionEndDate', errorPayload.subscriptionEndDate);
                if (errorPayload.daysExpired) localStorage.setItem('daysExpired', String(errorPayload.daysExpired));
                if (errorPayload.companyName) localStorage.setItem('companyName', errorPayload.companyName);
                navigate('/auth/subscription-expired', { state: errorPayload });
                return;
            }
            if (error.response?.data?.code === 'SUBSCRIPTION_EXPIRED' || error.response?.data?.code === 'COMPANY_INACTIVE' || error.response?.data?.code === 'SUBSCRIPTION_NOT_CONFIGURED') {
                const d = error.response.data;
                if (d.subscriptionEndDate) localStorage.setItem('subscriptionEndDate', d.subscriptionEndDate);
                if (d.daysExpired) localStorage.setItem('daysExpired', String(d.daysExpired));
                if (d.companyName) localStorage.setItem('companyName', d.companyName);
                navigate('/auth/subscription-expired', { state: d });
                return;
            }

            const errorMessage = errorPayload?.message || error.response?.data?.message || error.message || 'Login failed. Please try again.';
            showMessage({ message: errorMessage, success: false });
        }
    };

    return (
        <div className="relative min-h-screen min-w-0 overflow-x-hidden">
            <div className="absolute inset-0 min-h-full min-w-full">
                <img src="/assets/images/auth/bg-gradient.png" alt="" className="h-full w-full min-h-full min-w-full object-cover object-center" />
            </div>
            <div className="relative flex min-h-screen min-w-0 items-center justify-center overflow-x-hidden overflow-y-auto bg-[url('/assets/images/auth/map.png')] bg-cover bg-center bg-no-repeat px-4 py-8 sm:px-6 sm:py-10 md:px-16 dark:bg-[#060818]">
                <img src="/assets/images/auth/smart.png" alt="" className="absolute left-0 top-2/3 hidden h-full max-h-[423px] -translate-y-1/2 md:block md:left-[5%]" />
                <img src="/assets/images/auth/truck3.png" alt="" className="absolute left-24 top-0 hidden h-[350px] md:block md:left-[5%]" />
                <img src="/assets/images/auth/coming-soon-object3.png" alt="" className="absolute right-0 top-0 hidden h-[300px] md:block" />
                <img src="/assets/images/auth/moving.png" alt="" className="absolute top-[48%] right-[5%] hidden md:block" />
                <div className="relative z-10 w-full max-w-md min-w-0 px-0 sm:px-2">
                <div className="rounded-2xl bg-white shadow-2xl border border-gray-100 p-6 sm:p-8 md:p-10">
                    <div className="flex flex-col items-center text-center mb-8">
                        <Link to="/" className="mb-4">
                            <img src="/minesphere.png" alt="MineSphere" className="h-12 w-auto" />
                        </Link>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
                        <p className="text-gray-600 text-sm">Sign in with your ID and password</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label htmlFor="identityNo" className="block text-sm font-medium text-gray-700 mb-2">ID</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <IconMail className="w-5 h-5" />
                                </span>
                                <input
                                    id="identityNo"
                                    type="text"
                                    placeholder="Enter your ID"
                                    value={identityNo}
                                    onChange={(e) => setIdentityNo(e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 bg-gray-50 pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    autoComplete="username"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <IconLockDots className="w-5 h-5" />
                                </span>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 bg-gray-50 pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    autoComplete="current-password"
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 text-white font-semibold shadow-lg hover:opacity-95 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign in'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-gray-600 text-sm">
                        Forgotten password?{' '}
                        <Link to="/auth/request-password" className="text-primary font-medium hover:underline">
                            Get temporary password
                        </Link>
                    </p>
                </div>
                <p className="mt-6 text-center text-gray-500 text-xs">© {new Date().getFullYear()} MineSphere. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
