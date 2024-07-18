import React, { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../Api/apiConfig';
import { Dialog, Transition } from '@headlessui/react';
import IconX from '../../components/Icon/IconX';
import Swal from 'sweetalert2';

interface Operator {
    _id: string;
    operator: string;
    status: string;
}

const Operators: React.FC = () => {
    const defaultParams: Operator = { _id: '', operator: '', status: '' };
    const [params, setParams] = useState<Operator>({ ...defaultParams });
    const [addOperator, setAddOperator] = useState<boolean>(false);
    const [operators, setOperators] = useState<Operator[]>([]);
    const [editingOperatorId, setEditingOperatorId] = useState<string | null>(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchOperators();
    }, []);

    const fetchOperators = async () => {
        try {
            const response = await axios.get(`${API_CONFIG.baseURL}${API_CONFIG.operators.endpoints.list}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setOperators(response.data);
        } catch (error) {
            console.error("Error fetching Operators", error);
        }
    };

    const changeValue = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { value, id } = e.target;
        setParams({ ...params, [id]: value });
    };

    const AddOperatorFunction = async () => {
        if (!params.operator) {
            showMessage('Please enter Operator Name', 'error');
            return;
        }

        try {
            if (editingOperatorId) {
                // Update existing Operator
                await axios.put(`${API_CONFIG.baseURL}${API_CONFIG.operators.endpoints.edit}/${editingOperatorId}`, params, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                showMessage('Operator updated successfully');
            } else {
                // Add new Operator
                await axios.post(`${API_CONFIG.baseURL}${API_CONFIG.operators.endpoints.add}`, params, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                showMessage('Operator added successfully');
            }
            setAddOperator(false);
            setEditingOperatorId(null);
            fetchOperators(); // Refresh operator list
        } catch (error) {
            console.error('Error saving Operator:', error);
            showMessage('Error saving Operator. Please try again later.', 'error');
        }
    };

    const handleEdit = (operatorId: string) => {
        const operatorToEdit = operators.find(operator => operator._id === operatorId);
        if (operatorToEdit) {
            setParams({
                _id: operatorToEdit._id,
                operator: operatorToEdit.operator,
                status: operatorToEdit.status,
            });
            setEditingOperatorId(operatorId);
            setAddOperator(true); // Open the dialog for editing
        }
    };

    const handleDelete = async (operatorId: string) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this operator?");
        if (confirmDelete) {
            try {
                await axios.delete(`${API_CONFIG.baseURL}${API_CONFIG.operators.endpoints.delete}/${operatorId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                showMessage('Operator deleted successfully');
                // Update operators list after delete
                const updatedOperators = operators.filter(operator => operator._id !== operatorId);
                setOperators(updatedOperators);
            } catch (error) {
                console.error('Error deleting Operator:', error);
                showMessage('Error deleting Operator. Please try again later.', 'error');
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
            <h2 className='text-2xl font mb-4 text-bold'>Operators List</h2>
            <button className='bg-blue-500 hover:bg-gray-300 hover:text-blue-500 text-white font-bold py-2 px-4 rounded' onClick={() => { setParams(defaultParams); setAddOperator(true); }}>Add New Operator</button>
            <div className='pt-5'>
                <table className='min-w-full bg-white border-gray-400'>
                    <thead>
                        <tr>
                            <th className='py-2 px-4 border-b'>Operator Name</th>
                            <th className='py-2 px-4 border-b'>Operator Status</th>
                            <th className='py-2 px-4 border-b'>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {operators.map((operator, index) => (
                            <tr key={index}>
                                <td className='py-2 px-4 border-b'>{operator.operator}</td>
                                <td className='py-2 px-4 border-b'>{operator.status}</td>
                                <td className='py-2 px-4 border-b'>
                                    <button className="text-blue-600 hover:text-blue-900 mr-2 bg-green-400 px-4 rounded-full" onClick={() => handleEdit(operator._id)}>Edit</button>
                                    <button className="text-red-600 hover:text-red-900 bg-red-200 px-4 rounded-full" onClick={() => handleDelete(operator._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Transition appear show={addOperator} as={Fragment}>
                <Dialog as="div" open={addOperator} onClose={() => { setAddOperator(false); setParams(defaultParams); }} className="relative z-[51]">
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
                                        onClick={() => { setAddOperator(false); setParams(defaultParams); }}
                                        className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                    >
                                        <IconX />
                                    </button>
                                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                        {editingOperatorId ? 'Edit Operator' : 'Add a new Operator'}
                                    </div>
                                    <div className="p-5">
                                        <form>
                                            <div className="mb-5">
                                                <label htmlFor="operator">Operator's Name</label>
                                                <input id="operator" type="text" placeholder="Enter Operator's Name" className="form-input" value={params.operator} onChange={changeValue} />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="status">Operator status</label>
                                                <select id="status" className="form-select" value={params.status} onChange={changeValue}>
                                                    <option value="">Select status</option>
                                                    <option value="ACTIVE">ACTIVE</option>
                                                    <option value="INACTIVE">INACTIVE</option>
                                                </select>
                                            </div>
                                            <div className="flex justify-end items-center mt-8">
                                                <button type="button" className="btn btn-outline-danger gap-2" onClick={() => { setAddOperator(false); setParams(defaultParams); }}>
                                                    Cancel
                                                </button>
                                                <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={AddOperatorFunction}>
                                                    {editingOperatorId ? 'Update Operator' : 'Add Operator'}
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

export default Operators;
