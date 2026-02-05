import { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Swal from 'sweetalert2';
import { Dialog, Transition } from '@headlessui/react';
import 'react-quill/dist/quill.snow.css';
import Dropdown from '../../components/Dropdown';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconClipboardText from '../../components/Icon/IconClipboardText';
import IconListCheck from '../../components/Icon/IconListCheck';
import IconThumbUp from '../../components/Icon/IconThumbUp';
import IconSquareRotated from '../../components/Icon/IconSquareRotated';
import IconPlus from '../../components/Icon/IconPlus';
import IconSearch from '../../components/Icon/IconSearch';
import IconMenu from '../../components/Icon/IconMenu';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import IconX from '../../components/Icon/IconX';
import IconUser from '../../components/Icon/IconUser';
import { API_CONFIG } from '../../Api/apiConfig';
import axiosInstance from '../../Api/axiosInstance';
import { getAllDepartmentsApi, getAllSectionsByDepartmentApi, getAllSubsectionsBySectionApi } from '../../Api/api';
import CreateTicketModal from '../../components/CreateTicketModal';

const ActivityHub = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Activity Tracker'));
    });

    const defaultParams: any = {
        _id: null,
        title: '',
        description: '',
        descriptionText: '',
        assignee: '',
        reportedBy: '',
        tag: '',
        priority: 'low',
        heavyEquipmentId: '',
        issue: '',
        issueDesc: '',
        operator: '',

    };

    const [selectedTab, setSelectedTab] = useState('');
    const [isShowTaskMenu, setIsShowTaskMenu] = useState(false);
    const [viewTaskModal, setViewTaskModal] = useState(false);
    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultParams)));


    const [users, setUsers] = useState<any[]>([]);
    const [selectedAssignee, setSelectedAssignee] = useState<any>(null);
    const [allTasks, setAllTasks] = useState([]);
    const [loading, setLoading] = useState<boolean>(true);
    // Assignment: 'user' | 'subsection' | 'reassign'
    const [assignMode, setAssignMode] = useState<'user' | 'subsection' | 'reassign'>('user');
    const [subsections, setSubsections] = useState<any[]>([]);
    const [allSections, setAllSections] = useState<any[]>([]);
    const [selectedSubsection, setSelectedSubsection] = useState<any>(null);
    const [selectedReassignSection, setSelectedReassignSection] = useState<any>(null);
    const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);

    const fetchIssues = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(API_CONFIG.issues.endpoints.list);
            const data = response.data || [];
            setAllTasks(Array.isArray(data) ? data : []);
        } catch (error: any) {
            console.error('Error fetching issues:', error.message);
            setAllTasks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, []);


    const [filteredTasks, setFilteredTasks] = useState<any>(allTasks);
    const [pagedTasks, setPagedTasks] = useState<any>(filteredTasks);
    const [searchTask, setSearchTask] = useState<any>('');
    const [selectedTask, setSelectedTask] = useState<any>(defaultParams);
    const [isPriorityMenu] = useState<any>(null);
    const [isTagMenu] = useState<any>(null);

    const [pager] = useState<any>({
        currentPage: 1,
        totalPages: 0,
        pageSize: 14,
        startIndex: 0,
        endIndex: 0,
    });

    useEffect(() => {
        searchTasks();
    }, [selectedTab, searchTask, allTasks]);

    const searchTasks = (isResetPage = true) => {
        if (isResetPage) {
            pager.currentPage = 1;
        }
        let res: any[];
        if (selectedTab === 'complete') {
            res = allTasks.filter((d: any) => d.isComplete === true);
        } else if (selectedTab === 'unassigned') {
            res = allTasks.filter((d: any) => !d.isComplete && !d.assignedTo && !d.assignedToSubsectionId);
        } else if (selectedTab === 'high' || selectedTab === 'medium' || selectedTab === 'low') {
            res = allTasks.filter((d: any) => !d.isComplete && (d.priority || '').toLowerCase() === selectedTab);
        } else {
            res = allTasks.filter((d: any) => !d.isComplete);
        }
        const bySearch = res.filter((d: any) => (d.title || '').toLowerCase().includes((searchTask || '').toLowerCase()));
        setFilteredTasks([...bySearch]);
        getPager(bySearch);
    };

    const getPager = (res: any) => {
        setTimeout(() => {
            if (res.length) {
                pager.totalPages = pager.pageSize < 1 ? 1 : Math.ceil(res.length / pager.pageSize);
                if (pager.currentPage > pager.totalPages) {
                    pager.currentPage = 1;
                }
                pager.startIndex = (pager.currentPage - 1) * pager.pageSize;
                pager.endIndex = Math.min(pager.startIndex + pager.pageSize - 1, res.length - 1);
                setPagedTasks(res.slice(pager.startIndex, pager.endIndex + 1));
            } else {
                setPagedTasks([]);
                pager.startIndex = -1;
                pager.endIndex = -1;
            }
        });
    };

    const tabChanged = () => {
        setIsShowTaskMenu(false);
    };

    const taskComplete = async (task: any = null) => {
        try {
            await axiosInstance.put(`${API_CONFIG.issues.endpoints.completeProgress}/${task._id}`);
            showMessage('Task has been completed successfully.');
            fetchIssues();
        } catch (err: any) {
            showMessage(err?.response?.data?.error || 'Failed to complete task.', 'error');
        }
    };

    const viewTask = async (item: any = null) => {
        setSelectedTask(item);
        const current = item?.assignedTo;
        const sectionId = item?.sectionId?._id || item?.sectionId;
        setSelectedReassignSection(null);
        setAssignMode(item?.assignedTo ? 'user' : item?.assignedToSubsectionId ? 'subsection' : 'user');
        setViewTaskModal(true);
        // Fetch users in the issue's section for "Assign to person" dropdown (so FMS issue → FMS users only)
        try {
            const url = sectionId
                ? `${API_CONFIG.users.endpoints.list}?sectionId=${encodeURIComponent(sectionId)}`
                : API_CONFIG.users.endpoints.list;
            const response = await axiosInstance.get(url);
            const data = response.data?.data ?? response.data;
            const sectionUsers = Array.isArray(data) ? data : [];
            setUsers(sectionUsers);
            setSelectedAssignee(current ? (sectionUsers.find((u: any) => u._id === current._id) || current) : null);
        } catch {
            setUsers([]);
            setSelectedAssignee(null);
        }
        const sub = item?.assignedToSubsectionId;
        setSelectedSubsection(null);
        if (sectionId) {
            try {
                const subs = await getAllSubsectionsBySectionApi(sectionId);
                setSubsections(Array.isArray(subs) ? subs : []);
                if (sub) setSelectedSubsection((Array.isArray(subs) ? subs : []).find((s: any) => s._id === (sub._id || sub)));
            } catch {
                setSubsections([]);
            }
        } else {
            setSubsections([]);
        }
        try {
            const depts = await getAllDepartmentsApi();
            const sectionLists = await Promise.all((depts || []).map((d: any) => getAllSectionsByDepartmentApi(d._id)));
            const flat = (sectionLists || []).flat();
            setAllSections(flat);
        } catch {
            setAllSections([]);
        }
    };


    const assignTask = async () => {
        let body: { assignedToUserId?: string; assignedToSubsectionId?: string; reassignToSectionId?: string } = {};
        if (assignMode === 'user') {
            if (!selectedAssignee?._id) {
                showMessage('Please select a user.', 'error');
                return;
            }
            body.assignedToUserId = selectedAssignee._id;
        } else if (assignMode === 'subsection') {
            if (!selectedSubsection?._id) {
                showMessage('Please select a subsection.', 'error');
                return;
            }
            body.assignedToSubsectionId = selectedSubsection._id;
        } else {
            if (!selectedReassignSection?._id) {
                showMessage('Please select a section to reassign to.', 'error');
                return;
            }
            body.reassignToSectionId = selectedReassignSection._id;
        }
        setLoading(true);
        try {
            await axiosInstance.put(`${API_CONFIG.issues.endpoints.assign}/${selectedTask._id}`, body);
            setViewTaskModal(false);
            setSelectedAssignee(null);
            setSelectedSubsection(null);
            setSelectedReassignSection(null);
            showMessage(assignMode === 'reassign' ? 'Reassigned to section.' : 'Assigned successfully.');
            fetchIssues();
        } catch (error: any) {
            console.error('Error assigning task:', error);
            showMessage(error?.response?.data?.error || error?.response?.data?.message || 'Error assigning task.', 'error');
        } finally {
            setLoading(false);
        }
    };


    const showMessage = (msg = '', type = 'success') => {
        const toast: any = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'toast' },
        });
        toast.fire({
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    };

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    return (
        <div>
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="loader">Loading...</div>
                </div>
            ) : (
                <>
            <div className="flex gap-5 relative sm:h-[calc(100vh_-_150px)] h-full">
                <div
                    className={`panel p-4 flex-none w-[240px] max-w-full absolute xl:relative z-10 space-y-4 xl:h-auto h-full xl:block ltr:xl:rounded-r-md ltr:rounded-r-none rtl:xl:rounded-l-md rtl:rounded-l-none hidden ${
                        isShowTaskMenu && '!block'
                    }`}
                >
                    <div className="flex flex-col h-full pb-16">
                        <div className="pb-5">
                            <div className="flex text-center items-center">
                                <div className="shrink-0">
                                    <IconClipboardText />
                                </div>
                                <h3 className="text-lg font-semibold ltr:ml-3 rtl:mr-3">Activity Hub</h3>
                            </div>
                        </div>
                        <div className="h-px w-full border-b border-white-light dark:border-[#1b2e4b] mb-5"></div>
                        <PerfectScrollbar className="relative ltr:pr-3.5 rtl:pl-3.5 ltr:-mr-3.5 rtl:-ml-3.5 h-full grow">
                            <div className="space-y-1">
                                <button
                                    type="button"
                                    className={`w-full flex justify-between items-center p-2 hover:bg-white-dark/10 rounded-md dark:hover:text-primary hover:text-primary dark:hover:bg-[#181F32] font-medium h-10 ${
                                        selectedTab === '' ? 'bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]' : ''
                                    }`}
                                    onClick={() => {
                                        tabChanged();
                                        setSelectedTab('');
                                    }}
                                >
                                    <div className="flex items-center">
                                        <IconListCheck className="w-4.5 h-4.5 shrink-0" />
                                        <div className="ltr:ml-3 rtl:mr-3">Inbox</div>
                                    </div>
                                    <div className="bg-primary-light dark:bg-[#060818] rounded-md py-0.5 px-2 font-semibold whitespace-nowrap">
                                        {allTasks.filter((d: any) => !d.isComplete).length}
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    className={`w-full flex justify-between items-center p-2 hover:bg-white-dark/10 rounded-md dark:hover:text-primary hover:text-primary dark:hover:bg-[#181F32] font-medium h-10 ${
                                        selectedTab === 'unassigned' ? 'bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]' : ''
                                    }`}
                                    onClick={() => { tabChanged(); setSelectedTab('unassigned'); }}
                                >
                                    <div className="flex items-center">
                                        <IconUser className="w-4.5 h-4.5 shrink-0" />
                                        <div className="ltr:ml-3 rtl:mr-3">Unassigned</div>
                                    </div>
                                    <div className="bg-primary-light dark:bg-[#060818] rounded-md py-0.5 px-2 font-semibold whitespace-nowrap">
                                        {allTasks.filter((d: any) => !d.isComplete && !d.assignedTo && !d.assignedToSubsectionId).length}
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    className={`w-full flex justify-between items-center p-2 hover:bg-white-dark/10 rounded-md dark:hover:text-primary hover:text-primary dark:hover:bg-[#181F32] font-medium h-10 ${
                                        selectedTab === 'complete' ? 'bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]' : ''
                                    }`}
                                    onClick={() => { tabChanged(); setSelectedTab('complete'); }}
                                >
                                    <div className="flex items-center">
                                        <IconThumbUp className="w-5 h-5 shrink-0" />
                                        <div className="ltr:ml-3 rtl:mr-3">Done</div>
                                    </div>
                                    <div className="bg-primary-light dark:bg-[#060818] rounded-md py-0.5 px-2 font-semibold whitespace-nowrap">
                                        {allTasks.filter((d: any) => d.isComplete).length}
                                    </div>
                                </button>
                                <div className="h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>
                                <div className="text-white-dark px-1 py-3">Priority</div>
                                <button
                                    type="button"
                                    className={`w-full flex items-center h-10 p-1 hover:bg-white-dark/10 rounded-md dark:hover:text-primary hover:text-primary dark:hover:bg-[#181F32] font-medium text-danger ltr:hover:pl-3 rtl:hover:pr-3 duration-300 ${
                                        selectedTab === 'high' ? 'ltr:pl-3 rtl:pr-3 bg-gray-100 dark:bg-[#181F32]' : ''
                                    }`}
                                    onClick={() => { tabChanged(); setSelectedTab('high'); }}
                                >
                                    <IconSquareRotated className="fill-danger shrink-0" />
                                    <div className="ltr:ml-3 rtl:mr-3">High</div>
                                </button>
                                <button
                                    type="button"
                                    className={`w-full flex items-center h-10 p-1 hover:bg-white-dark/10 rounded-md dark:hover:text-primary hover:text-primary dark:hover:bg-[#181F32] font-medium text-primary ltr:hover:pl-3 rtl:hover:pr-3 duration-300 ${
                                        selectedTab === 'medium' ? 'ltr:pl-3 rtl:pr-3 bg-gray-100 dark:bg-[#181F32]' : ''
                                    }`}
                                    onClick={() => { tabChanged(); setSelectedTab('medium'); }}
                                >
                                    <IconSquareRotated className="fill-primary shrink-0" />
                                    <div className="ltr:ml-3 rtl:mr-3">Medium</div>
                                </button>
                                <button
                                    type="button"
                                    className={`w-full flex items-center h-10 p-1 hover:bg-white-dark/10 rounded-md dark:hover:text-primary hover:text-primary dark:hover:bg-[#181F32] font-medium text-warning ltr:hover:pl-3 rtl:hover:pr-3 duration-300 ${
                                        selectedTab === 'low' ? 'ltr:pl-3 rtl:pr-3 bg-gray-100 dark:bg-[#181F32]' : ''
                                    }`}
                                    onClick={() => { tabChanged(); setSelectedTab('low'); }}
                                >
                                    <IconSquareRotated className="fill-warning shrink-0" />
                                    <div className="ltr:ml-3 rtl:mr-3">Low</div>
                                </button>

                            </div>
                        </PerfectScrollbar>
                        <div className="ltr:left-0 rtl:right-0 absolute bottom-0 p-4 w-full">
                            <button className="btn btn-primary w-full" type="button" onClick={() => setShowCreateTicketModal(true)}>
                                <IconPlus className="ltr:mr-2 rtl:ml-2 shrink-0" />
                                Create ticket
                            </button>
                        </div>
                    </div>
                </div>
                <div className={`overlay bg-black/60 z-[5] w-full h-full rounded-md absolute hidden ${isShowTaskMenu && '!block xl:!hidden'}`} onClick={() => setIsShowTaskMenu(!isShowTaskMenu)}></div>
                <div className="panel p-0 flex-1 overflow-auto h-full">
                    <div className="flex flex-col h-full">
                        <div className="p-4 flex sm:flex-row flex-col w-full sm:items-center gap-4">
                            <div className="ltr:mr-3 rtl:ml-3 flex items-center">
                                <button type="button" className="xl:hidden hover:text-primary block ltr:mr-3 rtl:ml-3" onClick={() => setIsShowTaskMenu(!isShowTaskMenu)}>
                                    <IconMenu />
                                </button>
                                <div className="relative group flex-1">
                                    <input
                                        type="text"
                                        className="form-input peer ltr:!pr-10 rtl:!pl-10"
                                        placeholder="Search..."
                                        value={searchTask}
                                        onChange={(e) => setSearchTask(e.target.value)}
                                        onKeyUp={() => searchTasks()}
                                    />
                                    <div className="absolute ltr:right-[11px] rtl:left-[11px] top-1/2 -translate-y-1/2 peer-focus:text-primary">
                                        <IconSearch />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-center sm:justify-end sm:flex-auto flex-1">
                                <p className="ltr:mr-3 rtl:ml-3">{pager.startIndex + 1 + '-' + (pager.endIndex + 1) + ' of ' + filteredTasks.length}</p>
                                <button
                                    type="button"
                                    disabled={pager.currentPage === 1}
                                    className="bg-[#f4f4f4] rounded-md p-1 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30 ltr:mr-3 rtl:ml-3 disabled:opacity-60 disabled:cursor-not-allowed"
                                    onClick={() => {
                                        pager.currentPage--;
                                        searchTasks(false);
                                    }}
                                >
                                    <IconCaretDown className="w-5 h-5 rtl:-rotate-90 rotate-90" />
                                </button>
                                <button
                                    type="button"
                                    disabled={pager.currentPage === pager.totalPages}
                                    className="bg-[#f4f4f4] rounded-md p-1 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30 disabled:opacity-60 disabled:cursor-not-allowed"
                                    onClick={() => {
                                        pager.currentPage++;
                                        searchTasks(false);
                                    }}
                                >
                                    <IconCaretDown className="w-5 h-5 rtl:rotate-90 -rotate-90" />
                                </button>
                            </div>
                        </div>
                        <div className="h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>

                        {pagedTasks.length ? (
                            <div className="table-responsive grow overflow-y-auto sm:min-h-[300px] min-h-[400px]">
                                <table className="table-hover">
                                    <thead>
                                        <tr className="text-white-dark border-b border-white-light dark:border-[#1b2e4b]">
                                            <th className="w-1 py-3 ltr:pl-4 rtl:pr-4 ltr:pr-2 rtl:pl-2 font-semibold"> </th>
                                            <th className="py-3 ltr:pl-2 rtl:pr-2 font-semibold">Task</th>
                                            <th className="w-36 py-3 ltr:pl-2 rtl:pr-2 font-semibold">Section</th>
                                            <th className="w-28 py-3 ltr:pl-2 rtl:pr-2 font-semibold">Priority</th>
                                            <th className="w-40 py-3 ltr:pl-2 rtl:pr-2 font-semibold">Date</th>
                                            <th className="py-3 ltr:pl-2 rtl:pr-2 font-semibold">Reported / Assigned</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pagedTasks.map((task: any) => {
                                            const sectionName = (task.sectionId as any)?.name || '—';
                                            const deptName = (task.departmentId as any)?.name;
                                            return (
                                                <tr className={`group cursor-pointer ${task.isComplete ? 'bg-white-light/30 dark:bg-[#1a2941]' : ''}`} key={task._id}>
                                                    <td className="w-1">
                                                        {!task.isComplete && (
                                                            <input
                                                                type="checkbox"
                                                                id={`chk-${task._id}`}
                                                                className="form-checkbox"
                                                                onClick={() => taskComplete(task)}
                                                                title="Mark complete"
                                                            />
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div onClick={() => viewTask(task)}>
                                                            <div className={`group-hover:text-primary font-semibold text-base whitespace-nowrap ${task.isComplete ? 'line-through' : ''}`}>
                                                                {task.title || 'No title'}
                                                            </div>
                                                            <div className={`text-white-dark overflow-hidden min-w-[200px] line-clamp-1 ${task.isComplete ? 'line-through' : ''}`}>
                                                                {(task.description || task.descriptionText || '').slice(0, 80)}{(task.description || task.descriptionText || '').length > 80 ? '…' : ''}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="w-36 align-top pt-3">
                                                        <div onClick={() => viewTask(task)} className="flex flex-col gap-0.5">
                                                            <span className="badge badge-outline-success font-semibold whitespace-nowrap" title={deptName ? `Department: ${deptName}` : ''}>
                                                                {sectionName}
                                                            </span>
                                                            {deptName && (
                                                                <span className="text-[11px] text-white-dark truncate max-w-[8rem]" title={deptName}>{deptName}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="w-1">
                                                        <div className="flex items-center ltr:justify-end rtl:justify-start space-x-2 rtl:space-x-reverse">
                                                            {task.priority && (
                                                                <div className="dropdown">
                                                                    <Dropdown
                                                                        offset={[0, 5]}
                                                                        placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                                                        btnClassName="align-middle"
                                                                        button={
                                                                            <span
                                                                                className={`badge rounded-full capitalize hover:top-0 hover:text-white ${
                                                                                    task.priority === 'medium'
                                                                                        ? 'badge-outline-primary hover:bg-primary'
                                                                                        : task.priority === 'low'
                                                                                        ? 'badge-outline-warning hover:bg-warning'
                                                                                        : task.priority === 'high'
                                                                                        ? 'badge-outline-danger hover:bg-danger'
                                                                                        : task.priority === 'medium' && isPriorityMenu === task._id
                                                                                        ? 'text-white bg-primary'
                                                                                        : task.priority === 'low' && isPriorityMenu === task._id
                                                                                        ? 'text-white bg-warning'
                                                                                        : task.priority === 'high' && isPriorityMenu === task._id
                                                                                        ? 'text-white bg-danger'
                                                                                        : ''
                                                                                }`}
                                                                            >
                                                                                {task.priority}
                                                                            </span>
                                                                        }
                                                                    >
                                                                    </Dropdown>
                                                                </div>
                                                            )}

                                                            {task.progress && (
                                                                <span className="badge rounded-full capitalize badge-outline-info">
                                                                    {task.progress}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="w-1">
                                                        <p className={`whitespace-nowrap text-white-dark font-medium ${task.status === 'complete' ? 'line-through' : ''}`}>{new Date(task.createdAt).toLocaleString()}</p>
                                                    </td>
                                                    <td className="w-1">
                                                        <div className="flex items-center justify-between w-max ltr:ml-auto rtl:mr-auto">
                                                            <div className="ltr:mr-2.5 rtl:ml-2.5 flex-shrink-0">
                                                                Reported by: {task?.reportedBy ? `${(task.reportedBy as any).firstName} ${(task.reportedBy as any).lastName || ''}` : '—'}
                                                                {task?.assignedTo && ` · Assigned to: ${(task.assignedTo as any).firstName} ${(task.assignedTo as any).lastName || ''}`}
                                                                {task?.assignedToSubsectionId && !task?.assignedTo && ` · Subsection: ${(task.assignedToSubsectionId as any)?.name || '—'}`}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex justify-center items-center sm:min-h-[300px] min-h-[400px] font-semibold text-lg h-full">No Available issues at now, Happy Resting...</div>
                        )}
                    </div>
                </div>
                <Transition appear show={viewTaskModal} as={Fragment}>
                    <Dialog as="div" open={viewTaskModal} onClose={() => setViewTaskModal(false)} className="relative z-[51]">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-[black]/60" />
                        </Transition.Child>

                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center px-4 py-8">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark">
                                        <button
                                            type="button"
                                            onClick={() => setViewTaskModal(false)}
                                            className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                        >
                                            <IconX />
                                        </button>
                                        <div className="flex flex-col gap-2 text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                            <div className="flex items-center flex-wrap gap-2">
                                                <div>{selectedTask.title}</div>
                                                {selectedTask.priority && (
                                                    <div
                                                        className={`badge rounded-3xl capitalize ${
                                                            selectedTask.priority === 'medium'
                                                                ? 'badge-outline-primary'
                                                                : selectedTask.priority === 'low'
                                                                ? 'badge-outline-warning '
                                                                : selectedTask.priority === 'high'
                                                                ? 'badge-outline-danger '
                                                                : ''
                                                        }`}
                                                    >
                                                        {selectedTask.priority}
                                                    </div>
                                                )}
                                                {selectedTask.reportedBy && (
                                                    <span className="text-white-dark text-sm">
                                                        Reported by {(selectedTask.reportedBy as any).firstName} {(selectedTask.reportedBy as any).lastName}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap text-sm">
                                                <span className="font-semibold text-white-dark">Ownership:</span>
                                                <span className="badge badge-outline-success">
                                                    Section: {(selectedTask.sectionId as any)?.name || '—'}
                                                </span>
                                                {(selectedTask.departmentId as any)?.name && (
                                                    <span className="badge badge-outline-info">
                                                        Dept: {(selectedTask.departmentId as any).name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-5">
                                            <p className="text-white-dark mb-4">{(selectedTask.description || selectedTask.descriptionText || '').slice(0, 500) || 'No description.'}</p>
                                            {selectedTask.location && <p className="text-sm text-white-dark"><strong>Location:</strong> {selectedTask.location}</p>}
                                            {(selectedTask.assignedTo || selectedTask.assignedToSubsectionId) && (
                                                <p className="text-sm text-white-dark mt-2 mb-2">
                                                    {selectedTask.assignedTo
                                                        ? `Assigned to: ${(selectedTask.assignedTo as any)?.firstName} ${(selectedTask.assignedTo as any)?.lastName || ''}`
                                                        : selectedTask.assignedToSubsectionId
                                                        ? `Assigned to subsection: ${(selectedTask.assignedToSubsectionId as any)?.name || '—'}`
                                                        : ''}
                                                </p>
                                            )}
                                            <div className="mt-6">
                                                <label className="block mb-2">Assignment</label>
                                                <div className="space-y-2 mb-4">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="radio" name="assignMode" checked={assignMode === 'user'} onChange={() => { setAssignMode('user'); setSelectedSubsection(null); setSelectedReassignSection(null); }} />
                                                        <span>Assign to a person</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="radio" name="assignMode" checked={assignMode === 'subsection'} onChange={() => { setAssignMode('subsection'); setSelectedAssignee(null); setSelectedReassignSection(null); }} />
                                                        <span>Assign to subsection (team)</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="radio" name="assignMode" checked={assignMode === 'reassign'} onChange={() => { setAssignMode('reassign'); setSelectedAssignee(null); setSelectedSubsection(null); }} />
                                                        <span>Reassign to another section</span>
                                                    </label>
                                                </div>
                                                {assignMode === 'user' && (
                                                    <div className="mb-4">
                                                        <label htmlFor="assignee" className="block mb-1 text-sm">Select user</label>
                                                        <select
                                                            id="assignee"
                                                            className="form-select w-full"
                                                            value={selectedAssignee?._id || ''}
                                                            onChange={(e) => {
                                                                const id = e.target.value;
                                                                setSelectedAssignee(users.find((u: any) => u._id === id) || null);
                                                            }}
                                                        >
                                                            <option value="">Select user</option>
                                                            {users.map((user: any) => (
                                                                <option key={user._id} value={user._id}>
                                                                    {user.firstName} {user.lastName}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                                {assignMode === 'subsection' && (
                                                    <div className="mb-4">
                                                        <label htmlFor="subsection" className="block mb-1 text-sm">Select subsection</label>
                                                        <select
                                                            id="subsection"
                                                            className="form-select w-full"
                                                            value={selectedSubsection?._id || ''}
                                                            onChange={(e) => {
                                                                const id = e.target.value;
                                                                setSelectedSubsection(subsections.find((s: any) => s._id === id) || null);
                                                            }}
                                                        >
                                                            <option value="">Select subsection</option>
                                                            {subsections.map((s: any) => (
                                                                <option key={s._id} value={s._id}>{s.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                                {assignMode === 'reassign' && (
                                                    <div className="mb-4">
                                                        <label htmlFor="reassignSection" className="block mb-1 text-sm">Select section</label>
                                                        <select
                                                            id="reassignSection"
                                                            className="form-select w-full"
                                                            value={selectedReassignSection?._id || ''}
                                                            onChange={(e) => {
                                                                const id = e.target.value;
                                                                setSelectedReassignSection(allSections.find((s: any) => s._id === id) || null);
                                                            }}
                                                        >
                                                            <option value="">Select section</option>
                                                            {allSections.map((s: any) => (
                                                                <option key={s._id} value={s._id}>
                                                                    {s.name}{s.departmentId?.name ? ` (${s.departmentId.name})` : ''}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                                <div className="flex justify-end gap-2 mt-4">
                                                    <button type="button" className="btn btn-outline-danger" onClick={() => setViewTaskModal(false)}>Cancel</button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary"
                                                        onClick={() => assignTask()}
                                                        disabled={
                                                            (assignMode === 'user' && !selectedAssignee?._id) ||
                                                            (assignMode === 'subsection' && !selectedSubsection?._id) ||
                                                            (assignMode === 'reassign' && !selectedReassignSection?._id)
                                                        }
                                                    >
                                                        {assignMode === 'reassign' ? 'Reassign to section' : selectedTask.assignedTo || selectedTask.assignedToSubsectionId ? 'Update assignment' : 'Assign'}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex justify-end mt-4">
                                                <button type="button" className="btn btn-outline-secondary" onClick={() => setViewTaskModal(false)}>Close</button>
                                            </div>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            </div>
            <CreateTicketModal
                open={showCreateTicketModal}
                onClose={() => setShowCreateTicketModal(false)}
                onSuccess={() => fetchIssues()}
            />
            </>
            )}
        </div>
    );
};

export default ActivityHub;
