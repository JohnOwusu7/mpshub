import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconMail from '../../components/Icon/IconMail';
import IconLock from '../../components/Icon/IconLock';
import { forgotPassword } from '../../Api/api';
import showMessage from '../../components/Alerts/showMessage';

const RequestPassword = () => {
    const dispatch = useDispatch();
    const [identityNo, setIdentityNo] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    useEffect(() => {
        dispatch(setPageTitle('Forgot Password'));
    }, [dispatch]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!identityNo?.trim()) {
            showMessage({ message: 'Please enter your ID.', success: false });
            return;
        }
        setLoading(true);
        setSent(false);
        try {
            const res = await forgotPassword(identityNo.trim());
            if (res.success) {
                setSent(true);
                showMessage({ message: res.message || 'Check your email for a temporary password.', success: true });
            } else {
                showMessage({ message: res.message || 'Something went wrong.', success: false });
            }
        } catch (err: any) {
            showMessage({
                message: err.response?.data?.message || 'Failed to send. Please try again.',
                success: false,
            });
        } finally {
            setLoading(false);
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
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/25 mb-4">
                            <IconLock className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Forgot password?</h1>
                        <p className="text-gray-600 text-sm">Enter your <strong className="text-gray-800">Employee ID</strong>. We’ll send a temporary password to your registered email.</p>
                    </div>

                    {sent ? (
                        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center">
                            <p className="text-emerald-800 text-sm font-medium mb-4">If an account exists with this ID, a temporary password has been sent to your email.</p>
                            <Link to="/auth" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-medium hover:opacity-90 transition-opacity">
                                Back to login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="identityNo" className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
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
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 text-white font-semibold shadow-lg hover:opacity-95 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send temporary password'}
                            </button>
                        </form>
                    )}

                    <p className="mt-6 text-center">
                        <Link to="/auth" className="text-gray-600 hover:text-primary text-sm font-medium transition-colors">← Back to login</Link>
                    </p>
                </div>
                <p className="mt-6 text-center text-gray-500 text-xs">© {new Date().getFullYear()} MineSphere. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default RequestPassword;
