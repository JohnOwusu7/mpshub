import PerfectScrollbar from 'react-perfect-scrollbar';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import Dropdown from '../../components/Dropdown';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconNotes from '../../components/Icon/IconNotes';
import IconNotesEdit from '../../components/Icon/IconNotesEdit';
import IconSquareRotated from '../../components/Icon/IconSquareRotated';
import IconPlus from '../../components/Icon/IconPlus';
import IconMenu from '../../components/Icon/IconMenu';
import IconUser from '../../components/Icon/IconUser';
import IconHorizontalDots from '../../components/Icon/IconHorizontalDots';
import IconPencil from '../../components/Icon/IconPencil';
import IconEye from '../../components/Icon/IconEye';
import IconX from '../../components/Icon/IconX';
import axios from 'axios';
import { API_CONFIG } from '../../Api/apiConfig';
import IconMoodSmile from '../../components/Icon/IconMoodSmile';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client'
import BlankWithHeader from '../../components/Layouts/BlankWithHeader';

const socket = io(API_CONFIG.socketUrl);

const Issues = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

// Assuming you have the authenticated user object in your Redux store state
const authenticatedUser = useSelector((state: IRootState) => state.user.user);

// Function to get the user's role
const getUserRole = () => {
    // If the authenticated user object exists
    if (authenticatedUser) {
        // Extract the role property from the user object
        return authenticatedUser.role;
    } else {
        // If user is not authenticated or user object doesn't contain role property
        return 'guest';
    }
};

    useEffect(() => {
        dispatch(setPageTitle('Activity Tracker'));
    });
    const [notesList, setNoteList] = useState([]);

    const defaultParams: any = { id: null, heavyEquipmentId: '', title: '', description: '', priority: '', user: '', issue: '', issueDesc: '', operator: '', };
    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultParams)));
    const [createTicket, setCreateTicket] = useState<any>(false);
    const [isShowNoteMenu, setIsShowNoteMenu] = useState<any>(false);
    const [isViewNoteModal, setIsViewNoteModal] = useState<any>(false);
    const [filteredNotesList, setFilteredNotesList] = useState<any>([]);
    const [selectedTab, setSelectedTab] = useState<any>('all');
    const [selectedTabs, setSelectedTabs] = useState<any>('');
    const [heavyEquipments, setHeavyEquipments] = useState<any[]>([]);
    const [operators, setOperators] = useState<any[]>([]);

    const token = localStorage.getItem('token');
    

    // Fetch heavyEquipments data
    useEffect(() => {
        const fetchHeavyEquipments = async () => {
            try {
                const response = await axios.get(`${API_CONFIG.baseURL}${API_CONFIG.heavyEquipments.endpoints.list}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setHeavyEquipments(response.data);
            } catch (error) {
                console.error('Error fetching heavyEquipments:', error);
                showMessage('Error fetching heavyEquipments. Please try again later.', 'error');
            }
        };

        fetchHeavyEquipments();
    }, [token]);

    // Fetch operators data
    useEffect(() => {
        const fetchOperators = async () => {
            try {
                const response = await axios.get(`${API_CONFIG.baseURL}${API_CONFIG.operators.endpoints.list}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setOperators(response.data);
            } catch (error) {
                console.error('Error fetching operators:', error);
                showMessage('Error fetching operators. Please try again later.', 'error');
            }
        };

        fetchOperators();
    }, [token]);    

      const fetchIssues = async () => {
        try {
            const response = await axios.get(`${API_CONFIG.baseURL}${API_CONFIG.issues.endpoints.list}`);
            const issuesData = response.data;

            const userRole = getUserRole();

            // Filter the issues
            const filteredIssues = issuesData.filter((issue: { tag: any; isComplete:boolean }) => {
                return issue.tag === userRole && !issue.isComplete;
            });

            // Normalize the filtered data
            const normalizedData = filteredIssues.map((item: { _id: any; reportedBy: { firstName: any; }; title: any; heavyEquipmentId: any; descriptionText: any; createdAt: any; tag: any; priority: any; progress: any; updatedAt: any; isComplete: any; assignedTo: { firstName: any; lastName: any; }; }) => ({
                id: item._id,
                user: item.reportedBy.firstName,
                title: item.title,
                heavyEquipmentId: item.heavyEquipmentId,
                description: item.descriptionText,
                date: item.createdAt,
                tag: item.tag,
                priority: item.priority,
                progress: item.progress,
                // role: item.role,
                updatedAt: item.updatedAt,
                isComplete: item.isComplete,
                assignee1: item?.assignedTo?.firstName || item.tag,
                assignee2: item?.assignedTo?.lastName || item.progress
            }));

            // Set the filtered and normalized data in the state
            setNoteList(normalizedData);

            console.log('Filtered Issues List:', filteredIssues);
        } catch (error: any) {
            console.error('Error fetching issues:', error.message);
        }
    };

      // Call fetchIssues when the component mounts
  useEffect(() => {
    fetchIssues();
  }, []);

    const searchNotes = () => {
        if (selectedTab !== 'fav') {
            if (selectedTab !== 'all' || selectedTab === 'delete') {
                setFilteredNotesList(notesList.filter((d: any) => d.progress === selectedTab));
            } else {
                setFilteredNotesList(notesList);
            }
        } else {
            setFilteredNotesList(notesList.filter((d: any) => d.isComplete));
        }
    };

    const saveNote = async () => {

        // Rename the 'description' field to 'descriptionText'
        params.descriptionText = params.description;

        try {
            // Send the request to add/update the note
            await axios.post(`${API_CONFIG.baseURL}${API_CONFIG.issues.endpoints.add}`, params, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            showMessage('Ticket has been sent successfully.');
            setCreateTicket(false);
            searchNotes();
        } catch (error) {
            console.error('Error saving note:', error);
            showMessage('Error saving note. Please try again later.', 'error');
        }
    };


    const tabChanged = (type: string) => {
        setSelectedTab(type);
        setIsShowNoteMenu(false);
        searchNotes();
    };

    const startProgress = async (params: any,) => {
        try {
            let item = filteredNotesList.find((d: any) => d.id === params.id);
            console.log("item:", item)
            console.log("user ID", params.id)

            // Send a POST request to update the progress of the note
            const response = await axios.put(`${API_CONFIG.baseURL}/issues/start-progress/${params.id}`, {params}, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            setIsViewNoteModal(false)
            navigate('/dashboard');
            showMessage('Progress started Successfully.');
            console.log('Progress started successfully:', response.data);
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    };

    const completeProgress = async (params: any) => {
        try {
            let item = filteredNotesList.find((d: any) => d._id === params._id);
            console.log("item:", item)
            console.log("Params:", params)
            console.log("user param ID", params.id)
            await axios.put(`${API_CONFIG.baseURL}/issues/complete-progress/${params.id}`, {params}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setIsViewNoteModal(false)
            navigate('/dashboard');
            console.log('successfully')
            showMessage('Task has been completed Successfully.');
        } catch (error) {
            console.log('Error creating');
        }
    };

    const changeValue = (e: any) => {
        const { value, id } = e.target;
        setParams({ ...params, [id]: value });
    };

    const viewNote = (note: any) => {
        setParams(note);
        setIsViewNoteModal(true);
    };

    const editNote = (note: any = null) => {
        setIsShowNoteMenu(false);
        const json = JSON.parse(JSON.stringify(defaultParams));
        setParams(json);
        if (note) {
            let json1 = JSON.parse(JSON.stringify(note));
            setParams(json1);
        }
        setCreateTicket(true);
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

    useEffect(() => {
        searchNotes();
    }, [selectedTab, notesList]);

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    return (
        <div>
            <BlankWithHeader />
            <div className="flex gap-5 relative sm:h-[calc(100vh_-_150px)] h-full mt-5">
                <div className={`bg-black/60 z-10 w-full h-full rounded-md absolute hidden ${isShowNoteMenu ? '!block xl:!hidden' : ''}`} onClick={() => setIsShowNoteMenu(!isShowNoteMenu)}></div>
                <div
                    className={`panel
                    p-4
                    flex-none
                    w-[240px]
                    absolute
                    xl:relative
                    z-10
                    space-y-4
                    h-full
                    xl:h-auto
                    hidden
                    xl:block
                    ltr:lg:rounded-r-md ltr:rounded-r-none
                    rtl:lg:rounded-l-md rtl:rounded-l-none
                    overflow-hidden ${isShowNoteMenu ? '!block h-full ltr:left-0 rtl:right-0' : 'hidden shadow'}`}
                >
                    <div className="flex flex-col h-full pb-16">
                        <div className="flex text-center items-center">
                            <div className="shrink-0">
                                <IconNotes />
                            </div>
                            <h3 className="text-lg font-semibold ltr:ml-3 rtl:mr-3">Manager</h3>
                        </div>

                        <div className="h-px w-full border-b border-white-light dark:border-[#1b2e4b] my-4"></div>
                        <PerfectScrollbar className="relative ltr:pr-3.5 rtl:pl-3.5 ltr:-mr-3.5 rtl:-ml-3.5 h-full grow">
                            <div className="space-y-1">
                                <button
                                    type="button"
                                    className={`w-full flex justify-between items-center p-2 hover:bg-white-dark/10 rounded-md dark:hover:text-primary hover:text-primary dark:hover:bg-[#181F32] font-medium h-10 ${
                                        selectedTab === 'all' && 'bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]'
                                    }`}
                                    onClick={() => tabChanged('all')}
                                >
                                    <div className="flex items-center">
                                        <IconNotesEdit className="shrink-0" />
                                        <div className="ltr:ml-3 rtl:mr-3">All Activities</div>
                                    </div>
                                </button>
                                <div className="h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>
                                <div className="px-1 py-3 text-white-dark">Tags</div>
                                <button
                                    type="button"
                                    className={`w-full flex items-center h-10 p-1 hover:bg-white-dark/10 rounded-md dark:hover:bg-[#181F32] font-medium text-primary ltr:hover:pl-3 rtl:hover:pr-3 duration-300 ${
                                        selectedTabs === 'new' && 'ltr:pl-3 rtl:pr-3 bg-gray-100 dark:bg-[#181F32]'
                                    }`}
                                    onClick={() => tabChanged('new')}
                                >
                                    <IconSquareRotated className="fill-primary shrink-0" />
                                    <div className="ltr:ml-3 rtl:mr-3">New</div>
                                </button>

                                <button
                                    type="button"
                                    className={`w-full flex items-center h-10 p-1 hover:bg-white-dark/10 rounded-md dark:hover:bg-[#181F32] font-medium text-warning ltr:hover:pl-3 rtl:hover:pr-3 duration-300 ${
                                        selectedTab === 'in-progress' && 'ltr:pl-3 rtl:pr-3 bg-gray-100 dark:bg-[#181F32]'
                                    }`}
                                    onClick={() => tabChanged('in-progress')}
                                >
                                    <IconSquareRotated className="fill-warning shrink-0" />
                                    <div className="ltr:ml-3 rtl:mr-3">In Progress</div>
                                </button>

                                <button
                                    type="button"
                                    className={`w-full flex items-center h-10 p-1 hover:bg-white-dark/10 rounded-md dark:hover:bg-[#181F32] font-medium text-success ltr:hover:pl-3 rtl:hover:pr-3 duration-300 ${
                                        selectedTab === 'complete' && 'ltr:pl-3 rtl:pr-3 bg-gray-100 dark:bg-[#181F32]'
                                    }`}
                                    onClick={() => tabChanged('complete')}
                                >
                                    <IconSquareRotated className="fill-success shrink-0" />
                                    <div className="ltr:ml-3 rtl:mr-3">Complete</div>
                                </button>

                                <button
                                    type="button"
                                    className={`w-full flex items-center h-10 p-1 hover:bg-white-dark/10 rounded-md dark:hover:bg-[#181F32] font-medium text-danger ltr:hover:pl-3 rtl:hover:pr-3 duration-300 ${
                                        selectedTab === 'overdue' && 'ltr:pl-3 rtl:pr-3 bg-gray-100 dark:bg-[#181F32]'
                                    }`}
                                    onClick={() => tabChanged('overdue')}
                                >
                                    <IconSquareRotated className="fill-danger shrink-0" />
                                    <div className="ltr:ml-3 rtl:mr-3">Overdue</div>
                                </button>
                            </div>
                        </PerfectScrollbar>
                    </div>
                    <div className="ltr:left-0 rtl:right-0 absolute bottom-0 p-4 w-full">
                        <button className="btn btn-primary w-full" type="button" onClick={() => editNote()}>
                            <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2 shrink-0" />
                            Create A ticket
                        </button>
                    </div>
                </div>
                <div className="panel flex-1 overflow-auto h-full">
                    <div className="pb-5">
                        <button type="button" className="xl:hidden hover:text-primary" onClick={() => setIsShowNoteMenu(!isShowNoteMenu)}>
                            <IconMenu />
                        </button>
                    </div>
                    {filteredNotesList.length ? (
                        <div className="sm:min-h-[300px] min-h-[400px]">
                            <div className="grid 2xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5">
                                {filteredNotesList.map((note: any) => {
                                    return (
                                        <div
                                            className={`panel pb-12 ${
                                                note.progress === 'new'
                                                    ? 'bg-primary-light shadow-primary'
                                                    : note.progress === 'in-progress'
                                                    ? 'bg-warning-light shadow-warning'
                                                    : note.progress === 'complete'
                                                    ? 'bg-success-light shadow-success'
                                                    : 'dark:shadow-dark'
                                            }`}
                                            key={note.id}
                                        >
                                            <div className="min-h-[142px]">
                                                <div className="flex justify-between">
                                                    <div className="flex items-center w-max">
                                                        <div className="flex-none">
                                                            {note.thumb && (
                                                                <div className="p-0.5 bg-gray-300 dark:bg-gray-700 rounded-full">
                                                                    <img className="h-8 w-8 rounded-full object-cover" alt="img" src={`/assets/images/${note.thumb}`} />
                                                                </div>
                                                            )}

                                                            {!note.thumb && note.user && (
                                                                <div className="grid place-content-center h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700 text-sm font-semibold">
                                                                    {note.user.charAt(0) + '' + note.user.charAt(note.user.indexOf('') + 1)}
                                                                </div>
                                                            )}
                                                            {!note.thumb && !note.user && (
                                                                <div className="bg-gray-300 dark:bg-gray-700 rounded-full p-2">
                                                                    <IconUser className="w-4.5 h-4.5" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ltr:ml-2 rtl:mr-2">
                                                            <div className="font-semibold">By: {note.user}</div>
                                                            <div className="text-sx text-white-dark">{new Date(note.date).toLocaleString()}</div>
                                                        </div>
                                                    </div>
                                                    <div className="dropdown">
                                                        <Dropdown
                                                            offset={[0, 5]}
                                                            placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                                            btnClassName="text-primary"
                                                            button={<IconHorizontalDots className="rotate-90 opacity-70 hover:opacity-100" />}
                                                        >
                                                            <ul className="text-sm font-medium">
                                                                <li>
                                                                    <button type="button" onClick={() => editNote(note)}>
                                                                        <IconPencil className="w-4 h-4 ltr:mr-3 rtl:ml-3 shrink-0" />
                                                                        Edit
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button type="button" onClick={() => viewNote(note)}>
                                                                        <IconEye className="w-4.5 h-4.5 ltr:mr-3 rtl:ml-3 shrink-0" />
                                                                        View
                                                                    </button>
                                                                </li>
                                                            </ul>
                                                        </Dropdown>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold mt-4">
                                                        {note.title}
                                                        </h4>
                                                    <p className="text-white-dark mt-2">{note.description}</p>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-5 left-0 w-full px-5">
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="dropdown">
                                                        <button type="button" className='font-semibold text-white-dark btn' onClick={() => viewNote(note)}>
                                                        <IconEye className="w-4.5 h-4.5 ltr:mr-3 rtl:ml-3 shrink-0" />
                                                                        Open
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center sm:min-h-[300px] min-h-[400px] font-semibold text-lg h-full">No data available</div>
                    )}

                <Transition appear show={createTicket} as={Fragment}>
                <Dialog as="div" open={createTicket} onClose={() => setCreateTicket(false)} className="relative z-[51]">
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
                                        onClick={() => setCreateTicket(false)}
                                        className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                    >
                                        <IconX />
                                    </button>
                                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                        {params.id ? 'Edit Ticket' : 'Create a ticket'}
                                    </div>
                                    <div className="p-5">
                                    <form>
                                            {/* Initial State */}
                                            <div className='mb-5'>
                                                <label htmlFor='start'>Critical Summary (Reporting Operation)</label>
                                                <select id='start' className='form-select' onChange={(e) => changeValue(e)}>
                                                    <option value=''>Select Related</option>
                                                    <option value="Truck">Truck Operation</option>
                                                    <option value="Pit">Pit Operation</option>
                                                    <option value="Admin">Administrative Operation</option>
                                                    <option value="Other">Other operations</option>
                                                </select>
                                            </div>
                                            {/* Heavy Equipment ID */}
                                            <div className='flex justify-between mt-2'>
                                                <div className="mb-5" style={{display: params.start === 'Truck' ? 'block' : 'none'}}>
                                                    <label htmlFor="heavyEquipmentId">Heavy Equipment ID</label>
                                                    <select id="heavyEquipmentId" className="form-select" value={params.heavyEquipmentId} onChange={(e) => changeValue(e)}>
                                                        <option value="">Select HE ID</option>
                                                        {heavyEquipments.map((heavyEquipment) => (
                                                            <option key={heavyEquipment.id} value={heavyEquipment.id}>
                                                                {heavyEquipment.heavyEquipmentName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {/* Operator Name */}
                                                <div className="mb-5" style={{display: params.start === 'Truck' ? 'block' : 'none'}}>
                                                    <label htmlFor="operator">Operator's Name (optional)</label>
                                                    <select id="operator" className="form-select" value={params.operator} onChange={(e) => changeValue(e)}>
                                                        <option value="">Select Operator's Name</option>
                                                        {operators.map((operator) => (
                                                            <option key={operator.id} value={operator.id}>
                                                                {operator.operator}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            
                                            
                                            {/* Concerns Location */}
                                            <div className="mb-5" style={{display: params.start ==='Pit' || params.heavyEquipmentId || params. start === 'Admin' ? 'block' : 'none'}}>
                                                    <label htmlFor="location">Location Happening</label>
                                                    <select id="location" className="form-select" value={params.location} onChange={(e) => changeValue(e)}>
                                                        <option value="">Select location</option>
                                                        <option value="CUT2C">CUT2C</option>
                                                        <option value="CUT2B">CUT2B</option>
                                                        <option value="WASTE DUMP 4">WASTE DUMP 4</option>
                                                        <option value="VIEW POINT">VIEW POINT</option>
                                                        <option value="NEW TOWER">NEW TOWER</option>
                                                        <option value="BLOCK 5">BLOCK 5</option>
                                                        <option value="MINING OFFICE">MINING OFFICE</option>
                                                        <option value="HME">HME (AMAX OFFICE)</option>
                                                    </select>
                                                </div>


                                            {/* Pit Location */}
                                            <div className="mb-5" style={{display: params.start === 'Pit' ? 'block' : 'none'}}>
                                                <label htmlFor="title">Location</label>
                                                <input id="title" type="text" placeholder="Enter Location" className="form-input" value={params.title} onChange={(e) => changeValue(e)} />
                                            </div>

                                            {/* Other Operations */}
                                            <div className="mb-5" style={{display: params.start === 'Other' ? 'block' : 'none'}}>
                                                <label htmlFor="title">Other</label>
                                                <input id="title" type="text" placeholder="Other Related" className="form-input" value={params.title} onChange={(e) => changeValue(e)} />
                                            </div>

                                            {/* Activity Type Flow */}
                                            <div className="mb-5" style={{display: params.heavyEquipmentId || params.start === 'Pit' || params.start === 'Other' || params.start === 'Admin' ? 'block' : 'none'}}>
                                                <label htmlFor="purpose">Activity Type</label>
                                                <select id="purpose" className="form-select" value={params.purpose} onChange={(e) => changeValue(e)}>
                                                    <option value="">Select Type</option>
                                                    <option value="network">NETWORK</option>
                                                    <option value="dispatch">DISPATCH</option>
                                                    <option value="smart-cap">SMARTCAP</option>
                                                    <option value="power">SOLAR/POWER</option>
                                                    <option value="systems-admin">ADMINISTRATION</option>
                                                </select>
                                            </div>

                                            {/* SMARTCAP FLOW */}
                                            <div>
                                                 {/* smartcap Type */}
                                                <div className="mb-5" style={{ display: params.purpose === 'smart-cap' ? 'block' : 'none' }}>
                                                    <label htmlFor="issueTypeSmart">What type of SmartCap</label>
                                                    <select id="issueTypeSmart" className="form-select" value={params.issueTypeSmart} onChange={(e) => changeValue(e)}>
                                                        <option value="">Select Type</option>
                                                        <option value="issue">ISSUE</option>
                                                        <option value="request">REQUEST</option>
                                                        <option value="describe">OTHER</option>
                                                    </select>
                                                </div>

                                                {/* Issue Type flow */}
                                                <div className='flex justify-between mt-2'>
                                                    <div className="mb-5" style={{ display: params.issueTypeSmart === 'issue' ? 'block' : 'none' }}>
                                                        <label htmlFor="issue">Select Issue type</label>
                                                        <select id="issue" className="form-select" value={params.issue} onChange={(e) => changeValue(e)}>
                                                            <option value="">Select Type</option>
                                                            <option value="LifeDisplay">LIFE SCREEN</option>
                                                            <option value="Life band">LIFE BAND</option>
                                                            <option value="SmartCap Power">POWER</option>
                                                        </select>
                                                    </div>
                                                    {/* Life Screen */}
                                                    <div className="mb-5" style={{ display: params.issue === 'LifeDisplay' ? 'block' : 'none' }}>
                                                        <label htmlFor="issueDesc">Select Issue type</label>
                                                        <select id="issueDesc" className="form-select" value={params.issueDesc} onChange={(e) => changeValue(e)}>
                                                            <option value="">Select Type</option>
                                                            <option value="is on and off">ON/OFF</option>
                                                            <option value="is not responsive">SCREEN NOT RESPONSIVE</option>
                                                            <option value="needs re adjustment">RE ADJUST (eg: bolt loose, positioning)</option>
                                                        </select>
                                                    </div>
                                                    {/* Life Band */}
                                                    <div className="mb-5" style={{ display: params.issue === 'Life band' ? 'block' : 'none' }}>
                                                        <label htmlFor="issueDesc">Select Issue type</label>
                                                        <select id="issueDesc" className="form-select" value={params.issueDesc} onChange={(e) => changeValue(e)}>
                                                            <option value="">Select Type</option>
                                                            <option value="is poorly fitted">POORLY FITTED</option>
                                                            <option value="needs re-adjust">RE ADJUST</option>
                                                            <option value='is removed'>REMOVE</option>
                                                            <option value='cannot connect'>CANNOT CONNECT</option>
                                                            <option value='cannot charge'>CANNOT CHARGE</option>
                                                            <option value='connetion is unstable'>UNSTABLE CONNECTION</option>
                                                        </select>
                                                    </div>
                                                    {/* Power */}
                                                    <div className="mb-5" style={{ display: params.issue === 'SmartCap Power' ? 'block' : 'none' }}>
                                                        <label htmlFor="issueDesc">Select Issue type</label>
                                                        <select id="issueDesc" className="form-select" value={params.issueDesc} onChange={(e) => changeValue(e)}>
                                                            <option value="">Select Type</option>
                                                            <option value="is Off">OFF</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Request flow */}
                                                <div className='flex justify-between mt-2'>
                                                    <div className="mb-5" style={{ display: params.issueTypeSmart === 'request' ? 'block' : 'none' }}>
                                                        <label htmlFor="issue">Select Request type</label>
                                                        <select id="issue" className="form-select" value={params.issue} onChange={(e) => changeValue(e)}>
                                                            <option value="">Select Type</option>
                                                            <option value="Requests for LifeBand sensor spots">SENSOR DOT</option>
                                                            <option value="Requests for headBand strap">STRAP</option>
                                                            <option value="Requests for lifeBand">LIFE BAND</option>
                                                            <option value="Requests for travel case">LIFEBAND TRAVEL CASE</option>
                                                            <option value="Requests for removable sleeve">REMOVABLE SLEEVE</option>
                                                            <option value="Requests for lifeDisplay">LIFE SCREEN</option>
                                                            <option value="Requests for charger">CHARGER</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* DISPATCH FLOW */}
                                            <div>
                                                 {/* DISPATCH Type */}
                                                <div className="mb-5" style={{ display: params.purpose === 'dispatch' ? 'block' : 'none' }}>
                                                    <label htmlFor="issueTypeDisp">What type of incident operations</label>
                                                    <select id="issueTypeDisp" className="form-select" value={params.issueTypeDisp} onChange={(e) => changeValue(e)}>
                                                        <option value="">Select Type</option>
                                                        <option value="issue">ISSUE</option>
                                                        <option value="request">REQUEST</option>
                                                        <option value="administration">ADMINISTRATION</option>
                                                        <option value="describe">OTHER</option>
                                                    </select>
                                                </div>

                                                {/* Issue Type flow */}
                                                <div className='flex justify-between mt-2'>
                                                    <div className="mb-5" style={{ display: params.issueTypeDisp === 'issue' ? 'block' : 'none' }}>
                                                        <label htmlFor="issue">Select Issue operation</label>
                                                        <select id="issue" className="form-select" value={params.issue} onChange={(e) => changeValue(e)}>
                                                            <option value="">Select Type</option>
                                                            <option value="PTX Screen">PTX SCREEN</option>
                                                            <option value="GPS">GPS</option>
                                                            <option value="Antenna">ANTENNA</option>
                                                            <option value="Mount">MOUNT</option>
                                                            <option value="Communication">NETWORK</option>
                                                        </select>
                                                    </div>
                                                    {/* GPS */}
                                                    <div className="mb-5" style={{ display: params.issue === 'GPS' ? 'block' : 'none' }}>
                                                        <label htmlFor="issueDesc">Select GPS Issue type</label>
                                                        <select id="issueDesc" className="form-select" value={params.issueDesc} onChange={(e) => changeValue(e)}>
                                                            <option value="">Select Type</option>
                                                            <option value="is off">OFF</option>
                                                            <option value="cable is torn">CABLE TORN</option>
                                                            <option value="needs re adjustment">RE ADJUSTMENT</option>
                                                        </select>
                                                    </div>
                                                    {/* PTX Screen */}
                                                    <div className="mb-5" style={{ display: params.issue === 'PTX Screen' ? 'block' : 'none' }}>
                                                        <label htmlFor="issueDesc">Select Screen Issue type</label>
                                                        <select id="issueDesc" className="form-select" value={params.issueDesc} onChange={(e) => changeValue(e)}>
                                                            <option value="">Select Type</option>
                                                            <option value="is removed">NO SCREEN</option>
                                                            <option value="needs re-adjustment">RE ADJUST(eg: loose bolts, loose mount)</option>
                                                            <option value='is performing very slow'>SYSTEM SLOW</option>
                                                            <option value='is having touch issues'>SCREEN NOT RESPONSIVE</option>
                                                            <option value='is on and off'>ON/OFF</option>
                                                            <option value='has unstable comms'>UNSTABLE CONNECTION</option>
                                                            <option value="is off">SCREEN OFF</option>
                                                        </select>
                                                    </div>
                                                    {/* Power */}
                                                    <div className="mb-5" style={{ display: params.issue === 'Mount' ? 'block' : 'none' }}>
                                                        <label htmlFor="issueDesc">Select Mount type</label>
                                                        <select id="issueDesc" className="form-select" value={params.issueDesc} onChange={(e) => changeValue(e)}>
                                                            <option value="">Select Type</option>
                                                            <option value="needs re-adjustment">RE ADJUST(eg: loose bolts, loose mount)</option>
                                                            <option value="is broken">BROKEN</option>
                                                        </select>
                                                    </div>
                                                    {/* Comms */}
                                                    <div className="mb-5" style={{ display: params.issue === 'Communication' ? 'block' : 'none' }}>
                                                        <label htmlFor="issueDesc">Select Network issue type</label>
                                                        <select id="issueDesc" className="form-select" value={params.issueDesc} onChange={(e) => changeValue(e)}>
                                                            <option value="">Select Type</option>
                                                            <option value="is Off">OFF</option>
                                                            <option value="is unstable">UNSTABLE COMMS</option>
                                                        </select>
                                                    </div>
                                                    {/* Antenna */}
                                                    <div className="mb-5" style={{ display: params.issue === 'Antenna' ? 'block' : 'none' }}>
                                                        <label htmlFor="issueDesc">Select Antenna status</label>
                                                        <select id="issueDesc" className="form-select" value={params.issueDesc} onChange={(e) => changeValue(e)}>
                                                            <option value="">Select Status</option>
                                                            <option value="is broken">ATENNA BROKEN</option>
                                                            <option value="needs re adjustment">RE ADJUST</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Request flow */}
                                                <div className='flex justify-between mt-2'>
                                                    <div className="mb-5" style={{ display: params.issueTypeDisp === 'request' ? 'block' : 'none' }}>
                                                        <label htmlFor="issue">Select Request Operation</label>
                                                        <select id="issue" className="form-select" value={params.issue} onChange={(e) => changeValue(e)}>
                                                            <option value="">Select Type</option>
                                                            <option value="Requests for new bullet radio">NEW BULLET RADIO</option>
                                                            <option value="Requests for new antenna">NEW ANTENNA</option>
                                                            <option value="Requests for new screen">NEW SCREEN</option>
                                                            <option value="Requests for dispatch mount">MOUNT</option>
                                                            <option value="Requests for new dispatch installation">DISPATCH TRUCK INSTALLATION</option>
                                                            <option value="Requests for new dispatch application installation">DISPATCH APPLICATION INSTALLATION</option>
                                                            <option value="Requests for new GPS">GPS</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Request flow */}
                                            <div className='flex justify-between mt-2'>
                                                    <div className="mb-5" style={{ display: params.issueTypeDisp === 'administration' ? 'block' : 'none' }}>
                                                        <label htmlFor="issue">Select Request Operation</label>
                                                        <select id="issue" className="form-select" value={params.issue} onChange={(e) => changeValue(e)}>
                                                            <option value="">Select Type</option>
                                                            <option value="Requests for new bullet radio">NEW BULLET RADIO</option>
                                                            <option value="Requests for new antenna">NEW ANTENNA</option>
                                                            <option value="Requests for new screen">NEW SCREEN</option>
                                                            <option value="Requests for dispatch mount">MOUNT</option>
                                                            <option value="Requests for new dispatch installation">DISPATCH TRUCK INSTALLATION</option>
                                                            <option value="Requests for new dispatch application installation">DISPATCH APPLICATION INSTALLATION</option>
                                                            <option value="Requests for new GPS">GPS</option>
                                                        </select>
                                                    </div>
                                                </div>

                                            {/* priority */}
                                            <div className="mb-5" style={{display: params.issueDesc || params.issue || params.issueTypeDisp === 'describe' ? 'block' : 'none'}}>
                                                    <label htmlFor="priority">Priority State</label>
                                                    <select id="priority" className="form-select" value={params.priority} onChange={(e) => changeValue(e)}>
                                                        <option value="">Select</option>
                                                        <option value="low">Low</option>
                                                        <option value="medium">Medium</option>
                                                        <option value="high">High</option>
                                                    </select>
                                                </div>
                                                
                                            {/* comments */}
                                            <div className="mb-5" style={{display: params.priority ? 'block' : 'none'}}>
                                                <label htmlFor="description">Comment (optional)</label>
                                                <textarea
                                                    id="description"
                                                    rows={3}
                                                    className="form-textarea resize-none min-h-[130px]"
                                                    placeholder="Enter any coments"
                                                    value={params.description}
                                                    onChange={(e) => changeValue(e)}
                                                ></textarea>
                                            </div>
                                            <div className="flex justify-end items-center mt-8">
                                                <button type="button" className="btn btn-outline-danger gap-2" onClick={() => setCreateTicket(false)}>
                                                    Cancel
                                                </button>
                                                <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={saveNote}>
                                                    Create Ticket
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

                    <Transition appear show={isViewNoteModal} as={Fragment}>
                        <Dialog as="div" open={isViewNoteModal} onClose={() => setIsViewNoteModal(false)} className="relative z-[51]">
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
                                                onClick={() => setIsViewNoteModal(false)}
                                                className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                            >
                                                <IconX />
                                            </button>
                                            <div className="flex items-center flex-wrap gap-2 text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                                <div className="ltr:mr-3 rtl:ml-3">{params.title}</div>
                                                {params.tag && (
                                                    <button
                                                        type="button"
                                                        className={`badge badge-outline-primary rounded-3xl capitalize ltr:mr-3 rtl:ml-3 ${
                                                            (params.tag === '-SYSTEMS-ENGINEER' && 'shadow-primary',
                                                            params.tag === 'DISPATCH' && 'shadow-warning')
                                                        }`}
                                                    >
                                                        {params.tag}
                                                    </button>
                                                )}
                                                {params.isComplete && (
                                                    <button type="button" className="text-success">
                                                        <IconMoodSmile className="fill-success align-center" />
                                                        Completed
                                                    </button>
                                                )}
                                                <div className="ltr:mr-3 rtl:ml-3">Assignee: {`${params.assignee1}${' '}${params.assignee2}`}</div>
                                            </div>
                                            <div className="p-5">
                                                <div className="text-base">{params.description}</div>

                                                <div className="ltr:text-right rtl:text-left mt-8">
                                                    {
                                                        params.progress === 'new' ? (
                                                            <button type="button" className="btn btn-outline-warning" onClick={() => startProgress(params)}>
                                                                Start progress
                                                            </button>
                                                        ) : params.progress === 'in-progress' ? (
                                                            <button type="button" className="btn btn-outline-success" onClick={() => completeProgress(params)}>
                                                                Complete project
                                                            </button>
                                                        ) : params.isComplete === true ? (
                                                            <button type="button" className="btn btn-outline-danger" onClick={() => setIsViewNoteModal(false)}>
                                                                Close
                                                            </button>
                                                        ) : (
                                                            <button type="button" className="btn btn-outline-danger" onClick={() => setIsViewNoteModal(false)}>
                                                                Close
                                                            </button>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        </Dialog.Panel>
                                    </Transition.Child>
                                </div>
                            </div>
                        </Dialog>
                    </Transition>
                </div>
            </div>
        </div>
    );
};

export default Issues;
