import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { setPageTitle } from '../../store/themeConfigSlice';
import { logout } from '../../store/userSlice';
import IconAlertTriangle from '../../components/Icon/IconInfoTriangle';
import IconCalendar from '../../components/Icon/IconCalendar';
import IconBuilding from '../../components/Icon/IconBuilding';

const SubscriptionExpired: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get subscription info from location state or localStorage
    const subscriptionInfo = location.state || {
        subscriptionEndDate: localStorage.getItem('subscriptionEndDate'),
        daysExpired: localStorage.getItem('daysExpired'),
        companyName: localStorage.getItem('companyName'),
    };

    useEffect(() => {
        dispatch(setPageTitle('Subscription Expired'));
        // Clear user session
        dispatch(logout());
    }, [dispatch]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/auth');
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="w-full max-w-md">
                <div className="panel text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="rounded-full bg-danger/10 p-6">
                            <IconAlertTriangle className="w-16 h-16 text-danger" />
                        </div>
                    </div>

                    <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
                        Subscription Expired
                    </h1>

                    <p className="mb-6 text-gray-600 dark:text-gray-400">
                        Your company subscription has expired. Please renew your subscription to continue accessing the system.
                    </p>

                    {subscriptionInfo.companyName && (
                        <div className="mb-4 flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300">
                            <IconBuilding className="w-5 h-5" />
                            <span className="font-semibold">{subscriptionInfo.companyName}</span>
                        </div>
                    )}

                    {subscriptionInfo.subscriptionEndDate && (
                        <div className="mb-4 flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300">
                            <IconCalendar className="w-5 h-5" />
                            <span>
                                Expired on: {new Date(subscriptionInfo.subscriptionEndDate).toLocaleDateString()}
                            </span>
                        </div>
                    )}

                    {subscriptionInfo.daysExpired && (
                        <div className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                            Subscription expired {subscriptionInfo.daysExpired} day(s) ago
                        </div>
                    )}

                    <div className="mb-6 rounded-lg bg-warning/10 p-4 text-left">
                        <h3 className="mb-2 font-semibold text-warning">What to do next?</h3>
                        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-600 dark:text-gray-400">
                            <li>Contact your Super Admin to process payment</li>
                            <li>Once payment is confirmed, your subscription will be renewed</li>
                            <li>You will regain access to the system automatically</li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="btn btn-primary w-full"
                        >
                            Return to Login
                        </button>
                    </div>

                    <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
                        Need assistance? Contact support at{' '}
                        <a href="mailto:qaredadev@gmail.com" className="text-primary hover:underline">
                            qaredadev@gmail.com
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionExpired;

