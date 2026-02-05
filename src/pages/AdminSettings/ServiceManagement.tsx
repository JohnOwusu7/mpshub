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
import IconServer from '../../components/Icon/IconServer';
import {
  IService,
  ISection,
  IDepartment,
  createServiceApi,
  getAllServicesApi,
  updateServiceApi,
  deleteServiceApi,
  getAllDepartmentsApi,
  getAllSectionsByDepartmentApi,
} from '../../Api/api';

const ServiceManagement = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setPageTitle('Service Management'));
  });

  const [services, setServices] = useState<IService[]>([]);
  const [departments, setDepartments] = useState<IDepartment[]>([]);
  const [sections, setSections] = useState<ISection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddEditModal, setIsAddEditModal] = useState<boolean>(false);
  const [params, setParams] = useState<{
    _id: string;
    name: string;
    description: string;
    sectionId: string;
    companyId: string;
    isActive: boolean;
  }>({
    _id: '',
    name: '',
    description: '',
    sectionId: '',
    companyId: '',
    isActive: true,
  });
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [selectedSectionFilterId, setSelectedSectionFilterId] = useState<string>('');

  const authenticatedUser = useSelector((state: IRootState) => state.user.user);
  const userPermissions = authenticatedUser?.permissions || [];
  const isSuperAdmin = authenticatedUser?.roleName === 'SUPER-ADMIN';
  const canManageServices =
    userPermissions.includes('service:manage') ||
    userPermissions.includes('section:manage') ||
    userPermissions.includes('company:manage') ||
    userPermissions.includes('all:access');
  const canViewServices =
    userPermissions.includes('service:view') ||
    userPermissions.includes('section:view') ||
    userPermissions.includes('all:access');

  const fetchDepartments = async () => {
    try {
      const response = await getAllDepartmentsApi(
        isSuperAdmin ? undefined : authenticatedUser?.companyId
      );
      setDepartments(response);
      if (response.length > 0 && !selectedDepartmentId) {
        setSelectedDepartmentId(response[0]._id);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchSections = async (departmentId: string) => {
    if (!departmentId) {
      setSections([]);
      return;
    }
    try {
      const response = await getAllSectionsByDepartmentApi(
        departmentId,
        authenticatedUser?.companyId
      );
      setSections(response);
    } catch (error) {
      console.error('Error fetching sections:', error);
      setSections([]);
    }
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await getAllServicesApi(
        isSuperAdmin ? undefined : authenticatedUser?.companyId,
        selectedSectionFilterId || undefined
      );
      setServices(response);
    } catch (error) {
      console.error('Error fetching services:', error);
      showMessage('Failed to fetch services.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [authenticatedUser?.companyId]);

  useEffect(() => {
    if (selectedDepartmentId) {
      fetchSections(selectedDepartmentId);
    } else {
      setSections([]);
    }
  }, [selectedDepartmentId]);

  useEffect(() => {
    fetchServices();
  }, [selectedSectionFilterId, authenticatedUser?.companyId]);

  const setService = (service: IService | null = null) => {
    if (service) {
      const sectionId = typeof service.sectionId === 'object' ? service.sectionId._id : service.sectionId;
      const sectionObj = typeof service.sectionId === 'object' ? service.sectionId : null;
      const deptId = sectionObj && (sectionObj as any).departmentId
        ? (typeof (sectionObj as any).departmentId === 'object' ? (sectionObj as any).departmentId._id : (sectionObj as any).departmentId)
        : '';
      setParams({
        _id: service._id,
        name: service.name,
        description: service.description || '',
        sectionId,
        companyId: service.companyId,
        isActive: service.isActive !== false,
      });
      if (deptId) setSelectedDepartmentId(deptId);
    } else {
      setParams({
        _id: '',
        name: '',
        description: '',
        sectionId: selectedSectionFilterId || (sections.length > 0 ? sections[0]._id : ''),
        companyId: authenticatedUser?.companyId || '',
        isActive: true,
      });
    }
    setIsAddEditModal(true);
  };

  const deleteService = async (service: IService) => {
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
            await deleteServiceApi(service._id);
            showMessage('Service has been deleted successfully.');
            fetchServices();
          } catch (error) {
            console.error('Error deleting service:', error);
            showMessage('Failed to delete service.', 'error');
          }
        }
      });
  };

  const saveService = async () => {
    if (!params.name || !params.sectionId) {
      showMessage('Service name and section are required.', 'error');
      return;
    }

    try {
      if (params._id) {
        await updateServiceApi(params._id, {
          name: params.name,
          sectionId: params.sectionId,
          description: params.description || undefined,
          isActive: params.isActive,
        });
        showMessage('Service has been updated successfully.');
      } else {
        const serviceData: any = {
          name: params.name,
          sectionId: params.sectionId,
          description: params.description || undefined,
          isActive: params.isActive,
        };
        if (isSuperAdmin && params.companyId) {
          serviceData.companyId = params.companyId;
        }
        await createServiceApi(serviceData);
        showMessage('Service has been created successfully.');
      }
      setIsAddEditModal(false);
      fetchServices();
    } catch (error: any) {
      console.error('Error saving service:', error);
      if (error.response && error.response.status === 409) {
        showMessage(error.response.data?.error || 'A service with this name already exists.', 'error');
      } else {
        showMessage('Failed to save service.', 'error');
      }
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

  const getSectionName = (service: IService) => {
    const s = service.sectionId;
    if (!s) return 'N/A';
    return typeof s === 'object' && s.name ? s.name : 'N/A';
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap header-wrapper">
        <h2 className="text-xl">Service Management</h2>
        {canManageServices && (
          <button type="button" onClick={() => setService()} className="btn btn-primary">
            <IconPlus className="ltr:mr-2 rtl:ml-2" />
            Add New Service
          </button>
        )}
      </div>

      <div className="mt-5 panel p-0 border-0">
        <div className="mb-4 flex flex-wrap gap-4">
          <div>
            <label htmlFor="departmentSelect">Department (for section list):</label>
            <select
              id="departmentSelect"
              className="form-select mt-1"
              value={selectedDepartmentId}
              onChange={(e) => setSelectedDepartmentId(e.target.value)}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sectionFilter">Filter by Section:</label>
            <select
              id="sectionFilter"
              className="form-select mt-1"
              value={selectedSectionFilterId}
              onChange={(e) => setSelectedSectionFilterId(e.target.value)}
            >
              <option value="">All sections</option>
              {sections.map((sec) => (
                <option key={sec._id} value={sec._id}>
                  {sec.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loader">Loading services...</div>
          </div>
        ) : services.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p>No services found. Add a service and assign it to a section.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Section</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service._id}>
                    <td>{service.name}</td>
                    <td>{getSectionName(service)}</td>
                    <td>{service.description || '—'}</td>
                    <td>
                      <span
                        className={`badge ${service.isActive !== false ? 'badge-outline-success' : 'badge-outline-secondary'}`}
                      >
                        {service.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center space-x-2">
                        {canManageServices && (
                          <button
                            type="button"
                            onClick={() => setService(service)}
                            className="btn btn-sm btn-outline-primary"
                            title="Edit"
                          >
                            <IconEdit className="w-4.5 h-4.5" />
                          </button>
                        )}
                        {canManageServices && (
                          <button
                            type="button"
                            onClick={() => deleteService(service)}
                            className="btn btn-sm btn-outline-danger"
                            title="Delete"
                          >
                            <IconTrash className="w-4.5 h-4.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Transition appear show={isAddEditModal} as={Fragment}>
        <Dialog
          as="div"
          open={isAddEditModal}
          onClose={() => setIsAddEditModal(false)}
          className="relative z-[51]"
        >
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
                    onClick={() => setIsAddEditModal(false)}
                    className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                  >
                    <IconX />
                  </button>
                  <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                    {params._id ? 'Edit Service' : 'Add Service'}
                  </div>
                  <div className="p-5">
                    <form>
                      <div className="mb-5">
                        <label htmlFor="sectionId">Section *</label>
                        <select
                          id="sectionId"
                          className="form-select"
                          value={params.sectionId}
                          onChange={(e) => setParams({ ...params, sectionId: e.target.value })}
                          required
                        >
                          <option value="">Select Section</option>
                          {sections.length === 0 && !params._id && (
                            <option value="" disabled>
                              Select a department first to load sections
                            </option>
                          )}
                          {sections.map((sec) => (
                            <option key={sec._id} value={sec._id}>
                              {sec.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-5">
                        <label htmlFor="name">Service Name *</label>
                        <input
                          id="name"
                          type="text"
                          placeholder="Enter Service Name"
                          className="form-input"
                          value={params.name}
                          onChange={(e) => setParams({ ...params, name: e.target.value })}
                        />
                      </div>
                      <div className="mb-5">
                        <label htmlFor="description">Description</label>
                        <textarea
                          id="description"
                          placeholder="Optional description"
                          className="form-textarea"
                          value={params.description}
                          onChange={(e) => setParams({ ...params, description: e.target.value })}
                        />
                      </div>
                      <div className="mb-5">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="form-checkbox"
                            checked={params.isActive}
                            onChange={(e) => setParams({ ...params, isActive: e.target.checked })}
                          />
                          <span className="ltr:ml-2 rtl:mr-2">Active</span>
                        </label>
                      </div>
                      <div className="flex justify-end items-center mt-8">
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => setIsAddEditModal(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={saveService}
                          className="btn btn-primary ltr:ml-4 rtl:mr-4"
                        >
                          {params._id ? 'Update Service' : 'Add Service'}
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

export default ServiceManagement;
