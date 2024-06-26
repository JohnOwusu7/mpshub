import React, { useState, Fragment, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import axios from 'axios';

import IconUserPlus from '../../components/Icon/IconUserPlus';
import IconSearch from '../../components/Icon/IconSearch';
import IconX from '../../components/Icon/IconX';
import { API_CONFIG } from '../../Api/apiConfig';

interface User {
  [x: string]: any;
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  position: string;
  identityNo: string;
  status: string;
  password: string;
}

const Users: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);
  const [role, setRole] = useState<string>('');


  useEffect(() => {
    dispatch(setPageTitle('Users'));

    const fetchUsers = async () => {
      try {
        const response = await axios.get<User[]>(`${API_CONFIG.baseURL}${API_CONFIG.users.endpoints.list}`);
        setUsers(response.data);
        setLoading(false);
        setUserList(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [dispatch]);

  const [addUserModal, setAddUserModal] = useState<boolean>(false);

  const [defaultParams] = useState<User>({
    _id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    position: '',
    identityNo: '',
    status: '',
    password: ''
  });

  const [params, setParams] = useState<User>({ ...defaultParams });

  const changeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, id } = e.target;
    setParams({ ...params, [id]: value });
  };

  const [search, setSearch] = useState<string>('');
  const [userList, setUserList] = useState<User[]>([]);

  const [filteredItems, setFilteredItems] = useState<User[]>(userList);
  useEffect(() => {
    setFilteredItems(() => {
      return userList.filter((item: User) => {
        return (
          item.firstName.toLowerCase().includes(search.toLowerCase()) ||
          item.lastName.toLowerCase().includes(search.toLowerCase()) ||
          item.email.toLowerCase().includes(search.toLowerCase()) ||
          item.identityNo.toLowerCase().includes(search.toLowerCase()) ||
          item.phone.toLowerCase().includes(search.toLowerCase()) ||
          item.role.toLowerCase().includes(search.toLowerCase())
        );
      });
    });
  }, [search, userList]);

  const saveUser = async () => {
    if (!params.firstName || !params.lastName || !params.email || !params.phone || !role || !params.identityNo || !params.position) {
      showMessage('Please fill in all required fields.', 'error');
      return;
    }

    if (!params._id) {
      params.password = 'admin@abc';
      params.role = role;
    }

    try {
      if (params._id) {
        let updatedUser = { ...params, role: role };
        await axios.put(`${API_CONFIG.baseURL}/users/${params._id}/update`, updatedUser);
        showMessage('User has been updated successfully.');
        navigate('/users/list');
      } else {
        await axios.post(`${API_CONFIG.baseURL}${API_CONFIG.users.endpoints.add}`, params);
        showMessage('User has been added successfully.');
        navigate('/users/list');
      }

      const response = await axios.get<User[]>(`${API_CONFIG.baseURL}${API_CONFIG.users.endpoints.list}`);
      setUsers(response.data);

      setAddUserModal(false);
    } catch (error) {
      console.error('Error saving user:', error);
      showMessage('Failed to save user. Please try again.', 'error');
    }
  };

  const editUser = (user: User | null = null) => {
    const editedParams = {
        ...defaultParams,
        role: user ? user.role : role
    };

    if (user) {
        setParams({ ...user }); // Update the params with user object
    } else {
        setParams(editedParams); // Set the params with the editedParams object
    }

    setAddUserModal(true); // Open the Add User modal
};

const deleteUser = async (user: User | null = null) => {
    if (!user) {
        showMessage('Invalid user selected for deletion.', 'error');
        return;
    }

    try {
        // Make the necessary API call to delete the user
        await axios.delete(`${API_CONFIG.baseURL}/users/${user._id}`);

        // Update the user list after deletion using the function form of setUsers
        setUsers(prevUsers => prevUsers.filter(u => u._id !== user._id));

        showMessage('User has been deleted successfully.');
    } catch (error) {
        console.error('Error deleting user:', error);
        showMessage('Failed to delete user. Please try again.', 'error');
    }
};



  const showMessage = (msg: string = '', type: string = 'success') => {
    const toast: any = Swal.mixin({
      toast: true,
      position: 'top',
      showConfirmButton: false,
      timer: 3000,
      customClass: { container: 'toast' },
    });
    toast.fire({
      icon: type as any,
      title: msg,
      padding: '10px 20px',
    });
  };

  const roleList = ['ADMIN', 'SYSTEMS-ENGINEER', 'DISPATCH', 'RAMJACK', 'AFRIYIE', 'BENEWISE', 'GEOTECH', 'MANAGER'];

  return (
    <div>
        <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link to="#" className="text-primary hover:underline">
                        Users
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Lists</span>
                </li>
            </ul>
       <div className="flex items-center justify-between flex-wrap gap-4">
                 <h2 className="text-xl">Users</h2>
                 <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                     <div className="flex gap-3">
                         <div>
                             <button type="button" className="btn btn-primary" onClick={() => editUser()}>
                                 <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                 Add User
                            </button>
                         </div>
                     </div>
                     <div className="relative">
                         <input type="text" placeholder="Search Users" className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" value={search} onChange={(e) => setSearch(e.target.value)} />
                         <button type="button" className="absolute ltr:right-[11px] rtl:left-[11px] top-1/2 -translate-y-1/2 peer-focus:text-primary">
                             <IconSearch className="mx-auto" />
                         </button>
                     </div>
                 </div>
             </div>
             <div className="grid 2xl:grid-cols-4 xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 mt-5 w-full">
                     {loading ? (
                    <div>Loading...</div>
                ) : (
                    filteredItems.map((user: any) => {
                        return (
                            <div className="bg-white dark:bg-[#1c232f] rounded-md overflow-hidden text-center shadow relative" key={user._id}>
                                <div className="bg-white dark:bg-[#1c232f] rounded-md overflow-hidden text-center shadow relative">
                                    <div
                                        className="bg-white/40 rounded-t-md bg-center bg-cover p-6 pb-0 bg-"
                                        style={{
                                            backgroundImage: `url('/assets/images/notification-bg.png')`,
                                            backgroundRepeat: 'no-repeat',
                                            width: '100%',
                                            height: '100%',
                                        }}
                                    >
                                    </div>
                                    <div className="px-8 py-8 pb-24 -mt-10 relative">
                                        <div className="shadow-md bg-white dark:bg-gray-900 rounded-md px-2 py-4">
                                            <div className="text-xl">{`${user.firstName}${' '}${user.lastName}`}</div>
                                            <div className="text-white-dark">{user.position}</div>
                                            <div className="flex items-center justify-between flex-wrap mt-6 gap-3">
                                                <div className="flex-auto">
                                                    <div className="text-info">{user.status}</div>
                                                    <div>Status</div>
                                                </div>
                                                <div className="flex-auto">
                                                    <div className="text-info">{user.identityNo}</div>
                                                    <div>Employee ID</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-6 grid grid-cols-1 gap-4 ltr:text-left rtl:text-right">
                                            <div className="flex items-center">
                                                <div className="flex-none ltr:mr-2 rtl:ml-2">Email :</div>
                                                <div className="truncate text-white-dark">{user.email}</div>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="flex-none ltr:mr-2 rtl:ml-2">Phone :</div>
                                                <div className="text-white-dark">{user.phone}</div>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="flex-none ltr:mr-2 rtl:ml-2"> Department:</div>
                                                <div className="text-white-dark">{'Mining'}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex gap-4 absolute bottom-0 w-full ltr:left-0 rtl:right-0 p-6">
                                        <button type="button" className="btn btn-outline-primary w-1/2" onClick={() => editUser(user)}>
                                            Edit
                                        </button>
                                        <button type="button" className="btn btn-outline-danger w-1/2" onClick={() => deleteUser(user)}>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    }))}
            </div>
            {/* Modal to add users */}
            <Transition appear show={addUserModal} as={Fragment}>
                <Dialog as="div" open={addUserModal} onClose={() => setAddUserModal(false)} className="relative z-[51]">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
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
                                        onClick={() => setAddUserModal(false)}
                                        className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                    >
                                        <IconX />
                                    </button>
                                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                        {params.id ? 'Edit User' : 'Add User'}
                                    </div>
                                    <div className="p-5">
                                        <form>
                                            <div className="mb-5">
                                                <label htmlFor="name">First Name</label>
                                                <input id="firstName" type="text" placeholder="Enter First Name" className="form-input" value={params.firstName} onChange={(e) => changeValue(e)} />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="name">Last Name</label>
                                                <input id="lastName" type="text" placeholder="Enter Last Name" className="form-input" value={params.lastName} onChange={(e) => changeValue(e)} />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="email">Email</label>
                                                <input id="email" type="email" placeholder="Enter Email" className="form-input" value={params.email} onChange={(e) => changeValue(e)} />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="number">Phone Number</label>
                                                <input id="phone" type="text" placeholder="Enter Phone Number" className="form-input" value={params.phone} onChange={(e) => changeValue(e)} />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="role"> Section
                                                <select
                                                    id="role"
                                                    name="role"
                                                    className="form-select flex-1"
                                                    onChange={(e) => setRole(e.target.value)} >
                                                    {roleList.map((i) => (
                                                        <option key={i} value={i}>{i}</option>
                                                    ))}
                                                </select>
                                                </label>
                                               </div>
                                            <div className="mb-5">
                                                <label htmlFor="name">Positon</label>
                                                <input id="position" type="text" placeholder="Enter User Position" className="form-input" value={params.position} onChange={(e) => changeValue(e)} />
                                            </div>   
                                            <div className="mb-5">
                                                <label htmlFor="address">Employee ID</label>
                                                <input
                                                    id="identityNo"
                                                    placeholder="Enter Employee No"
                                                    className="form-input"
                                                    value={params.identityNo}
                                                    onChange={(e) => changeValue(e)}
                                                ></input>
                                            </div>
                                            <div className="flex justify-end items-center mt-8">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setAddUserModal(false)}>
                                                    Cancel
                                                </button>
                                                <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={saveUser}>
                                                    {params._id ? 'Update' : 'Add'}
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

export default Users;

