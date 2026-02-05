import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconPlus from '../../components/Icon/IconPlus';
import IconEdit from '../../components/Icon/IconEdit';
import IconTrash from '../../components/Icon/IconTrash';
import IconX from '../../components/Icon/IconX';
import IconBuilding from '../../components/Icon/IconBuilding'; // Import for section icon
import { IDepartment, createDepartmentApi, getAllDepartmentsApi, updateDepartmentApi, deleteDepartmentApi, getAllCompaniesApi, Company } from '../../Api/api';
import { useParams, Link } from 'react-router-dom'; // Import useParams and Link

const DepartmentManagement = () => {
  const dispatch = useDispatch();
  const { companyId: companyIdFromUrl } = useParams<{ companyId: string }>(); // Get companyId from URL
  useEffect(() => {
    dispatch(setPageTitle('Department Management'));
  });

  const [departments, setDepartments] = useState<IDepartment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddEditDepartmentModal, setIsAddEditDepartmentModal] = useState<boolean>(false);
  const [params, setParams] = useState<IDepartment>({ _id: '', name: '', description: '', companyId: '', createdAt: '', updatedAt: '', isActive: true });

  const authenticatedUser = useSelector((state: IRootState) => state.user.user);
  const userPermissions = authenticatedUser?.permissions || [];
  const canManageDepartments = userPermissions.includes('department:manage') || userPermissions.includes('company:manage') || userPermissions.includes('all:access');
  const canViewDepartments = userPermissions.includes('department:view') || userPermissions.includes('all:access');
  const isSuperAdmin = authenticatedUser?.roleName === 'SUPER-ADMIN';

  const [companies, setCompanies] = useState<Company[]>([]);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await getAllDepartmentsApi(companyIdFromUrl); // Pass companyId from URL
      setDepartments(response);
    } catch (error) {
      console.error('Error fetching departments:', error);
      showMessage('Failed to fetch departments.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    if (isSuperAdmin) {
      const fetchCompanies = async () => {
        try {
          const response = await getAllCompaniesApi();
          setCompanies(response);
        } catch (error) {
          console.error('Error fetching companies:', error);
          showMessage('Failed to fetch companies for selection.', 'error');
        }
      };
      fetchCompanies();
    }
  }, [authenticatedUser?.companyId, isSuperAdmin, companyIdFromUrl]); // Add companyIdFromUrl to dependencies

  const setDepartment = (department: IDepartment | null = null) => {
    if (department) {
      setParams(department);
    } else {
      setParams({ _id: '', name: '', description: '', companyId: companyIdFromUrl || authenticatedUser?.companyId || '', createdAt: '', updatedAt: '', isActive: true });
    }
    setIsAddEditDepartmentModal(true);
  };

  const deleteDepartment = async (department: IDepartment) => {
    const swalButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger ltr:ml-3 rtl:mr-3',
      },
      buttonsStyling: false,
    });

    swalButtons
      .fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.value) {
          try {
            await deleteDepartmentApi(department._id);
            showMessage('Department has been deleted successfully.');
            fetchDepartments();
          } catch (error: any) {
            console.error('Error deleting department:', error);
            if (error.response && error.response.data && error.response.data.error) {
              showMessage(error.response.data.error, 'error');
            } else if (error.response && error.response.status === 403) {
              showMessage('You do not have permission to delete departments.', 'error');
            } else if (error.response && error.response.status === 404) {
              showMessage('Department not found or does not belong to your company.', 'error');
            } else {
              showMessage('Failed to delete department.', 'error');
            }
          }
        }
      });
  };

  const saveDepartment = async () => {
    if (!params.name) {
      showMessage('Department name is required.', 'error');
      return true;
    }

    try {
      if (params._id) {
        // Update department
        await updateDepartmentApi(params._id, { name: params.name, description: params.description, isActive: params.isActive });
        showMessage('Department has been updated successfully.');
      } else {
        // Add department - ensure companyId is set (use authenticated user's companyId if not SUPER-ADMIN)
        const departmentData: any = { 
          name: params.name, 
          description: params.description, 
          isActive: params.isActive 
        };
        // Only include companyId if SUPER-ADMIN explicitly selected one, otherwise backend uses req.companyId from headers
        if (isSuperAdmin && params.companyId) {
          departmentData.companyId = params.companyId;
        }
        await createDepartmentApi(departmentData);
        showMessage('Department has been created successfully.');
      }
      setIsAddEditDepartmentModal(false);
      fetchDepartments();
    } catch (error: any) {
      console.error('Error saving department:', error);
      if (error.response && error.response.status === 409) {
        showMessage(error.response.data.error, 'error');
      } else {
        showMessage('Failed to save department.', 'error');
      }
    }
    return false;
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
      <div className="flex items-center justify-between flex-wrap header-wrapper">
        <h2 className="text-xl">{companyIdFromUrl ? `Departments for ${companies.find(c => c._id === companyIdFromUrl)?.companyName || 'Selected Company'}` : 'Department Management'}</h2>
        {canManageDepartments && (
          <button type="button" onClick={() => setDepartment()} className="btn btn-primary">
            <IconPlus className="ltr:mr-2 rtl:ml-2" />
            Add New Department
          </button>
        )}
      </div>

      <div className="mt-5 panel p-0 border-0">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loader">Loading Departments...</div>
          </div>
        ) : departments.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p>No departments found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Active Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((department) => {
                  return (
                    <tr key={department._id}>
                      <td>{department.name}</td>
                      <td>{department.description}</td>
                      <td>{department.isActive ? 'Active' : 'Inactive'}</td>
                      <td className="text-center">
                        <div className="flex justify-center space-x-2">
                          {canManageDepartments && (
                            <button type="button" onClick={() => setDepartment(department)} className="btn btn-sm btn-outline-primary">
                              <IconEdit className="w-4.5 h-4.5" />
                            </button>
                          )}
                          {canManageDepartments && (
                            <button type="button" onClick={() => deleteDepartment(department)} className="btn btn-sm btn-outline-danger">
                              <IconTrash className="w-4.5 h-4.5" />
                            </button>
                          )}
                          {canManageDepartments && (
                            <Link 
                              to={
                                isSuperAdmin && companyIdFromUrl
                                  ? `/admin/sections/company/${companyIdFromUrl}/department/${department._id}`
                                  : authenticatedUser?.companyId
                                  ? `/admin/sections/company/${authenticatedUser.companyId}/department/${department._id}`
                                  : `/admin/sections`
                              } 
                              className="btn btn-sm btn-outline-info"
                            >
                              <IconBuilding className="w-4.5 h-4.5" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Transition appear show={isAddEditDepartmentModal} as={Fragment}>
        <Dialog as="div" open={isAddEditDepartmentModal} onClose={() => setIsAddEditDepartmentModal(false)} className="relative z-[51]">
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
                    onClick={() => setIsAddEditDepartmentModal(false)}
                    className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                  >
                    <IconX />
                  </button>
                  <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                    {params._id ? 'Edit Department' : 'Add Department'}
                  </div>
                  <div className="p-5">
                    <form>
                      {isSuperAdmin && ( // Only show company selection for SUPER-ADMIN
                        <div className="mb-5">
                          <label htmlFor="companyId">Company</label>
                          <select
                            id="companyId"
                            className="form-select"
                            value={params.companyId}
                            onChange={(e) => setParams({ ...params, companyId: e.target.value })}
                          >
                            <option value="">Select Company</option>
                            {companies.map((company) => (
                              <option key={company._id} value={company._id}>
                                {company.companyName}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div className="mb-5">
                        <label htmlFor="name">Department Name</label>
                        <input
                          id="name"
                          type="text"
                          placeholder="Enter Department Name"
                          className="form-input"
                          value={params.name}
                          onChange={(e) => setParams({ ...params, name: e.target.value })}
                        />
                      </div>
                      <div className="mb-5">
                        <label htmlFor="description">Description</label>
                        <textarea
                          id="description"
                          placeholder="Enter Description (Optional)"
                          className="form-textarea"
                          value={params.description}
                          onChange={(e) => setParams({ ...params, description: e.target.value })}
                        ></textarea>
                      </div>
                      <div className="mb-5">
                        <label htmlFor="isActive" className="flex items-center cursor-pointer">
                          <input
                            id="isActive"
                            type="checkbox"
                            className="form-checkbox"
                            checked={params.isActive}
                            onChange={(e) => setParams({ ...params, isActive: e.target.checked })}
                          />
                          <span className="ltr:ml-2 rtl:mr-2">Active</span>
                        </label>
                      </div>
                      <div className="flex justify-end items-center mt-8">
                        <button type="button" className="btn btn-outline-danger" onClick={() => setIsAddEditDepartmentModal(false)}>
                          Cancel
                        </button>
                        <button type="button" onClick={saveDepartment} className="btn btn-primary ltr:ml-4 rtl:mr-4">
                          {params._id ? 'Update Department' : 'Add Department'}
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

export default DepartmentManagement;
