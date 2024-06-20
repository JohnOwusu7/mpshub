import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import IconX from '../../components/Icon/IconX';
import IconPlus from '../../components/Icon/IconPlus';
import { API_CONFIG } from '../../Api/apiConfig';
import axios from 'axios';
import Swal from 'sweetalert2';

const CreateTicket = () => {
    const [createTicket, setCreateTicket] = useState(false)
    const defaultParams = { id: null, heavyEquipmentId: '', title: '', description: '', priority: '', user: '' };
    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultParams)))
    const [heavyEquipments, setHeavyEquipments] = useState<any[]>([]);
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

    const logCall = async () => {
        if (!params.title) {
            showMessage('Title is required.', 'error');
            return false;
        }

        // Rename the 'description' field to 'descriptionText'
        params.descriptionText = params.description;
        try {
            // Send the request to add/update the note
            await axios.post(`${API_CONFIG.baseURL}${API_CONFIG.issues.endpoints.add}`, params, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

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
            <div>
                <button className="btn btn-primary" type="button" onClick={() => createTicketFunction()}>
                    <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2 shrink-0" />
                    Create A ticket
                </button>
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
                                            <div className="mb-5">
                                                <label htmlFor="heavyEquipmentId">Equipment ID (Trucks Issues Only)</label>
                                                <select id="heavyEquipmentId" className="form-select" value={params.heavyEquipmentId} onChange={(e) => changeValue(e)}>
                                                    <option value="">Select Equipment ID</option>
                                                    {heavyEquipments.map((heavyEquipment) => (
                                                        <option key={heavyEquipment.id} value={heavyEquipment.id}>
                                                            {heavyEquipment.heavyEquipmentName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="title">Title</label>
                                                <input id="title" type="text" placeholder="Enter Title" className="form-input" value={params.title} onChange={(e) => changeValue(e)} />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="purpose">Activity Type</label>
                                                <select id="purpose" className="form-select" value={params.purpose} onChange={(e) => changeValue(e)}>
                                                    <option value="">Select Type</option>
                                                    <option value="network">Network</option>
                                                    <option value="dispatch">Dispatch</option>
                                                    <option value="smart-cap">Smart Cap</option>
                                                    <option value="power">Solar/Power</option>
                                                    <option value="systems-admin">Systems Admin</option>
                                                    <option value="improvement">Improvement</option>
                                                </select>
                                            </div>
                                            {/* priority */}
                                            <div className="mb-5">
                                                <label htmlFor="priority">Priority</label>
                                                <select id="priority" className="form-select" value={params.priority} onChange={(e) => changeValue(e)}>
                                                    <option value="">Select</option>
                                                    <option value="low">Low</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="high">High</option>
                                                </select>
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="description">Description</label>
                                                <textarea
                                                    id="description"
                                                    rows={3}
                                                    className="form-textarea resize-none min-h-[130px]"
                                                    placeholder="Enter Description"
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
