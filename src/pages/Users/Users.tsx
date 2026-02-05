import React, { useState, Fragment, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import axiosInstance from '../../Api/axiosInstance';

import IconUserPlus from '../../components/Icon/IconUserPlus';
import IconSearch from '../../components/Icon/IconSearch';
import IconX from '../../components/Icon/IconX';
import { API_CONFIG } from '../../Api/apiConfig';
import { User, CompanyRole, getAllCompanyRolesApi, IDepartment, ISection, ISubsection, getAllDepartmentsApi, getAllSectionsByDepartmentApi, getAllSubsectionsBySectionApi } from '../../Api/api'; // Import User and CompanyRole interfaces, and API function

interface UserData extends User {
  password?: string; // Password is only sent during creation, not retrieved
  department?: IDepartment; // Populated department object
  section?: ISection; // Populated section object
  subsection?: ISubsection; // Populated subsection object
}

const Users: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const [companyRoles, setCompanyRoles] = useState<CompanyRole[]>([]); // New state for company-specific roles
  const [selectedRole, setSelectedRole] = useState<string>(''); // To store the _id of the selected role
  const userState = useSelector((state: any) => state.user);
  const [departments, setDepartments] = useState<IDepartment[]>([]);
  const [sections, setSections] = useState<ISection[]>([]);
  const [subsections, setSubsections] = useState<ISubsection[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [selectedSubsectionId, setSelectedSubsectionId] = useState<string>('');

  useEffect(() => {
    dispatch(setPageTitle('Users'));
    fetchUsers();
    fetchCompanyRoles();
    fetchDepartments();
  }, [dispatch, userState.user.companyId]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get<UserData[]>(API_CONFIG.users.endpoints.list);
      // Filter departments by isActive: true
      const activeDepartments = response.data.filter(user => user.department?.isActive !== false);
      setUsers(activeDepartments);
      setUserList(activeDepartments);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyRoles = async () => {
    try {
      const response = await getAllCompanyRolesApi();
      if (response && Array.isArray(response)) {
        // Filter out SUPER-ADMIN role for regular company admins
        const filteredRoles = userState.user.roleName === 'SUPER-ADMIN' 
            ? response 
            : response.filter(role => role.roleName !== 'SUPER-ADMIN');
        setCompanyRoles(filteredRoles);
        // Set a default selected role if not in edit mode
        if (!params._id && filteredRoles.length > 0) {
          setSelectedRole(filteredRoles[0]._id);
        }
      } else {
        showMessage('Failed to fetch company roles.', 'error');
      }
    } catch (error) {
      console.error('Error fetching company roles:', error);
      showMessage('Error fetching company roles.', 'error');
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await getAllDepartmentsApi();
      const activeDepartments = response.filter(dept => dept.isActive);
      setDepartments(activeDepartments);
      if (activeDepartments.length > 0) {
        // Set the selected department to the first active one by default, or an empty string if none
        setSelectedDepartmentId(activeDepartments[0]._id);
      } else {
        setSelectedDepartmentId('');
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      showMessage('Error fetching departments.', 'error');
    }
  };

  const fetchSections = async (departmentId: string) => {
    if (!departmentId) {
      setSections([]);
      setSelectedSectionId('');
      setSubsections([]);
      setSelectedSubsectionId('');
      return;
    }
    try {
      // Pass companyId if available (for SUPER-ADMIN) or let it use headers (for regular admins)
      const companyId = userState.user?.companyId;
      const response = await getAllSectionsByDepartmentApi(departmentId, companyId);
      setSections(response);
      if (response.length > 0) {
        setSelectedSectionId(response[0]._id);
      } else {
        setSelectedSectionId('');
        setSubsections([]);
        setSelectedSubsectionId('');
      }
    } catch (error) {
      console.error(`Error fetching sections for department ${departmentId}:`, error);
      showMessage('Error fetching sections.', 'error');
      setSections([]);
      setSelectedSectionId('');
      setSubsections([]);
      setSelectedSubsectionId('');
    }
  };

  const fetchSubsections = async (sectionId: string) => {
    if (!sectionId) {
      setSubsections([]);
      setSelectedSubsectionId('');
      return;
    }
    try {
      const companyId = userState.user?.companyId;
      const response = await getAllSubsectionsBySectionApi(sectionId, companyId);
      setSubsections(response);
      if (response.length > 0) {
        setSelectedSubsectionId(response[0]._id);
      } else {
        setSelectedSubsectionId('');
      }
    } catch (error) {
      console.error(`Error fetching subsections for section ${sectionId}:`, error);
      showMessage('Error fetching subsections.', 'error');
      setSubsections([]);
      setSelectedSubsectionId('');
    }
  };

  useEffect(() => {
    if (userState.user.companyId && selectedDepartmentId) {
      fetchSections(selectedDepartmentId);
    }
  }, [selectedDepartmentId, userState.user.companyId]);

  useEffect(() => {
    if (userState.user.companyId && selectedSectionId) {
      fetchSubsections(selectedSectionId);
    } else {
      setSubsections([]);
      setSelectedSubsectionId('');
    }
  }, [selectedSectionId, userState.user.companyId]);

  const [addUserModal, setAddUserModal] = useState<boolean>(false);

  const [defaultParams] = useState<Partial<UserData>>({
    _id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    roleName: '',
    permissions: [],
    position: '',
    identityNo: '',
    status: 'ACTIVE' as const,
    password: '',
    departmentId: '',
    sectionId: '',
  });

  const [params, setParams] = useState<any>({ ...defaultParams });

  const changeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, id } = e.target;
    setParams({ ...params, [id]: value });
  };

  const [search, setSearch] = useState<string>('');
  const [userList, setUserList] = useState<UserData[]>([]);

  const [filteredItems, setFilteredItems] = useState<UserData[]>(userList);
  useEffect(() => {
    setFilteredItems(() => {
      return userList.filter((item: UserData) => {
        return (
          item.firstName.toLowerCase().includes(search.toLowerCase()) ||
          item.lastName.toLowerCase().includes(search.toLowerCase()) ||
          item.email.toLowerCase().includes(search.toLowerCase()) ||
          item.identityNo.toLowerCase().includes(search.toLowerCase()) ||
          item.phone.toLowerCase().includes(search.toLowerCase()) ||
          item.roleName.toLowerCase().includes(search.toLowerCase()) // Search by roleName
        );
      });
    });
  }, [search, userList]);

  const saveUser = async () => {
    if (!params.firstName || !params.lastName || !params.email || !params.phone || !selectedRole || !params.identityNo || !params.position) {
      showMessage('Please fill in all required fields.', 'error');
      return;
    }

    const roleDoc = companyRoles.find(role => role._id === selectedRole);
    if (!roleDoc) {
      showMessage('Selected role not found.', 'error');
      return;
    }

    const userPayload: any = { ...params, role: selectedRole, roleName: roleDoc.roleName, companyId: userState.user.companyId, departmentId: selectedDepartmentId, sectionId: selectedSectionId, subsectionId: selectedSubsectionId || params.subsectionId || undefined };

    if (!params._id) {
      userPayload.password = 'admin@123'; // Default password for new users
    }

    try {
      if (params._id) {
        // For update, exclude password if it's not being changed
        const { password, ...updateData } = userPayload;
        await axiosInstance.put(API_CONFIG.users.endpoints.edit.replace(':userId', params._id), updateData);
        showMessage('User has been updated successfully.', 'success');
      } else {
        await axiosInstance.post(API_CONFIG.users.endpoints.add, userPayload);
        showMessage('User has been added successfully.', 'success');
      }

      fetchUsers(); // Refresh the user list
      setAddUserModal(false);
    } catch (error: any) {
      console.error('Error saving user:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to save user. Please try again.';
      showMessage(errorMessage, 'error');
    }
  };

  const editUser = async (user: UserData | null = null) => {
    if (user) {
      setParams({ ...user });
      setSelectedRole(user.role); // Set the selected role based on user's role ObjectId
      const deptId = user.departmentId || '';
      const secId = user.sectionId || '';
      setSelectedDepartmentId(deptId); // Set selected department
      setSelectedSectionId(secId); // Set selected section
      setSelectedSubsectionId(user.subsectionId || ''); // Set selected subsection
      // Fetch sections for the user's department
      if (deptId) {
        await fetchSections(deptId);
        // Fetch subsections for the user's section
        if (secId) {
          await fetchSubsections(secId);
        }
      }
    } else {
      setParams({ ...defaultParams });
      setSelectedRole(companyRoles.length > 0 ? companyRoles[0]._id : ''); // Set to first role or empty
      const deptId = departments.length > 0 ? departments[0]._id : '';
      setSelectedDepartmentId(deptId); // Set to first department or empty
      setSelectedSectionId(''); // Clear section when adding new user
      setSelectedSubsectionId(''); // Clear subsection when adding new user
      // Fetch sections for the default department
      if (deptId) {
        await fetchSections(deptId);
      }
    }
    setAddUserModal(true);
  };

  const deleteUser = async (user: UserData | null = null) => {
    if (!user) {
      showMessage('Invalid user selected for deletion.', 'error');
      return;
    }

    if (window.confirm(`Are you sure you want to delete user ${user.firstName} ${user.lastName}?`)) {
      try {
        await axiosInstance.delete(API_CONFIG.users.endpoints.delete.replace(':userId', user._id));
        setUsers(prevUsers => prevUsers.filter(u => u._id !== user._id));
        showMessage('User has been deleted successfully.', 'success');
      } catch (error: any) {
        console.error('Error deleting user:', error);
        const errorMessage = error.response?.data?.error || 'Failed to delete user. Please try again.';
        showMessage(errorMessage, 'error');
      }
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
                    filteredItems.map((user: UserData) => {
                        return (
                            <div className="bg-white dark:bg-[#1c232f] rounded-md overflow-hidden text-center shadow relative" key={user.identityNo}>
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
                                                <div className="flex-none ltr:mr-2 rtl:ml-2"> Role:</div>
                                                <div className="text-white-dark">{user.roleName}</div> {/* Display roleName */}
                                            </div>
                                            {user.department?.name && (
                                              <div className="flex items-center">
                                                <div className="flex-none ltr:mr-2 rtl:ml-2">Department:</div>
                                                <div className="text-white-dark">{user.department.name}</div>
                                              </div>
                                            )}
                                            {user.section?.name && (
                                              <div className="flex items-center">
                                                <div className="flex-none ltr:mr-2 rtl:ml-2">Section:</div>
                                                <div className="text-white-dark">{user.section.name}</div>
                                              </div>
                                            )}
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
                                        {params._id ? 'Edit User' : 'Add User'}
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
                                                <label htmlFor="role"> Role
                                                <select
                                                    id="role"
                                                    name="role"
                                                    className="form-select flex-1"
                                                    value={selectedRole}
                                                    onChange={(e) => setSelectedRole(e.target.value)} 
                                                >
                                                    <option value="" disabled>Select a Role</option>
                                                    {companyRoles.map((roleItem) => (
                                                        <option key={roleItem._id} value={roleItem._id}>
                                                            {roleItem.roleName}
                                                        </option>
                                                    ))}
                                                </select>
                                                </label>
                                               </div>
                                            <div className="mb-5">
                                                <label htmlFor="departmentId">Department</label>
                                                <select
                                                    id="departmentId"
                                                    name="departmentId"
                                                    className="form-select flex-1"
                                                    value={selectedDepartmentId}
                                                    onChange={async (e) => {
                                                      const newDeptId = e.target.value;
                                                      setSelectedDepartmentId(newDeptId);
                                                      setSelectedSectionId('');
                                                      setParams({ ...params, departmentId: newDeptId, sectionId: '' }); // Reset section when department changes
                                                      // Immediately fetch sections for the selected department
                                                      if (newDeptId) {
                                                        await fetchSections(newDeptId);
                                                      } else {
                                                        setSections([]);
                                                      }
                                                    }}
                                                >
                                                    <option value="">Select a Department</option>
                                                    {departments.map((deptItem) => (
                                                        <option key={deptItem._id} value={deptItem._id}>
                                                            {deptItem.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="sectionId">Section</label>
                                                <select
                                                    id="sectionId"
                                                    name="sectionId"
                                                    className="form-select flex-1"
                                                    value={selectedSectionId}
                                                    onChange={async (e) => {
                                                      const newSectionId = e.target.value;
                                                      setSelectedSectionId(newSectionId);
                                                      setSelectedSubsectionId('');
                                                      setParams({ ...params, sectionId: newSectionId, subsectionId: '' }); // Reset subsection when section changes
                                                      // Immediately fetch subsections for the selected section
                                                      if (newSectionId) {
                                                        await fetchSubsections(newSectionId);
                                                      } else {
                                                        setSubsections([]);
                                                      }
                                                    }}
                                                    disabled={!selectedDepartmentId || sections.length === 0}
                                                >
                                                    <option value="">Select a Section</option>
                                                    {sections.map((sectionItem) => (
                                                        <option key={sectionItem._id} value={sectionItem._id}>
                                                            {sectionItem.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="subsectionId">Subsection (Optional)</label>
                                                <select
                                                    id="subsectionId"
                                                    name="subsectionId"
                                                    className="form-select flex-1"
                                                    value={selectedSubsectionId}
                                                    onChange={(e) => { 
                                                      setSelectedSubsectionId(e.target.value); 
                                                      setParams({ ...params, subsectionId: e.target.value }); 
                                                    }}
                                                    disabled={!selectedSectionId || subsections.length === 0}
                                                >
                                                    <option value="">No Subsection (Optional)</option>
                                                    {subsections.map((subsectionItem) => (
                                                        <option key={subsectionItem._id} value={subsectionItem._id}>
                                                            {subsectionItem.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {selectedSectionId && subsections.length === 0 && (
                                                  <p className="text-xs text-gray-500 mt-1">No subsections available for this section. Subsections are optional.</p>
                                                )}
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
                                            {!params._id && (
                                                <div className="mb-5">
                                                    <label htmlFor="password">Password (Default: admin@123)</label>
                                                    <input 
                                                        id="password"
                                                        type="password"
                                                        placeholder="Enter Password (default for new users: admin@123)"
                                                        className="form-input"
                                                        value={params.password}
                                                        onChange={(e) => setParams({ ...params, password: e.target.value })}
                                                    />
                                                </div>
                                            )}
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

