import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { setPageTitle } from '../../store/themeConfigSlice';
import { useEffect, useState, FormEvent } from 'react';
import IconCoffee from '../../components/Icon/IconCoffee';
import IconMail from '../../components/Icon/IconMail';
import IconPhone from '../../components/Icon/IconPhone';
import IconUser from '../../components/Icon/IconUser';
import IconBuilding from '../../components/Icon/IconBuilding';
import IconCalendar from '../../components/Icon/IconCalendar';
import IconInfoCircle from '../../components/Icon/IconInfoCircle';
import IconPencilPaper from '../../components/Icon/IconPencilPaper';
import IconLogin from '../../components/Icon/IconLogin';
import IconLock from '../../components/Icon/IconLock';
import { Company, getCompanyByIdApi, changePassword } from '../../Api/api';
import Swal from 'sweetalert2';

const Profile = () => {
    const dispatch = useDispatch();
    const authenticatedUser = useSelector((state: IRootState) => state.user.user);
    const user = authenticatedUser || { firstName: 'Guest', lastName: '', email: '', identityNo: '', roleName: '', phone: '', companyId: '', position: '', department: undefined, section: undefined, subsection: undefined };

    const [companyInfo, setCompanyInfo] = useState<Company | null>(null);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    useEffect(() => {
        dispatch(setPageTitle('Profile'));
        if ((user.roleName === 'ADMIN' || user.roleName === 'SUPER-ADMIN') && user.companyId) {
            fetchCompanyDetails(user.companyId);
        }
    }, [dispatch, user.roleName, user.companyId]);

    const fetchCompanyDetails = async (companyId: string) => {
        try {
            const data = await getCompanyByIdApi(companyId);
            setCompanyInfo(data);
        } catch (error: any) {
            if (error.response?.status === 403) {
                setCompanyInfo(null);
            } else if (error.response?.status !== 403) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load company details.' });
            }
        }
    };

    const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmPassword) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'All password fields are required.' });
            return;
        }
        if (newPassword !== confirmPassword) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'New password and confirm password do not match.' });
            return;
        }
        if (newPassword.length < 6) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'New password must be at least 6 characters.' });
            return;
        }
        setPasswordLoading(true);
        try {
            const response = await changePassword({ currentPassword, newPassword });
            if (response.success) {
                Swal.fire({ icon: 'success', title: 'Success', text: response.message || 'Password changed successfully!' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setShowPasswordForm(false);
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: response.message || 'Failed to change password.' });
            }
        } catch (err: any) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.error || 'An unexpected error occurred.' });
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <ul className="flex space-x-2 rtl:space-x-reverse text-sm">
                <li><Link to="/dashboard/my" className="text-primary hover:underline">Home</Link></li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 text-gray-500 dark:text-gray-400">Profile</li>
            </ul>

            {/* Hero header - gradient and avatar */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 p-8 md:p-10 text-white shadow-2xl">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ij48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTItNCAyLTQgMiAyIDIgNCAyIDQgMiAyIDQgMnM0LTIgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                    <div className="ring-4 ring-white/30 rounded-full p-1 bg-white/20 backdrop-blur-sm shrink-0">
                        <img src="/assets/images/auth/profile.png" alt="" className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover" />
                    </div>
                    <div className="text-center sm:text-left">
                        <h1 className="text-2xl md:text-3xl font-bold mb-1">{user.firstName} {user.lastName}</h1>
                        <p className="text-white/90 text-sm md:text-base">{user.position || 'Team member'}</p>
                        <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm border border-white/30">
                            {user.roleName}
                        </span>
                        {(user as any).department?.name && (
                            <p className="text-white/80 text-sm mt-2">{(user as any).department.name}{(user as any).section?.name ? ` · ${(user as any).section.name}` : ''}</p>
                        )}
                        <Link
                            to="/users/profile-settings"
                            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 border border-white/30 text-sm font-medium transition-colors"
                        >
                            <IconPencilPaper className="w-4 h-4" /> Edit Profile
                        </Link>
                    </div>
                </div>
            </div>

            {/* Cards grid - colourful sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Details - emerald theme */}
                <div className="rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 rounded-xl bg-emerald-500/20">
                            <IconUser className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Personal Details</h2>
                    </div>
                    <div className="space-y-3 text-gray-700 dark:text-gray-300">
                        <p className="flex items-center gap-2"><span className="font-medium text-gray-500 dark:text-gray-400 w-28">Name</span> {user.firstName} {user.lastName}</p>
                        <p className="flex items-center gap-2"><span className="font-medium text-gray-500 dark:text-gray-400 w-28">Employee ID</span> {user.identityNo}</p>
                        <p className="flex items-center gap-2"><IconCoffee className="w-4 h-4 text-emerald-500 shrink-0" /><span className="font-medium text-gray-500 dark:text-gray-400 w-28">Position</span> {user.position || '—'}</p>
                    </div>
                </div>

                {/* Contact - sky blue theme */}
                <div className="rounded-2xl border-2 border-sky-200 dark:border-sky-800 bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-950/40 dark:to-indigo-950/40 p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 rounded-xl bg-sky-500/20">
                            <IconMail className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Contact</h2>
                    </div>
                    <div className="space-y-3 text-gray-700 dark:text-gray-300">
                        <p className="flex items-center gap-2"><IconMail className="w-4 h-4 text-sky-500 shrink-0" /><span className="font-medium text-gray-500 dark:text-gray-400 w-20">Email</span> <a href={`mailto:${user.email}`} className="text-sky-600 dark:text-sky-400 hover:underline truncate">{user.email}</a></p>
                        <p className="flex items-center gap-2"><IconPhone className="w-4 h-4 text-sky-500 shrink-0" /><span className="font-medium text-gray-500 dark:text-gray-400 w-20">Phone</span> <span dir="ltr">{user.phone}</span></p>
                    </div>
                </div>

                {/* Company Details (admin) - amber theme */}
                {(user.roleName === 'ADMIN' || user.roleName === 'SUPER-ADMIN') && companyInfo && (
                    <div className="rounded-2xl border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 p-6 shadow-lg lg:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl bg-amber-500/20">
                                <IconBuilding className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Company Details</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700 dark:text-gray-300">
                            <p className="flex items-center gap-2"><IconBuilding className="w-4 h-4 text-amber-500 shrink-0" /> <span className="font-medium">Company</span> {companyInfo.companyName}</p>
                            <p className="flex items-center gap-2"><IconMail className="w-4 h-4 text-amber-500 shrink-0" /> <span className="font-medium">Contact</span> {companyInfo.contactEmail}</p>
                            <p className="flex items-center gap-2"><IconInfoCircle className="w-4 h-4 text-amber-500 shrink-0" /> <span className="font-medium">Status</span> {companyInfo.isActive ? 'Active' : 'Inactive'}</p>
                            <p className="flex items-center gap-2"><IconCalendar className="w-4 h-4 text-amber-500 shrink-0" /> <span className="font-medium">Subscription</span> {companyInfo.subscriptionEndDate ? new Date(companyInfo.subscriptionEndDate).toLocaleDateString() : '—'}</p>
                        </div>
                    </div>
                )}

                {/* Change Password - violet theme */}
                <div className="rounded-2xl border-2 border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/40 p-6 shadow-lg lg:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 rounded-xl bg-violet-500/20">
                            <IconLock className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Change Password</h2>
                    </div>
                    {!showPasswordForm ? (
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Keep your account secure. Update your password here.</p>
                    ) : null}
                    {showPasswordForm ? (
                        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current password</label>
                                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" className="form-input rounded-lg border-violet-200 dark:border-violet-700 focus:ring-violet-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New password</label>
                                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" className="form-input rounded-lg border-violet-200 dark:border-violet-700 focus:ring-violet-500" required minLength={6} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm new password</label>
                                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="form-input rounded-lg border-violet-200 dark:border-violet-700 focus:ring-violet-500" required />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button type="submit" disabled={passwordLoading} className="btn bg-violet-600 hover:bg-violet-700 text-white border-0">
                                    {passwordLoading ? 'Updating...' : (<> <IconLogin className="w-4 h-4 mr-2" /> Update password</>)}
                                </button>
                                <button type="button" onClick={() => { setShowPasswordForm(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }} className="btn btn-outline-secondary">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <button type="button" onClick={() => setShowPasswordForm(true)} className="btn bg-violet-600 hover:bg-violet-700 text-white border-0">
                            <IconLock className="w-4 h-4 mr-2" /> Change password
                        </button>
                    )}
                </div>

                {/* Quick links - rose theme */}
                <div className="rounded-2xl border-2 border-rose-200 dark:border-rose-800 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/40 p-6 shadow-lg lg:col-span-2">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Account</h2>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/users/profile-settings" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700 transition-colors">
                            <IconPencilPaper className="w-4 h-4" /> Edit profile
                        </Link>
                        {['ADMIN', 'MANAGER'].includes(user.roleName || '') && user.companyId && (
                            <Link to="/users/subscription-status" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700 transition-colors">
                                <IconCalendar className="w-4 h-4" /> Subscription
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
