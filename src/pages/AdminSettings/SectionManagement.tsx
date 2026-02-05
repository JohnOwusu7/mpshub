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
import IconBuilding from '../../components/Icon/IconBuilding';
import { ISection, IDepartment, createSectionApi, getAllSectionsByDepartmentApi, updateSectionApi, deleteSectionApi, getAllDepartmentsApi } from '../../Api/api';
import { useParams, Link } from 'react-router-dom'; // Import useParams and Link

const SectionManagement = () => {
  const dispatch = useDispatch();
  const { companyId: companyIdFromUrl, departmentId: departmentIdFromUrl } = useParams<{ companyId: string; departmentId: string }>(); // Get companyId and departmentId from URL
  useEffect(() => {
    dispatch(setPageTitle('Section Management'));
  });

  const [sections, setSections] = useState<ISection[]>([]);
  const [departments, setDepartments] = useState<IDepartment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddEditSectionModal, setIsAddEditSectionModal] = useState<boolean>(false);
  const [params, setParams] = useState<ISection>({ _id: '', name: '', departmentId: '', companyId: '', description: '', createdAt: '', updatedAt: '' });
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>(departmentIdFromUrl || ''); // Initialize with departmentIdFromUrl

  const authenticatedUser = useSelector((state: IRootState) => state.user.user);
  const userPermissions = authenticatedUser?.permissions || [];
  const isSuperAdmin = authenticatedUser?.roleName === 'SUPER-ADMIN';
  const canManageSections = userPermissions.includes('section:manage') || userPermissions.includes('company:manage') || userPermissions.includes('all:access');
  const canViewSections = userPermissions.includes('section:view') || userPermissions.includes('all:access');

  const fetchDepartments = async () => {
    try {
      // Fetch departments based on companyIdFromUrl if available, otherwise for the authenticated user's company
      const response = await getAllDepartmentsApi(companyIdFromUrl || authenticatedUser?.companyId);
      setDepartments(response);
      if (departmentIdFromUrl) {
        // If departmentId is in URL, ensure it's valid and set it
        if (response.some(dept => dept._id === departmentIdFromUrl)) {
          setSelectedDepartmentId(departmentIdFromUrl);
        } else {
          setSelectedDepartmentId(''); // Invalid departmentId in URL
        }
      } else if (response.length > 0) {
        // If no departmentId in URL, and there are departments, select the first one
        setSelectedDepartmentId(response[0]._id);
      } else {
        setSelectedDepartmentId(''); // No departments available
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchSections = async (departmentId: string) => {
    setLoading(true);
    try {
      // Pass both departmentId and companyIdFromUrl to the API
      const response = await getAllSectionsByDepartmentApi(departmentId, companyIdFromUrl || authenticatedUser?.companyId);
      setSections(response);
    } catch (error) {
      console.error('Error fetching sections:', error);
      showMessage('Failed to fetch sections.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [authenticatedUser?.companyId, companyIdFromUrl]); // Add companyIdFromUrl to dependencies

  useEffect(() => {
    if (selectedDepartmentId) {
      fetchSections(selectedDepartmentId);
    }
  }, [selectedDepartmentId, companyIdFromUrl, departmentIdFromUrl]); // Add departmentIdFromUrl to dependencies

  const setSection = (section: ISection | null = null) => {
    if (section) {
      setParams(section);
      setSelectedDepartmentId(section.departmentId);
    } else {
      setParams({ _id: '', name: '', departmentId: departmentIdFromUrl || selectedDepartmentId, companyId: companyIdFromUrl || authenticatedUser?.companyId || '', description: '', createdAt: '', updatedAt: '' });
    }
    setIsAddEditSectionModal(true);
  };

  const deleteSection = async (section: ISection) => {
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
            await deleteSectionApi(section._id);
            showMessage('Section has been deleted successfully.');
            fetchSections(selectedDepartmentId);
          } catch (error) {
            console.error('Error deleting section:', error);
            showMessage('Failed to delete section.', 'error');
          }
        }
      });
  };

  const saveSection = async () => {
    if (!params.name || !params.departmentId) {
      showMessage('Section name and department are required.', 'error');
      return true;
    }

    try {
      if (params._id) {
        // Update section
        await updateSectionApi(params._id, { name: params.name, departmentId: params.departmentId, description: params.description });
        showMessage('Section has been updated successfully.');
      } else {
        // Add section - companyId will be set from headers by axios interceptor
        // For regular admins, backend uses req.companyId from headers (set by auth middleware)
        // For SUPER-ADMIN, can optionally send companyId in body
        const sectionData: any = {
          name: params.name,
          departmentId: params.departmentId,
          description: params.description
        };
        // Only include companyId in body if SUPER-ADMIN explicitly selected one
        if (isSuperAdmin && params.companyId) {
          sectionData.companyId = params.companyId;
        }
        // For regular admins, companyId comes from headers (axios interceptor sets it)
        await createSectionApi(sectionData);
        showMessage('Section has been created successfully.');
      }
      setIsAddEditSectionModal(false);
      fetchSections(selectedDepartmentId);
    } catch (error: any) {
      console.error('Error saving section:', error);
      if (error.response && error.response.status === 409) {
        showMessage(error.response.data.error, 'error');
      } else {
        showMessage('Failed to save section.', 'error');
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
        <h2 className="text-xl">
          {departmentIdFromUrl
            ? `Sections for ${departments.find(d => d._id === departmentIdFromUrl)?.name || 'Selected Department'}`
            : 'Section Management'}
        </h2>
        {canManageSections && (
          <button type="button" onClick={() => setSection()} className="btn btn-primary">
            <IconPlus className="ltr:mr-2 rtl:ml-2" />
            Add New Section
          </button>
        )}
      </div>

      <div className="mt-5 panel p-0 border-0">
        {!departmentIdFromUrl && ( // Only show department selection if not coming from a department-specific view
          <div className="mb-4">
            <label htmlFor="departmentSelect">Select Department:</label>
            <select
              id="departmentSelect"
              className="form-select mt-1"
              value={selectedDepartmentId}
              onChange={(e) => setSelectedDepartmentId(e.target.value)}
            >
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loader">Loading Sections...</div>
          </div>
        ) : sections.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p>No sections found for this department.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Description</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((section) => {
                  return (
                    <tr key={section._id}>
                      <td>{section.name}</td>
                      <td>{section.departmentId ? (typeof section.departmentId === 'object' && section.departmentId && 'name' in section.departmentId ? (section.departmentId as { name: string }).name : 'N/A') : 'N/A'}</td>
                      <td>{section.description}</td>
                      <td className="text-center">
                        <div className="flex justify-center space-x-2">
                          {canManageSections && (
                            <button type="button" onClick={() => setSection(section)} className="btn btn-sm btn-outline-primary">
                              <IconEdit className="w-4.5 h-4.5" />
                            </button>
                          )}
                          {canManageSections && (
                            <button type="button" onClick={() => deleteSection(section)} className="btn btn-sm btn-outline-danger">
                              <IconTrash className="w-4.5 h-4.5" />
                            </button>
                          )}
                          {canManageSections && (
                            <Link 
                              to={
                                isSuperAdmin && companyIdFromUrl && departmentIdFromUrl
                                  ? `/admin/subsections/company/${companyIdFromUrl}/department/${departmentIdFromUrl}/section/${section._id}`
                                  : authenticatedUser?.companyId && departmentIdFromUrl
                                  ? `/admin/subsections/company/${authenticatedUser.companyId}/department/${departmentIdFromUrl}/section/${section._id}`
                                  : `/admin/subsections`
                              } 
                              className="btn btn-sm btn-outline-info"
                              title="Manage Subsections"
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

      <Transition appear show={isAddEditSectionModal} as={Fragment}>
        <Dialog as="div" open={isAddEditSectionModal} onClose={() => setIsAddEditSectionModal(false)} className="relative z-[51]">
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
                    onClick={() => setIsAddEditSectionModal(false)}
                    className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                  >
                    <IconX />
                  </button>
                  <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                    {params._id ? 'Edit Section' : 'Add Section'}
                  </div>
                  <div className="p-5">
                    <form>
                      <div className="mb-5">
                        <label htmlFor="departmentId">Department</label>
                        <select
                          id="departmentId"
                          className="form-select"
                          value={params.departmentId}
                          onChange={(e) => setParams({ ...params, departmentId: e.target.value })}
                          disabled={!!departmentIdFromUrl} // Disable if departmentId is from URL
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept._id} value={dept._id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-5">
                        <label htmlFor="name">Section Name</label>
                        <input
                          id="name"
                          type="text"
                          placeholder="Enter Section Name"
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
                      <div className="flex justify-end items-center mt-8">
                        <button type="button" className="btn btn-outline-danger" onClick={() => setIsAddEditSectionModal(false)}>
                          Cancel
                        </button>
                        <button type="button" onClick={saveSection} className="btn btn-primary ltr:ml-4 rtl:mr-4">
                          {params._id ? 'Update Section' : 'Add Section'}
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

export default SectionManagement;
