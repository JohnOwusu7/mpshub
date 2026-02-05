import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { IRootState } from '../../store';
import { useEffect, useState } from 'react';
import { setPageTitle } from '../../store/themeConfigSlice';
import Swal from 'sweetalert2';
import IconMail from '../../components/Icon/IconMail';
import IconSend from '../../components/Icon/IconSend';
import IconUser from '../../components/Icon/IconUser';
import IconSettings from '../../components/Icon/IconSettings';
import IconMenuUsers from '../../components/Icon/Menu/IconMenuUsers';
import IconMenuDashboard from '../../components/Icon/Menu/IconMenuDashboard';
import { sendMaintenanceEmail, sendReadyEmail } from '../../Api/api';

const Settings = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: IRootState) => state.user.user);
    const [sendingMaintenance, setSendingMaintenance] = useState(false);
    const [sendingReady, setSendingReady] = useState(false);

    useEffect(() => {
        dispatch(setPageTitle('Settings'));
    }, [dispatch]);

    const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
        const toast = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'toast' },
        });
        toast.fire({ icon: type, title: msg, padding: '10px 20px' });
    };

    const handleSendMaintenance = async () => {
        setSendingMaintenance(true);
        try {
            const res = await sendMaintenanceEmail();
            showMessage(res.message || 'Maintenance email sent to all company users.');
        } catch (err: any) {
            showMessage(err.response?.data?.error || 'Failed to send maintenance email.', 'error');
        } finally {
            setSendingMaintenance(false);
        }
    };

    const handleSendReady = async () => {
        setSendingReady(true);
        try {
            const res = await sendReadyEmail();
            showMessage(res.message || 'Ready email sent to all company users.');
        } catch (err: any) {
            showMessage(err.response?.data?.error || 'Failed to send ready email.', 'error');
        } finally {
            setSendingReady(false);
        }
    };

    const isAdmin = user?.roleName === 'SUPER-ADMIN' || user?.roleName === 'ADMIN';

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <ul className="flex flex-wrap items-center gap-2 text-sm">
                <li>
                    <Link to="/dashboard/my" className="text-primary hover:underline">
                        Home
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 text-gray-500 dark:text-gray-400">
                    Settings
                </li>
            </ul>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Email notifications – only for admins */}
                {isAdmin && (
                    <div className="panel">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <IconMail className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Email notifications</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Send system emails to all users in your company.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <button
                                type="button"
                                className="btn btn-danger w-full justify-center gap-2"
                                onClick={handleSendMaintenance}
                                disabled={sendingMaintenance}
                            >
                                <IconSend className="w-4 h-4" />
                                {sendingMaintenance ? 'Sending…' : 'Send email for maintenance'}
                            </button>
                            <button
                                type="button"
                                className="btn btn-success w-full justify-center gap-2"
                                onClick={handleSendReady}
                                disabled={sendingReady}
                            >
                                <IconSend className="w-4 h-4" />
                                {sendingReady ? 'Sending…' : 'Send email for app ready'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Quick links */}
                <div className="panel">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-info/10 text-info">
                            <IconSettings className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Quick links</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Profile and management pages.
                            </p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Link
                            to="/users/profile"
                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                            <IconUser className="w-5 h-5 text-primary" />
                            <span>My profile</span>
                        </Link>
                        {isAdmin && (
                            <>
                                <Link
                                    to="/users/list"
                                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    <IconMenuUsers className="w-5 h-5 text-primary" />
                                    <span>User management</span>
                                </Link>
                                <Link
                                    to="/admin/roles"
                                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    <IconSettings className="w-5 h-5 text-primary" />
                                    <span>Roles management</span>
                                </Link>
                            </>
                        )}
                        <Link
                            to="/dashboard/my"
                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                            <IconMenuDashboard className="w-5 h-5 text-primary" />
                            <span>My dashboard</span>
                        </Link>
                    </div>
                </div>
            </div>

            {!isAdmin && (
                <div className="panel border border-gray-200 dark:border-white/10">
                    <p className="text-gray-500 dark:text-gray-400">
                        Email broadcast options are available only to company administrators. Use the links above to manage your profile and access your dashboard.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Settings;
