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
    const [loading, setLoading] = useState<boolean>(false);
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
            setLoading(true);
            // Send the request to add/update the note
            await axios.post(`${API_CONFIG.baseURL}${API_CONFIG.issues.endpoints.add}`, params, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            // console.log('Issue Logs:', params)

            showMessage('Ticket Sent successfully.');
            setCreateTicket(false);
        } catch (error) {
            console.error('Error saving note:', error);
            showMessage('Error reporting Please try again later.', 'error');
        } finally {
            setLoading(false);
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
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="loader">Loading...</div>
                </div>
            ) : (
                <>
            <div className='text-3xl'>
                <button className="btn btn-primary" type="button" onClick={() => createTicketFunction()}>
                    <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2 shrink-0 " />
                    Create A ticket
                    {/* SYSTEM UNDER MAINTENANCE, YOU WILL GET NOTICED SOON */}
                </button>
                {/* <img src="/maintanance.png" alt="image" className="w-80% h-20% object-cover" /> */}
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
                                                        <option value="CUT2A">CUT2A</option>
                                                        <option value="CUT2B">CUT2B</option>
                                                        <option value="CUT2C">CUT2C</option>
                                                        <option value="WASTE DUMP 4">WASTE DUMP 4</option>
                                                        <option value="VIEW POINT">VIEW POINT</option>
                                                        <option value="NEW TOWER">NEW TOWER</option>
                                                        <option value="AJOPA">AJOPA</option>
                                                        <option value="BLOCK 5">BLOCK 5</option>
                                                        <option value="MINING OFFICE">MINING OFFICE</option>
                                                        <option value="HME">HME (AMAX OFFICE)</option>
                                                    </select>
                                                </div>

                                            {/* Other Operations */}
                                            <div className="mb-5" style={{display: params.start === 'Other' ? 'block' : 'none'}}>
                                                <label htmlFor="title">Title</label>
                                                <input id="title" type="text" placeholder="Other Related" className="form-input" value={params.title} onChange={(e) => changeValue(e)} />
                                            </div>

                                            {/* Activity Type Flow */}
                                            <div className="mb-5" style={{display: params.heavyEquipmentId || params.start === 'Pit' || params.start === 'Admin' ? 'block' : 'none'}}>
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

                                            {/* NETWORK FLOW */}
                                            <div>
                                                 {/* NETWORK Type */}
                                                <div className="mb-5" style={{ display: params.purpose === 'network' ? 'block' : 'none' }}>
                                                    <label htmlFor="issueTypeNetwork">What type of incident operations</label>
                                                    <select id="issueTypeNetwork" className="form-select" value={params.issueTypeDisp} onChange={(e) => changeValue(e)}>
                                                        <option value="">Select Type</option>
                                                        <option value="issue">ISSUE</option>
                                                        <option value="request">REQUEST</option>
                                                        <option value="administration">ADMINISTRATION</option>
                                                        <option value="describe">OTHER</option>
                                                    </select>
                                                </div>

                                                {/* Issue Type flow */}
                                                <div className='flex justify-between mt-2'>
                                                    <div className="mb-5" style={{ display: params.issueTypeNetwork === 'issue' ? 'block' : 'none' }}>
                                                        <label htmlFor="issue">Select Issue operation</label>
                                                        <select id="issue" className="form-select" value={params.issue} onChange={(e) => changeValue(e)}>
                                                            <option value="">Select Type</option>
                                                            <option value="Radio">RADIO</option>
                                                            <option value="Network">NETWORK</option>
                                                        </select>
                                                    </div>
                                                    {/* Radio Screen */}
                                                    <div className="mb-5" style={{ display: params.issue === 'Radio' ? 'block' : 'none' }}>
                                                        <label htmlFor="issueDesc">Select Radio Issue type</label>
                                                        <select id="issueDesc" className="form-select" value={params.issueDesc} onChange={(e) => changeValue(e)}>
                                                            <option value="">Select Type</option>
                                                            <option value="communication is off">NO COMMS</option>
                                                            <option value="communication is on and off">ON AND OFF</option>
                                                            <option value='communication delays'>DELAYS</option>
                                                            <option value='is not working'>NOT WORKING</option>
                                                        </select>
                                                    </div>
                                                    {/* Comms */}
                                                    <div className="mb-5" style={{ display: params.issue === 'Network' ? 'block' : 'none' }}>
                                                        <label htmlFor="issueDesc">Select Network issue type</label>
                                                        <select id="issueDesc" className="form-select" value={params.issueDesc} onChange={(e) => changeValue(e)}>
                                                            <option value="">Select Type</option>
                                                            <option value="is Off">OFF</option>
                                                            <option value="is unstable">UNSTABLE COMMS</option>
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
                                            <div className="mb-5" style={{display: params.issueDesc || params.issue || params.issueTypeDisp === 'describe' || params.title ? 'block' : 'none'}}>
                                                    <label htmlFor="priority">Priority State</label>
                                                    <select id="priority" className="form-select" value={params.priority} onChange={(e) => changeValue(e)}>
                                                        <option value="">Select</option>
                                                        <option value="low">Low</option>
                                                        <option value="medium">Medium</option>
                                                        <option value="high">High</option>
                                                    </select>
                                            </div>

                                            {/* Other comments */}
                                            <div className="mb-5" style={{display: params.title && params.priority ? 'block' : 'none'}}>
                                                <label htmlFor="description">Describe Other related</label>
                                                    <textarea
                                                        id="description"
                                                        rows={3}
                                                        className="form-textarea resize-none min-h-[130px]"
                                                        placeholder="Enter other descriptions"
                                                        value={params.description}
                                                        onChange={(e) => changeValue(e)}
                                                    ></textarea>   
                                            </div>
                                                
                                            {/* comments */}
                                            <div className="mb-5" style={{display: params.priority && !params.title ? 'block' : 'none'}}>
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
            </>
            )}
        </div>
    );
};

export default CreateTicket;
