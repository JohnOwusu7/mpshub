import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { setPageTitle } from '../../store/themeConfigSlice';
import { Link } from 'react-router-dom';
import IconPlus from '../../components/Icon/IconPlus';
import IconEye from '../../components/Icon/IconEye';
import IconSquareCheck from '../../components/Icon/IconSquareCheck';
import CreateTicketModal from '../../components/CreateTicketModal';
import axiosInstance from '../../Api/axiosInstance';
import { API_CONFIG } from '../../Api/apiConfig';

// Glowing count badge for quick-action buttons
const CountBadge: React.FC<{ count: number; variant?: 'info' | 'warning' }> = ({ count, variant = 'info' }) => {
    if (count <= 0) return null;
    const isWarning = variant === 'warning';
    return (
        <span
            className={`
                inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full text-xs font-bold text-white
                shadow-lg animate-pulse
                ${isWarning ? 'bg-warning shadow-warning/50 ring-2 ring-warning/40' : 'bg-info shadow-info/50 ring-2 ring-info/40'}
            `}
        >
            {count > 99 ? '99+' : count}
        </span>
    );
};

const OperatorDashboard: React.FC = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: IRootState) => state.user.user);
    const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
    const [unassignedCount, setUnassignedCount] = useState(0);
    const [myIncompleteCount, setMyIncompleteCount] = useState(0);

    useEffect(() => {
        dispatch(setPageTitle('Dashboard'));
    }, [dispatch]);

    useEffect(() => {
        if (!user?._id) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await axiosInstance.get(API_CONFIG.issues.endpoints.list);
                const issues: any[] = res.data || [];
                const userSubId = user?.subsectionId != null
                    ? String(typeof user.subsectionId === 'object' && (user.subsectionId as any)?._id != null ? (user.subsectionId as any)._id : user.subsectionId)
                    : (typeof localStorage !== 'undefined' ? localStorage.getItem('subsectionId') : null);
                const unassigned = issues.filter((i: any) => {
                    if (i.isComplete) return false;
                    const at = i.assignedTo;
                    const sub = i.assignedToSubsectionId;
                    const atId = at ? (typeof at === 'string' ? at : at?._id) : null;
                    const subId = sub ? (typeof sub === 'string' ? sub : sub?._id) : null;
                    return !atId && !subId;
                });
                const myIncomplete = issues.filter((i: any) => {
                    if (i.isComplete) return false;
                    const at = i.assignedTo;
                    const sub = i.assignedToSubsectionId;
                    const atId = at ? (typeof at === 'string' ? at : at?._id) : null;
                    const subId = sub ? (typeof sub === 'string' ? sub : sub?._id) : null;
                    if (atId && String(atId) === String(user?._id)) return true;
                    if (subId && userSubId && String(subId) === userSubId) return true;
                    return false;
                });
                if (!cancelled) {
                    setUnassignedCount(unassigned.length);
                    setMyIncompleteCount(myIncomplete.length);
                }
            } catch {
                if (!cancelled) {
                    setUnassignedCount(0);
                    setMyIncompleteCount(0);
                }
            }
        })();
        return () => { cancelled = true; };
    }, [user?._id, user?.subsectionId]);

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-semibold">Welcome back, {user?.firstName}!</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Use the quick actions below to report and process issues.
                    </p>
                </div>
                <button type="button" className="btn btn-primary" onClick={() => setShowCreateTicketModal(true)}>
                    <IconPlus className="w-5 h-5 mr-2" />
                    Create New Issue
                </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="panel">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-semibold text-lg">Quick Actions</h5>
                    </div>
                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={() => setShowCreateTicketModal(true)}
                            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full text-left"
                        >
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <IconPlus className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold">Create New Issue</p>
                                <p className="text-sm text-gray-500">Report a new issue or problem</p>
                            </div>
                        </button>

                        <Link
                            to="/my-issues"
                            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group relative"
                        >
                            <div className="p-2 bg-info/10 rounded-lg shrink-0">
                                <IconEye className="w-5 h-5 text-info" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold">My Assigned Issues</p>
                                <p className="text-sm text-gray-500">View and process issues assigned to you</p>
                            </div>
                            <CountBadge count={myIncompleteCount} variant="info" />
                        </Link>

                        {user?.permissions?.includes('issue:assign') && (
                            <Link
                                to="/activity"
                                className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group relative"
                            >
                                <div className="p-2 bg-warning/10 rounded-lg shrink-0">
                                    <IconSquareCheck className="w-5 h-5 text-warning" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold">Activity Hub</p>
                                    <p className="text-sm text-gray-500">Manage and assign issues</p>
                                </div>
                                <CountBadge count={unassignedCount} variant="warning" />
                            </Link>
                        )}
                    </div>
                </div>

                <div className="panel">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-semibold text-lg">Tips</h5>
                    </div>
                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li>
                            Use <span className="font-semibold">My Assigned Issues</span> to
                            see analytics and manage your personal work queue.
                        </li>
                        <li>
                            Use <span className="font-semibold">Activity Hub</span> if you have
                            permissions to assign or reassign issues within your section.
                        </li>
                        <li>
                            Keep issue titles and locations clear so your team can quickly
                            understand where to act.
                        </li>
                    </ul>
                </div>
            </div>
            <CreateTicketModal
                open={showCreateTicketModal}
                onClose={() => setShowCreateTicketModal(false)}
            />
        </div>
    );
};

export default OperatorDashboard;

