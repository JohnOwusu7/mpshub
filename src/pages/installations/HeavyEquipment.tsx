import React, { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../Api/apiConfig';
import { Dialog, Transition } from '@headlessui/react';
import IconX from '../../components/Icon/IconX';
import Swal from 'sweetalert2';

interface HeavyEquipment {
    _id: string;
    heavyEquipmentName: string;
    status: string;
}

const HeavyEquipment: React.FC = () => {
    const defaultParams: HeavyEquipment = { _id: '', heavyEquipmentName: '', status: '' };
    const [params, setParams] = useState<HeavyEquipment>({ ...defaultParams });
    const [addTruck, setAddTruck] = useState<boolean>(false);
    const [trucks, setTrucks] = useState<HeavyEquipment[]>([]);
    const [editingTruckId, setEditingTruckId] = useState<string | null>(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchTrucks();
    }, []);

    const fetchTrucks = async () => {
        try {
            const response = await axios.get(`${API_CONFIG.baseURL}${API_CONFIG.heavyEquipments.endpoints.list}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setTrucks(response.data);
        } catch (error) {
            console.error("Error fetching Trucks", error);
        }
    };

    const changeValue = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { value, id } = e.target;
        setParams({ ...params, [id]: value });
    };

    const AddTruckFunction = async () => {
        if (!params.heavyEquipmentName) {
            showMessage('Please enter Truck ID', 'error');
            return;
        }

        try {
            if (editingTruckId) {
                // Update existing truck
                await axios.put(`${API_CONFIG.baseURL}${API_CONFIG.heavyEquipments.endpoints.edit}/${editingTruckId}`, params, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                showMessage('Truck updated successfully');
            } else {
                // Add new truck
                await axios.post(`${API_CONFIG.baseURL}${API_CONFIG.heavyEquipments.endpoints.add}`, params, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                showMessage('Truck added successfully');
            }
            setAddTruck(false);
            setEditingTruckId(null);
            fetchTrucks(); // Refresh truck list
        } catch (error) {
            console.error('Error saving Truck:', error);
            showMessage('Error saving Truck. Please try again later.', 'error');
        }
    };

    const handleEdit = (truckId: string) => {
        const truckToEdit = trucks.find(truck => truck._id === truckId);
        if (truckToEdit) {
            setParams({
                _id: truckToEdit._id,
                heavyEquipmentName: truckToEdit.heavyEquipmentName,
                status: truckToEdit.status,
            });
            setEditingTruckId(truckId);
            setAddTruck(true); // Open the dialog for editing
        }
    };

    const handleDelete = async (truckId: string) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this truck?");
        if (confirmDelete) {
            try {
                await axios.delete(`${API_CONFIG.baseURL}${API_CONFIG.heavyEquipments.endpoints.delete}/${truckId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                showMessage('Truck deleted successfully');
                // Update trucks list after delete
                const updatedTrucks = trucks.filter(truck => truck._id !== truckId);
                setTrucks(updatedTrucks);
            } catch (error) {
                console.error('Error deleting Truck:', error);
                showMessage('Error deleting Truck. Please try again later.', 'error');
            }
        }
    };

    const showMessage = (msg: string = '', type: 'success' | 'error' = 'success') => {
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
        <div className='p-2'>
            <h2 className='text-2xl font mb-4 text-bold'>Trucks List</h2>
            <button className='bg-blue-500 hover:bg-gray-300 hover:text-blue-500 text-white font-bold py-2 px-4 rounded' onClick={() => { setParams(defaultParams); setAddTruck(true); }}>Add New Truck</button>
            <div className='pt-5'>
                <table className='min-w-full bg-white border-gray-400'>
                    <thead>
                        <tr>
                            <th className='py-2 px-4 border-b'>Equipment Name</th>
                            <th className='py-2 px-4 border-b'>Truck Status</th>
                            <th className='py-2 px-4 border-b'>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trucks.map((truck, index) => (
                            <tr key={index}>
                                <td className='py-2 px-4 border-b'>{truck.heavyEquipmentName}</td>
                                <td className='py-2 px-4 border-b'>{truck.status}</td>
                                <td className='py-2 px-4 border-b'>
                                    <button className="text-blue-600 hover:text-blue-900 mr-2 bg-green-400 px-4 rounded-full" onClick={() => handleEdit(truck._id)}>Edit</button>
                                    <button className="text-red-600 hover:text-red-900 bg-red-200 px-4 rounded-full" onClick={() => handleDelete(truck._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Transition appear show={addTruck} as={Fragment}>
                <Dialog as="div" open={addTruck} onClose={() => { setAddTruck(false); setParams(defaultParams); }} className="relative z-[51]">
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
                                        onClick={() => { setAddTruck(false); setParams(defaultParams); }}
                                        className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                    >
                                        <IconX />
                                    </button>
                                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                        {editingTruckId ? 'Edit Truck' : 'Add a new Truck'}
                                    </div>
                                    <div className="p-5">
                                        <form>
                                            <div className="mb-5">
                                                <label htmlFor="heavyEquipmentName">Truck ID</label>
                                                <input id="heavyEquipmentName" type="text" placeholder="Enter Truck ID" className="form-input" value={params.heavyEquipmentName} onChange={changeValue} />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="status">Truck status</label>
                                                <select id="status" className="form-select" value={params.status} onChange={changeValue}>
                                                    <option value="">Select status</option>
                                                    <option value="ON SITE">On Site</option>
                                                    <option value="DOWN">Down</option>
                                                </select>
                                            </div>
                                            <div className="flex justify-end items-center mt-8">
                                                <button type="button" className="btn btn-outline-danger gap-2" onClick={() => { setAddTruck(false); setParams(defaultParams); }}>
                                                    Cancel
                                                </button>
                                                <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={AddTruckFunction}>
                                                    {editingTruckId ? 'Update Truck' : 'Add Truck'}
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

export default HeavyEquipment;
