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
import { ISubsection, ISection, IDepartment, createSubsectionApi, getAllSubsectionsBySectionApi, updateSubsectionApi, deleteSubsectionApi, getAllSectionsByDepartmentApi, getAllDepartmentsApi } from '../../Api/api';
import { useParams, Link } from 'react-router-dom';

const SubsectionManagement = () => {
  const dispatch = useDispatch();
  const { companyId: companyIdFromUrl, departmentId: departmentIdFromUrl, sectionId: sectionIdFromUrl } = useParams<{ companyId: string; departmentId: string; sectionId: string }>();
  useEffect(() => {
    dispatch(setPageTitle('Subsection Management'));
  });

  const [subsections, setSubsections] = useState<ISubsection[]>([]);
  const [sections, setSections] = useState<ISection[]>([]);
  const [departments, setDepartments] = useState<IDepartment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddEditSubsectionModal, setIsAddEditSubsectionModal] = useState<boolean>(false);
  const [params, setParams] = useState<ISubsection>({ 
    _id: '', 
    name: '', 
    sectionId: '', 
    departmentId: '', 
    companyId: '', 
    description: '', 
    isActive: true,
    createdAt: '', 
    updatedAt: '' 
  });
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>(departmentIdFromUrl || '');
  const [selectedSectionId, setSelectedSectionId] = useState<string>(sectionIdFromUrl || '');

  const authenticatedUser = useSelector((state: IRootState) => state.user.user);
  const userPermissions = authenticatedUser?.permissions || [];
  const isSuperAdmin = authenticatedUser?.roleName === 'SUPER-ADMIN';
  const canManageSubsections = userPermissions.includes('section:manage') || userPermissions.includes('company:manage') || userPermissions.includes('all:access');
  const canViewSubsections = userPermissions.includes('section:view') || userPermissions.includes('all:access');

  const fetchDepartments = async () => {
    try {
      const response = await getAllDepartmentsApi(companyIdFromUrl || authenticatedUser?.companyId);
      setDepartments(response);
      if (departmentIdFromUrl && response.some(dept => dept._id === departmentIdFromUrl)) {
        setSelectedDepartmentId(departmentIdFromUrl);
      } else if (response.length > 0) {
        setSelectedDepartmentId(response[0]._id);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchSections = async (departmentId: string) => {
    try {
      const response = await getAllSectionsByDepartmentApi(departmentId, companyIdFromUrl || authenticatedUser?.companyId);
      setSections(response);
      if (sectionIdFromUrl && response.some(sec => sec._id === sectionIdFromUrl)) {
        setSelectedSectionId(sectionIdFromUrl);
      } else if (response.length > 0) {
        setSelectedSectionId(response[0]._id);
      } else {
        setSelectedSectionId('');
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const fetchSubsections = async (sectionId: string) => {
    setLoading(true);
    try {
      const response = await getAllSubsectionsBySectionApi(sectionId, companyIdFromUrl || authenticatedUser?.companyId);
      setSubsections(response);
    } catch (error) {
      console.error('Error fetching subsections:', error);
      showMessage('Failed to fetch subsections.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [authenticatedUser?.companyId, companyIdFromUrl]);

  useEffect(() => {
    if (selectedDepartmentId) {
      fetchSections(selectedDepartmentId);
    }
  }, [selectedDepartmentId, companyIdFromUrl, departmentIdFromUrl]);

  useEffect(() => {
    if (selectedSectionId) {
      fetchSubsections(selectedSectionId);
    } else {
      setSubsections([]);
      setLoading(false);
    }
  }, [selectedSectionId, companyIdFromUrl, sectionIdFromUrl]);

  const setSubsection = (subsection: ISubsection | null = null) => {
    if (subsection) {
      setParams(subsection);
      setSelectedSectionId(subsection.sectionId);
    } else {
      setParams({ 
        _id: '', 
        name: '', 
        sectionId: sectionIdFromUrl || selectedSectionId, 
        departmentId: selectedDepartmentId,
        companyId: companyIdFromUrl || authenticatedUser?.companyId || '', 
        description: '', 
        isActive: true,
        createdAt: '', 
        updatedAt: '' 
      });
    }
    setIsAddEditSubsectionModal(true);
  };

  const deleteSubsection = async (subsection: ISubsection) => {
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
            await deleteSubsectionApi(subsection._id);
            showMessage('Subsection has been deleted successfully.');
            fetchSubsections(selectedSectionId);
          } catch (error: any) {
            console.error('Error deleting subsection:', error);
            if (error.response && error.response.data && error.response.data.error) {
              showMessage(error.response.data.error, 'error');
            } else if (error.response && error.response.status === 403) {
              showMessage('You do not have permission to delete subsections.', 'error');
            } else if (error.response && error.response.status === 404) {
              showMessage('Subsection not found or does not belong to your company.', 'error');
            } else {
              showMessage('Failed to delete subsection.', 'error');
            }
          }
        }
      });
  };

  const saveSubsection = async () => {
    if (!params.name || !params.sectionId) {
      showMessage('Subsection name and section are required.', 'error');
      return true;
    }

    try {
      if (params._id) {
        // Update subsection
        await updateSubsectionApi(params._id, { 
          name: params.name, 
          sectionId: params.sectionId, 
          description: params.description,
          isActive: params.isActive
        });
        showMessage('Subsection has been updated successfully.');
      } else {
        // Add subsection
        const subsectionData: any = {
          name: params.name,
          sectionId: params.sectionId,
          description: params.description
        };
        // Only include companyId if SUPER-ADMIN explicitly selected one
        if (isSuperAdmin && params.companyId) {
          subsectionData.companyId = params.companyId;
        }
        await createSubsectionApi(subsectionData);
        showMessage('Subsection has been created successfully.');
      }
      setIsAddEditSubsectionModal(false);
      fetchSubsections(selectedSectionId);
    } catch (error: any) {
      console.error('Error saving subsection:', error);
      if (error.response && error.response.status === 409) {
        showMessage(error.response.data.error, 'error');
      } else {
        showMessage('Failed to save subsection.', 'error');
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
          {sectionIdFromUrl
            ? `Subsections for ${sections.find(s => s._id === sectionIdFromUrl)?.name || 'Selected Section'}`
            : 'Subsection Management'}
        </h2>
        {canManageSubsections && (
          <button type="button" onClick={() => setSubsection()} className="btn btn-primary">
            <IconPlus className="ltr:mr-2 rtl:ml-2" />
            Add New Subsection
          </button>
        )}
      </div>

      <div className="mt-5 panel p-0 border-0">
        {!sectionIdFromUrl && (
          <>
            <div className="mb-4 p-4">
              <label htmlFor="departmentSelect" className="block mb-2">Select Department:</label>
              <select
                id="departmentSelect"
                className="form-select mt-1"
                value={selectedDepartmentId}
                onChange={async (e) => {
                  const newDeptId = e.target.value;
                  setSelectedDepartmentId(newDeptId);
                  setSelectedSectionId('');
                  if (newDeptId) {
                    await fetchSections(newDeptId);
                  } else {
                    setSections([]);
                  }
                }}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedDepartmentId && (
              <div className="mb-4 p-4">
                <label htmlFor="sectionSelect" className="block mb-2">Select Section:</label>
                <select
                  id="sectionSelect"
                  className="form-select mt-1"
                  value={selectedSectionId}
                  onChange={async (e) => {
                    const newSectionId = e.target.value;
                    setSelectedSectionId(newSectionId);
                    if (newSectionId) {
                      await fetchSubsections(newSectionId);
                    } else {
                      setSubsections([]);
                    }
                  }}
                >
                  <option value="">Select Section</option>
                  {sections.map((sec) => (
                    <option key={sec._id} value={sec._id}>
                      {sec.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loader">Loading Subsections...</div>
          </div>
        ) : !selectedSectionId ? (
          <div className="flex justify-center items-center h-64">
            <p>Please select a section to view subsections.</p>
          </div>
        ) : subsections.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p>No subsections found for this section. Subsections are optional.</p>
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
                {subsections.map((subsection) => {
                  return (
                    <tr key={subsection._id}>
                      <td>{subsection.name}</td>
                      <td>{subsection.sectionId ? (typeof subsection.sectionId === 'object' ? subsection.sectionId.name : sections.find(s => s._id === subsection.sectionId)?.name || 'N/A') : 'N/A'}</td>
                      <td>{subsection.description}</td>
                      <td>{subsection.isActive ? 'Active' : 'Inactive'}</td>
                      <td className="text-center">
                        <div className="flex justify-center space-x-2">
                          {canManageSubsections && (
                            <button type="button" onClick={() => setSubsection(subsection)} className="btn btn-sm btn-outline-primary">
                              <IconEdit className="w-4.5 h-4.5" />
                            </button>
                          )}
                          {canManageSubsections && (
                            <button type="button" onClick={() => deleteSubsection(subsection)} className="btn btn-sm btn-outline-danger">
                              <IconTrash className="w-4.5 h-4.5" />
                            </button>
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

      <Transition appear show={isAddEditSubsectionModal} as={Fragment}>
        <Dialog as="div" open={isAddEditSubsectionModal} onClose={() => setIsAddEditSubsectionModal(false)} className="relative z-[51]">
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
                    onClick={() => setIsAddEditSubsectionModal(false)}
                    className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                  >
                    <IconX />
                  </button>
                  <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                    {params._id ? 'Edit Subsection' : 'Add Subsection'}
                  </div>
                  <div className="p-5">
                    <form>
                      <div className="mb-5">
                        <label htmlFor="sectionId">Section</label>
                        <select
                          id="sectionId"
                          className="form-select"
                          value={params.sectionId}
                          onChange={(e) => setParams({ ...params, sectionId: e.target.value })}
                          disabled={!!sectionIdFromUrl}
                        >
                          <option value="">Select Section</option>
                          {sections.map((sec) => (
                            <option key={sec._id} value={sec._id}>
                              {sec.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-5">
                        <label htmlFor="name">Subsection Name</label>
                        <input
                          id="name"
                          type="text"
                          placeholder="Enter Subsection Name"
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
                      {params._id && (
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
                      )}
                      <div className="flex justify-end items-center mt-8">
                        <button type="button" className="btn btn-outline-danger" onClick={() => setIsAddEditSubsectionModal(false)}>
                          Cancel
                        </button>
                        <button type="button" onClick={saveSubsection} className="btn btn-primary ltr:ml-4 rtl:mr-4">
                          {params._id ? 'Update Subsection' : 'Add Subsection'}
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

export default SubsectionManagement;

