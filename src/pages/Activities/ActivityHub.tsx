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
import IconTrashLines from '../../components/Icon/IconTrashLines';
import IconSquareRotated from '../../components/Icon/IconSquareRotated';
import IconPlus from '../../components/Icon/IconPlus';
import IconSearch from '../../components/Icon/IconSearch';
import IconMenu from '../../components/Icon/IconMenu';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import IconHorizontalDots from '../../components/Icon/IconHorizontalDots';
import IconX from '../../components/Icon/IconX';
import IconRestore from '../../components/Icon/IconRestore';
import axios from 'axios';
import { API_CONFIG } from '../../Api/apiConfig';
import { connectWebSocket } from '../../websocket';;

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
    };

    const [selectedTab, setSelectedTab] = useState('');
    const [isShowTaskMenu, setIsShowTaskMenu] = useState(false);
    const [viewTaskModal, setViewTaskModal] = useState(false);
    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultParams)));


    const [users, setUsers] = useState([]);
    const [selectedAssignee, setSelectedAssignee] = useState(null);
    const [allTasks, setAllTasks] = useState([]);

    const fetchIssues = async () => {
        try {
            const response = await axios.get(`${API_CONFIG.baseURL}${API_CONFIG.issues.endpoints.list}`);
            const onlyNew = response.data;
            const onlyNewIssues = onlyNew?.filter((issue: any) => {
                return issue.isAssigned === false;
            });
            setAllTasks(onlyNewIssues);
            // setAllTasks(response.data)
        } catch (error: any) {
            console.error('Error fetching issues:', error.message);
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
        let res;
        if (selectedTab === 'complete' || selectedTab === 'trash') {
            res = allTasks.filter((d: any) => d.status === selectedTab);
        } else {
            res = allTasks.filter((d: any) => d.status !== 'trash');
        }

        if (selectedTab === 'dispatch' || selectedTab === 'network' || selectedTab === 'power' || selectedTab === 'smart-cap' || selectedTab === 'improvement' || selectedTab === 'systems-admin') {
            res = res.filter((d: any) => d.purpose === selectedTab);
        } else if (selectedTab === 'high' || selectedTab === 'medium' || selectedTab === 'low') {
            res = res.filter((d: any) => d.priority === selectedTab);
        }
        setFilteredTasks([...res.filter((d: any) => d.title?.toLowerCase().includes(searchTask))]);
        getPager(res.filter((d: any) => d.title?.toLowerCase().includes(searchTask)));
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

    const token = localStorage.getItem('token');

    const taskComplete = async (task: any = null) => {
        let item = filteredTasks.find((d: any) => d._id === task._id);
        try {
            await axios.put(`${API_CONFIG.baseURL}/issues/complete/${task._id}`, {task} ,{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

        console.log('successfully')
        showMessage('Task has been completed Successfully.');
        } catch (error) {
            console.log('Error creating')
        }
        item.status = item.status === 'complete' ? '' : 'complete';
        searchTasks(false);
    };

    const viewTask = async (item: any = null) => {
        setSelectedTask(item);
        console.log('Item', item)
        setTimeout(() => {
            setViewTaskModal(true);
        });
    };


    const deleteTask = async (task: any, type: string = '') => {
        if (type === 'delete') {
            try {
                await axios.put(`${API_CONFIG.baseURL}/issues/deleteToTrash/${task._id}`);
            task.status = 'trash';
            console.log('successfully')
            showMessage('Task has been stored to trash.');
            } catch (error) {
                console.log('Error creating')
            }

        }
        if (type === 'deletePermanent') {
            try {
                // Send a request to the delete endpoint to permanently delete the task
                await axios.delete(`${API_CONFIG.baseURL}/issues/${task._id}`);
                // If the request succeeds, remove the task from the list
                setAllTasks(allTasks.filter((d: any) => d._id !== task._id));
                showMessage('Task has been deleted successfully.');
            } catch (error) {
                console.error('Error permanently deleting task:', error);
                showMessage('Unable deleting Task.');
                // Handle error
            }
        } else if (type === 'restore') {
            try {
                await axios.put(`${API_CONFIG.baseURL}/issues/restoreFromTrash/${task._id}`);
            task.status = 'trash';
            showMessage('Task has been restored successfully.');
            } catch (error) {
                console.log('Error creating')
            }
            task.status = '';
        }
        searchTasks(false);
    };

    // fetch users
    useEffect(() => {
        const fetchUsers = async () => {
          try {
            const response = await axios.get(`${API_CONFIG.baseURL}${API_CONFIG.users.endpoints.listEngineers}`);
            setUsers(response.data);
          } catch (error: any) {
            console.error('Error fetching users:', error.message);

          }
        };

        fetchUsers();
      }, []);

      // After issue creation for assignment
        const assignTask = async (selectedTask: any, assignedTo: any,) => {
            const taskId = selectedTask._id;
            const tag = params.tag;

            try {
                if(assignedTo) {
                        const response = await axios.put(`${API_CONFIG.baseURL}${API_CONFIG.issues.endpoints.assignNew}/${taskId}`, { assignedTo, tag }, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        });
                        setViewTaskModal(false)
                        showMessage('Assigned successfully.');
                        return response;
                } else if (tag) {
                        const response = await axios.put(`${API_CONFIG.baseURL}${API_CONFIG.issues.endpoints.assignContractor}/${taskId}`, { tag }, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        });
                        setViewTaskModal(false)
                        showMessage('Assigned successfully.');
                        return response;

                }
            } catch (error) {
                console.error('Error assigning task:', error);
                showMessage('Error assiging task.', 'error');
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
                                        {allTasks && allTasks.filter((d: any) => d.status !== 'trash').length}
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    className={`w-full flex justify-between items-center p-2 hover:bg-white-dark/10 rounded-md dark:hover:text-primary hover:text-primary dark:hover:bg-[#181F32] font-medium h-10 ${
                                        selectedTab === 'complete' && 'bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]'
                                    }`}
                                    onClick={() => {
                                        tabChanged();
                                        setSelectedTab('complete');
                                    }}
                                >
                                    <div className="flex items-center">
                                        <IconThumbUp className="w-5 h-5 shrink-0" />
                                        <div className="ltr:ml-3 rtl:mr-3">Done</div>
                                    </div>
                                    <div className="bg-primary-light dark:bg-[#060818] rounded-md py-0.5 px-2 font-semibold whitespace-nowrap">
                                        {allTasks && allTasks.filter((d: any) => d.status === 'complete').length}
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    className={`w-full flex justify-between items-center p-2 hover:bg-white-dark/10 rounded-md dark:hover:text-primary hover:text-primary dark:hover:bg-[#181F32] font-medium h-10 ${
                                        selectedTab === 'trash' && 'bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]'
                                    }`}
                                    onClick={() => {
                                        tabChanged();
                                        setSelectedTab('trash');
                                    }}
                                >
                                    <div className="flex items-center">
                                        <IconTrashLines className="shrink-0" />
                                        <div className="ltr:ml-3 rtl:mr-3">Trash</div>
                                    </div>
                                </button>
                                <div className="h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>
                                <div className="text-white-dark px-1 py-3">Tags</div>
                                <button
                                    type="button"
                                    className={`w-full flex items-center h-10 p-1 hover:bg-white-dark/10 rounded-md dark:hover:bg-[#181F32] font-medium text-primary ltr:hover:pl-3 rtl:hover:pr-3 duration-300 ${
                                        selectedTab === 'dispatch' && 'ltr:pl-3 rtl:pr-3 bg-gray-100 dark:bg-[#181F32]'
                                    }`}
                                    onClick={() => {
                                        tabChanged();
                                        setSelectedTab('dispatch');
                                    }}
                                >
                                    <IconSquareRotated className="fill-primary shrink-0" />
                                    <div className="ltr:ml-3 rtl:mr-3">Dispatch</div>
                                </button>
                                <button
                                    type="button"
                                    className={`w-full flex items-center h-10 p-1 hover:bg-white-dark/10 rounded-md dark:hover:bg-[#181F32] font-medium text-info ltr:hover:pl-3 rtl:hover:pr-3 duration-300 ${
                                        selectedTab === 'smart-cap' && 'ltr:pl-3 rtl:pr-3 bg-gray-100 dark:bg-[#181F32]'
                                    }`}
                                    onClick={() => {
                                        tabChanged();
                                        setSelectedTab('smart-cap');
                                    }}
                                >
                                    <IconSquareRotated className="fill-info shrink-0" />
                                    <div className="ltr:ml-3 rtl:mr-3">Smart Cap</div>
                                </button>
                                <button
                                    type="button"
                                    className={`w-full flex items-center h-10 p-1 hover:bg-white-dark/10 rounded-md dark:hover:bg-[#181F32] font-medium text-success ltr:hover:pl-3 rtl:hover:pr-3 duration-300 ${
                                        selectedTab === 'network' && 'ltr:pl-3 rtl:pr-3 bg-gray-100 dark:bg-[#181F32]'
                                    }`}
                                    onClick={() => {
                                        tabChanged();
                                        setSelectedTab('network');
                                    }}
                                >
                                    <IconSquareRotated className="fill-success shrink-0" />
                                    <div className="ltr:ml-3 rtl:mr-3">Network</div>
                                </button>
                                <button
                                    type="button"
                                    className={`w-full flex items-center h-10 p-1 hover:bg-white-dark/10 rounded-md dark:hover:bg-[#181F32] font-medium text-success ltr:hover:pl-3 rtl:hover:pr-3 duration-300 ${
                                        selectedTab === 'power' && 'ltr:pl-3 rtl:pr-3 bg-gray-100 dark:bg-[#181F32]'
                                    }`}
                                    onClick={() => {
                                        tabChanged();
                                        setSelectedTab('power');
                                    }}
                                >
                                    <IconSquareRotated className="fill-success shrink-0" />
                                    <div className="ltr:ml-3 rtl:mr-3">Power</div>
                                </button>
                                <button
                                    type="button"
                                    className={`w-full flex items-center h-10 p-1 hover:bg-white-dark/10 rounded-md dark:hover:bg-[#181F32] font-medium text-danger ltr:hover:pl-3 rtl:hover:pr-3 duration-300 ${
                                        selectedTab === 'systems-admin' && 'ltr:pl-3 rtl:pr-3 bg-gray-100 dark:bg-[#181F32]'
                                    }`}
                                    onClick={() => {
                                        tabChanged();
                                        setSelectedTab('systems-admin');
                                    }}
                                >
                                    <IconSquareRotated className="fill-danger shrink-0" />
                                    <div className="ltr:ml-3 rtl:mr-3">Systems admin</div>
                                </button>
                                <button
                                    type="button"
                                    className={`w-full flex items-center h-10 p-1 hover:bg-white-dark/10 rounded-md dark:hover:bg-[#181F32] font-medium text-warning ltr:hover:pl-3 rtl:hover:pr-3 duration-300 ${
                                        selectedTab === 'improvement' && 'ltr:pl-3 rtl:pr-3 bg-gray-100 dark:bg-[#181F32]'
                                    }`}
                                    onClick={() => {
                                        tabChanged();
                                        setSelectedTab('improvement');
                                    }}
                                >
                                    <IconSquareRotated className="fill-warning shrink-0" />
                                    <div className="ltr:ml-3 rtl:mr-3">Improvement</div>
                                </button>
                                <button
                                    type="button"
                                    className={`w-full flex items-center h-10 p-1 hover:bg-white-dark/10 rounded-md dark:hover:bg-[#181F32] font-medium text-warning ltr:hover:pl-3 rtl:hover:pr-3 duration-300 ${
                                        selectedTab === 'low' && 'ltr:pl-3 rtl:pr-3 bg-gray-100 dark:bg-[#181F32]'
                                    }`}
                                    onClick={() => {
                                        tabChanged();
                                        setSelectedTab('low');
                                    }}
                                >
                                    <IconSquareRotated className="fill-warning shrink-0" />
                                    <div className="ltr:ml-3 rtl:mr-3">Low</div>
                                </button>

                                <button
                                    type="button"
                                    className={`w-full flex items-center h-10 p-1 hover:bg-white-dark/10 rounded-md dark:hover:bg-[#181F32] font-medium text-primary ltr:hover:pl-3 rtl:hover:pr-3 duration-300 ${
                                        selectedTab === 'medium' && 'ltr:pl-3 rtl:pr-3 bg-gray-100 dark:bg-[#181F32]'
                                    }`}
                                    onClick={() => {
                                        tabChanged();
                                        setSelectedTab('medium');
                                    }}
                                >
                                    <IconSquareRotated className="fill-primary shrink-0" />
                                    <div className="ltr:ml-3 rtl:mr-3">Medium</div>
                                </button>
                                <button
                                    type="button"
                                    className={`w-full flex items-center h-10 p-1 hover:bg-white-dark/10 rounded-md dark:hover:bg-[#181F32] font-medium text-danger ltr:hover:pl-3 rtl:hover:pr-3 duration-300 ${
                                        selectedTab === 'high' && 'ltr:pl-3 rtl:pr-3 bg-gray-100 dark:bg-[#181F32]'
                                    }`}
                                    onClick={() => {
                                        tabChanged();
                                        setSelectedTab('high');
                                    }}
                                >
                                    <IconSquareRotated className="fill-danger shrink-0" />
                                    <div className="ltr:ml-3 rtl:mr-3">High</div>
                                </button>

                            </div>
                        </PerfectScrollbar>
                        <div className="ltr:left-0 rtl:right-0 absolute bottom-0 p-4 w-full">
                            <button className="btn btn-primary w-full" type="button">
                                <IconPlus className="ltr:mr-2 rtl:ml-2 shrink-0" />
                                Log a Call
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
                                        placeholder="Searchr..."
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
                                    <tbody>
                                        {pagedTasks.map((task: any) => {
                                            return (
                                                <tr className={`group cursor-pointer ${task.status === 'complete' ? 'bg-white-light/30 dark:bg-[#1a2941]' : ''}`} key={task._id}>
                                                    <td className="w-1">
                                                        <input
                                                            type="checkbox"
                                                            id={`chk-${task._id}`}
                                                            className="form-checkbox"
                                                            disabled={selectedTab === 'trash'}
                                                            onClick={() => taskComplete(task)}
                                                            defaultChecked={task.status === 'complete'}
                                                        />
                                                    </td>
                                                    <td>
                                                        <div onClick={() => viewTask(task)}>
                                                            <div className={`group-hover:text-primary font-semibold text-base whitespace-nowrap ${task.status === 'complete' ? 'line-through' : ''}`}>
                                                                {task.title}
                                                            </div>
                                                            <div className={`text-white-dark overflow-hidden min-w-[300px] line-clamp-1 ${task.status === 'complete' ? 'line-through' : ''}`}>
                                                                {task.descriptionText}
                                                            </div>
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

                                                            {task.purpose && (
                                                                <div className="dropdown">
                                                                    <Dropdown
                                                                        offset={[0, 5]}
                                                                        placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                                                        btnClassName="align-middle"
                                                                        button={
                                                                            <span
                                                                                className={`badge rounded-full capitalize hover:top-0 hover:text-white ${
                                                                                    task.purpose === 'dispatch'
                                                                                        ? 'badge-outline-primary hover:bg-primary'
                                                                                        : task.purpose === 'network'
                                                                                        ? 'badge-outline-success hover:bg-success'
                                                                                        : task.purpose === 'power'
                                                                                        ? 'badge-outline-success hover:bg-success'
                                                                                        : task.purpose === 'smart-cap'
                                                                                        ? 'badge-outline-info hover:bg-info'
                                                                                        : task.purpose === 'improvement'
                                                                                        ? 'badge-outline-warning hover:bg-warning'
                                                                                        : task.purpose === 'systems-admin'
                                                                                        ? 'badge-outline-danger hover:bg-danger'
                                                                                        : task.purpose === 'dispatch' && isTagMenu === task._id
                                                                                        ? 'text-white bg-primary '
                                                                                        : task.purpose === 'network' && isTagMenu === task._id
                                                                                        ? 'text-white bg-success '
                                                                                        : task.purpose === 'smart-cap' && isTagMenu === task._id
                                                                                        ? 'text-white bg-info '
                                                                                        : task.purpose === 'improvement' && isTagMenu === task._id
                                                                                        ? 'text-white bg-warning '
                                                                                        : task.purpose === 'systems-admin' && isTagMenu === task._id
                                                                                        ? 'text-white bg-danger '
                                                                                        : ''
                                                                                }`}
                                                                            >
                                                                                {task.purpose}
                                                                            </span>
                                                                        }
                                                                    >
                                                                    </Dropdown>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="w-1">
                                                        <p className={`whitespace-nowrap text-white-dark font-medium ${task.status === 'complete' ? 'line-through' : ''}`}>{new Date(task.createdAt).toLocaleString()}</p>
                                                    </td>
                                                    <td className="w-1">
                                                        <div className="flex items-center justify-between w-max ltr:ml-auto rtl:mr-auto">
                                                            <div className="ltr:mr-2.5 rtl:ml-2.5 flex-shrink-0">
                                                                Reported By: {`${task?.reportedBy?.firstName} ${'-'} ${task?.reportedBy?.role}`}

                                                            </div>
                                                            <div className="dropdown">
                                                                <Dropdown
                                                                    offset={[0, 5]}
                                                                    placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                                                    btnClassName="align-middle"
                                                                    button={<IconHorizontalDots className="rotate-90 opacity-70" />}
                                                                >
                                                                    <ul className="whitespace-nowrap">
                                                                        {selectedTab !== 'trash' && (
                                                                            <>
                                                                                <li>
                                                                                    <button type="button" onClick={() => deleteTask(task, 'delete')}>
                                                                                        <IconTrashLines className="ltr:mr-2 rtl:ml-2 shrink-0" />
                                                                                        Delete
                                                                                    </button>
                                                                                </li>

                                                                            </>
                                                                        )}
                                                                        {selectedTab === 'trash' && (
                                                                            <>
                                                                                <li>
                                                                                    <button type="button" onClick={() => deleteTask(task, 'deletePermanent')}>
                                                                                        <IconTrashLines className="ltr:mr-2 rtl:ml-2 shrink-0" />
                                                                                        Permanent Delete
                                                                                    </button>
                                                                                </li>
                                                                                <li>
                                                                                    <button type="button" onClick={() => deleteTask(task, 'restore')}>
                                                                                        <IconRestore className="ltr:mr-2 rtl:ml-2 shrink-0" />
                                                                                        Restore Task
                                                                                    </button>
                                                                                </li>
                                                                            </>
                                                                        )}
                                                                    </ul>
                                                                </Dropdown>
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
                                        <div className="flex items-center flex-wrap gap-2 text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
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
                                            {selectedTask.tag && (
                                                <div
                                                    className={`badge rounded-3xl capitalize ${
                                                        selectedTask.purpose === 'dispatch' ? 'badge-outline-primary' : selectedTask.purpose === 'network' ?  'badge-outline-success ' : selectedTask.purpose === 'power' ?  'badge-outline-success ' : selectedTask.purpose === 'smart-cap' ? 'badge-outline-info ' : selectedTask.purpose === 'improvement' ? 'badge-outline-warning ' : selectedTask.purpose === 'systems-admin' ? 'badge-outline-danger ': ''
                                                    }`}
                                                >
                                                    {selectedTask.purpose}
                                                </div>
                                            )}
                                            {`${selectedTask.reportedBy.firstName} ${'-'} ${selectedTask.reportedBy.role}`}
                                        </div>
                                        <div className="item-center p-5">
                                            <div className="text-base prose" dangerouslySetInnerHTML={{ __html: selectedTask.description }}></div>
                                            {!selectedTask.assignedTo && !selectedTask.tag ? (
                                            <div className='flex justify-between mt-8'>
                                                <div className="mb-5 flex justify-between gap-4">
                                                    <div className="mt-7">
                                                    <label htmlFor="tag">Section</label>
                                                    <select
                                                        id="tag"
                                                        className="form-select"
                                                        value={params.tag}
                                                        onChange={(e) => setParams({ ...params, tag: e.target.value })}
                                                    >
                                                        <option value="">Select Section</option>
                                                        <option value="SYSTEMS-ENGINEER">Systems Engineer</option>
                                                        <option value="AFRIYIE">Afriyie Contractors</option>
                                                        <option value="RAMJACK">RamJack Contractors</option>
                                                        <option value="DISPATCH">Amax Contractors</option>
                                                        <option value="GEOTECH">Geotech Engineer</option>
                                                        <option value="BENEWISE">Beniwise Contractors</option>
                                                    </select>
                                                    </div>
                                                    <div className="flex-1">
                                                    </div>
                                                </div>

                                                <div className="item-center mt-7" style={{ display: params.tag === 'SYSTEMS-ENGINEER' ? 'block' : 'none' }}>
                                                <label htmlFor="assignee">Assignee</label>
                                                <select
                                                    id="assignee"
                                                    className="form-select"
                                                    value={selectedAssignee ? (selectedAssignee as any)._id : ''}
                                                    onChange={(e) => {
                                                        const selectedUserId = e.target.value;
                                                        const selectedUser: any = users.find((user: any) => user._id === selectedUserId);
                                                        setSelectedAssignee(selectedUser);
                                                    }}
                                                >
                                                    <option value="">Select Assignee</option>
                                                    {users.map((user: any) => (
                                                    <option key={user._id} value={user._id}>
                                                        {user.firstName}
                                                    </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="flex justify-end items-center mt-8" >
                                                <button type="button" className="btn btn-outline-danger" onClick={() => assignTask(selectedTask, selectedAssignee)}>
                                                    Assign
                                                </button>
                                            </div>
                                            </div>
                                            ) : (
                                            <div className="flex justify-end items-center mt-8" >
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setViewTaskModal(false)}>
                                                    Close
                                                </button>
                                            </div>
                                            )}
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            </div>
        </div>
    );
};

export default ActivityHub;
