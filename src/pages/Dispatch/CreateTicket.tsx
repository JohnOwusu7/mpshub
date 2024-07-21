import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import IconX from '../../components/Icon/IconX';
import IconPlus from '../../components/Icon/IconPlus';
import { API_CONFIG } from '../../Api/apiConfig';
import axios from 'axios';
import Swal from 'sweetalert2';

const CreateTicket = () => {
    const [createTicket, setCreateTicket] = useState(false);
    const defaultParams = { id: null, heavyEquipmentId: '', title: '', description: '', priority: '', user: '', issue: '', issueDesc: '', operator: '',};
    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultParams)));
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

    const logCall = async () => {
        // if (!params.title) {
        //     showMessage('Title is required.', 'error');
        //     return false;
        // }

        // Rename the 'description' field to 'descriptionText'
        params.descriptionText = params.description;
        try {
            // Send the request to add/update the note
            // await axios.post(`${API_CONFIG.baseURL}${API_CONFIG.issues.endpoints.add}`, params, {
            //     headers: {
            //         Authorization: `Bearer ${token}`
            //     }
            // });
            console.log('Issue Logs:', params)

            showMessage('Ticket Sent successfully.');
            setCreateTicket(false);
        } catch (error) {
            console.error('Error saving note:', error);
            showMessage('Error reporting Please try again later.', 'error');
        }
    };

    const changeValue = (e: any) => {
        const { value, id } = e.target;
        setParams({ ...params, [id]: value });
    };

    const createTicketFunction = (note: any = null) => {
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

    return (
        <div>
            <div className='text-3xl'>
                {/* <button className="btn btn-primary" type="button" onClick={() => createTicketFunction()}> */}
                    <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2 shrink-0 " />
                    {/* Create A ticket */}
                    SYSTEM UNDER MAINTENANCE, YOU WILL GET NOTICED SOON - BY EDWIN ODURO
                {/* </button> */}
                <img src="/maintanance.png" alt="image" className="w-80% h-20% object-cover" />
            </div>
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
                                            <div className="mb-5" style={{display: params.heavyEquipmentId || params.start === 'pit' || params.start === 'other' ? 'block' : 'none'}}>
                                                <label htmlFor="purpose">Activity Type</label>
                                                <select id="purpose" className="form-select" value={params.purpose} onChange={(e) => changeValue(e)}>
                                                    <option value="">Select Type</option>
                                                    <option value="network">Network</option>
                                                    <option value="dispatch">Dispatch</option>
                                                    <option value="smart-cap">SMARTCAP</option>
                                                    <option value="power">Solar/Power</option>
                                                    <option value="systems-admin">Systems Admin</option>
                                                    <option value="improvement">Improvement</option>
                                                </select>
                                            </div>
                                            {/* smartcap Type */}
                                            <div className="mb-5" style={{ display: params.purpose === 'smart-cap' ? 'block' : 'none' }}>
                                                <label htmlFor="issueType">What type of SmartCap</label>
                                                <select id="issueType" className="form-select" value={params.issueType} onChange={(e) => changeValue(e)}>
                                                    <option value="">Select Type</option>
                                                    <option value="issue">ISSUE</option>
                                                    <option value="request">REQUEST</option>
                                                </select>
                                            </div>

                                            {/* Issue Type flow */}
                                            <div className='flex justify-between mt-2'>
                                                <div className="mb-5" style={{ display: params.issueType === 'issue' ? 'block' : 'none' }}>
                                                    <label htmlFor="issue">Select Issue type</label>
                                                    <select id="issue" className="form-select" value={params.issue} onChange={(e) => changeValue(e)}>
                                                        <option value="">Select Type</option>
                                                        <option value="Life Screen">LIFE SCREEN</option>
                                                        <option value="Life band">LIFE BAND</option>
                                                        <option value="Power">POWER</option>
                                                    </select>
                                                </div>
                                                <div className="mb-5" style={{ display: params.issue === 'Life Screen' ? 'block' : 'none' }}>
                                                <label htmlFor="issueDesc">Select Issue type</label>
                                                <select id="issueDesc" className="form-select" value={params.issueDesc} onChange={(e) => changeValue(e)}>
                                                    <option value="">Select Type</option>
                                                    <option value="is on and off">ON/OFF</option>
                                                    <option value="is not responsive">SCREEN NOT RESPONSIVE</option>
                                                </select>
                                                </div>
                                                <div className="mb-5" style={{ display: params.issue === 'Life band' ? 'block' : 'none' }}>
                                                <label htmlFor="issueDesc">Select Issue type</label>
                                                <select id="issueDesc" className="form-select" value={params.issueDesc} onChange={(e) => changeValue(e)}>
                                                    <option value="">Select Type</option>
                                                    <option value="is poorly fitted">POORLY FITTED</option>
                                                    <option value="needs re-adjust">RE ADJUST</option>
                                                    <option value='is removed'>REMOVE</option>
                                                </select>
                                                </div>
                                            </div>

                                            <div className='flex justify-between mt-2'>
                                            {/* priority */}
                                            <div className="mb-5" style={{display: params.issueDesc || params.issue ==='Power' ? 'block' : 'none'}}>
                                                <label htmlFor="priority">Priority State</label>
                                                <select id="priority" className="form-select" value={params.priority} onChange={(e) => changeValue(e)}>
                                                    <option value="">Select</option>
                                                    <option value="low">Low</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="high">High</option>
                                                </select>
                                            </div>
                                            {/* Concerns Location */}
                                            <div className="mb-5" style={{display: params.priority ? 'block' : 'none'}}>
                                                <label htmlFor="location">Location Happening</label>
                                                <select id="location" className="form-select" value={params.location} onChange={(e) => changeValue(e)}>
                                                    <option value="">Select location</option>
                                                    <option value="CUT2C">CUT2C</option>
                                                    <option value="CUT2B">CUT2B</option>
                                                    <option value="WASTE DUMP 4">WASTE DUMP 4</option>
                                                    <option value="VIEW POINT">VIEW POINT</option>
                                                    <option value="NEW TOWER">NEW TOWER</option>
                                                    <option value="BLOCK 5">BLOCK 5</option>
                                                </select>
                                            </div>
                                            </div>

                                            {/* comments */}
                                            <div className="mb-5" style={{display: params.location ? 'block' : 'none'}}>
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
                                                <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={logCall}>
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
        </div>
    );
};

export default CreateTicket;
