import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { 
  createCompanyRoleApi, 
  getAllCompanyRolesApi, 
  updateCompanyRoleApi, 
  deleteCompanyRoleApi, 
  CompanyRole,
  getAllRoleTemplatesApi,
  activateRoleTemplateApi,
  RoleTemplate
} from '../../Api/api';
import showMessage from '../../components/Alerts/showMessage';
import IconPlus from '../../components/Icon/IconPlus';
import IconEdit from '../../components/Icon/IconEdit';
import IconTrash from '../../components/Icon/IconTrash';

const RoleManagement: React.FC = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state: IRootState) => state.user.userData);
  const [roles, setRoles] = useState<CompanyRole[]>([]);
  const [roleTemplates, setRoleTemplates] = useState<RoleTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRole, setEditingRole] = useState<CompanyRole | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [roleName, setRoleName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [permissions, setPermissions] = useState<string[]>([]);


  useEffect(() => {
    fetchRoles();
    fetchRoleTemplates();
  }, [userData]);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await getAllCompanyRolesApi();
      if (response && Array.isArray(response)) {
        setRoles(response);
      } else {
        showMessage({ message: 'Failed to fetch roles.', success: false });
      }
    } catch (error) {
      console.error('Failed to fetch company roles:', error);
      showMessage({ message: 'Error fetching roles.', success: false });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoleTemplates = async () => {
    try {
      const response = await getAllRoleTemplatesApi();
      if (response.success && Array.isArray(response.templates)) {
        setRoleTemplates(response.templates);
      }
    } catch (error) {
      console.error('Failed to fetch role templates:', error);
    }
  };

  const handleCreateOrUpdateRole = async () => {
    if (editingRole) {
      // For editing, use the existing update flow
      if (!roleName) {
        showMessage({ message: 'Role Name is required.', success: false });
        return;
      }

      setLoading(true);
      try {
        const response = await updateCompanyRoleApi(editingRole._id, { roleName, description, permissions });
        if (response.success) {
          showMessage({ message: response.message, success: true });
          closeModal();
          fetchRoles();
        } else {
          showMessage({ message: response.message, success: false });
        }
      } catch (error) {
        console.error('Failed to update role:', error);
        showMessage({ message: 'Error updating role.', success: false });
      } finally {
        setLoading(false);
      }
    } else {
      // For creating, use template activation if template is selected
      if (!selectedTemplate) {
        showMessage({ message: 'Please select a role template.', success: false });
        return;
      }

      setLoading(true);
      try {
        const response = await activateRoleTemplateApi(selectedTemplate);
        if (response.success) {
          showMessage({ message: response.message, success: true });
          closeModal();
          fetchRoles();
        } else {
          showMessage({ message: response.message, success: false });
        }
      } catch (error: any) {
        console.error('Failed to activate role template:', error);
        const errorMessage = error.response?.data?.message || 'Error activating role template.';
        showMessage({ message: errorMessage, success: false });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTemplateChange = (templateName: string) => {
    setSelectedTemplate(templateName);
    const template = roleTemplates.find(t => t.roleName === templateName);
    if (template) {
      setRoleName(template.roleName);
      setDescription(template.description);
      // Permissions will be set automatically by the backend based on subscribed modules
      setPermissions([]);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (window.confirm('Are you sure you want to delete this role? This action cannot be undone and will fail if users are assigned to this role.')) {
      setLoading(true);
      try {
        const response = await deleteCompanyRoleApi(roleId);
        if (response.success) {
          showMessage({ message: response.message, success: true });
          fetchRoles();
        } else {
          showMessage({ message: response.message, success: false });
        }
      } catch (error: any) {
        console.error('Failed to delete role:', error);
        const errorMessage = error.response?.data?.message || 'Error deleting role.';
        showMessage({ message: errorMessage, success: false });
      } finally {
        setLoading(false);
      }
    }
  };

  const openModal = (role: CompanyRole | null = null) => {
    setEditingRole(role);
    if (role) {
      // Editing existing role
      setRoleName(role.roleName);
      setDescription(role.description);
      setPermissions(role.permissions);
      setSelectedTemplate('');
    } else {
      // Creating new role - reset to template selection
      setRoleName('');
      setDescription('');
      setPermissions([]);
      setSelectedTemplate('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
    setRoleName('');
    setDescription('');
    setPermissions([]);
    setSelectedTemplate('');
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="animate-spin border-4 border-primary border-l-transparent rounded-full w-12 h-12 inline-block align-middle m-auto mb-10"></span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Role Management</h1>
        <button type="button" className="btn btn-primary" onClick={() => openModal()}>
          <IconPlus className="w-5 h-5 mr-2" />
          Create New Role
        </button>
      </div>

      <div className="panel">
        <div className="table-responsive">
          <table className="table-striped table-hover">
            <thead>
              <tr>
                <th>Role Name</th>
                <th>Description</th>
                <th>Permissions</th>
                <th className="!text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(role => (
                <tr key={role._id}>
                  <td>{role.roleName}</td>
                  <td>{role.description}</td>
                  <td>
                    <ul className="list-disc list-inside">
                      {role.permissions.map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="!text-center">
                    <div className="flex items-center justify-center gap-4">
                      <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => openModal(role)}>
                        <IconEdit className="w-4 h-4" />
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteRole(role._id)}>
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-container fixed inset-0 z-[999] bg-[rgba(0,0,0,0.2)] flex items-center justify-center">
          <div className="modal-content bg-white dark:bg-[#0e1726] rounded-md shadow-lg p-6 w-1/2 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">{editingRole ? 'Edit Role' : 'Create New Role'}</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateOrUpdateRole(); }}>
              {!editingRole ? (
                // Create mode - show template dropdown
                <div className="mb-4">
                  <label htmlFor="roleTemplate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Role Template <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="roleTemplate"
                    className="form-select mt-1 block w-full"
                    value={selectedTemplate}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    required
                  >
                    <option value="">-- Select a Role Template --</option>
                    {roleTemplates
                      .filter(template => {
                        // Don't show templates that are already activated
                        return !roles.some(role => role.roleName === template.roleName);
                      })
                      .map(template => (
                        <option key={template.roleName} value={template.roleName}>
                          {template.roleName} {template.isSystemRole ? '(System Role)' : ''}
                        </option>
                      ))}
                  </select>
                  {selectedTemplate && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Description:</strong> {description || 'No description available'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        Permissions will be automatically assigned based on your company's subscribed modules.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                // Edit mode - show editable fields
                <>
                  <div className="mb-4">
                    <label htmlFor="roleName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role Name</label>
                    <input
                      id="roleName"
                      type="text"
                      className="form-input mt-1 block w-full"
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      required
                      disabled={editingRole.isSystemRole} // Disable if system role
                    />
                    {editingRole.isSystemRole && (
                      <p className="text-xs text-gray-500 mt-1">System roles cannot be renamed</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <textarea
                      id="description"
                      className="form-textarea mt-1 block w-full"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Permissions</label>
                    <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded p-3">
                      {permissions.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {permissions.map(permission => (
                            <div key={permission} className="flex items-center text-sm">
                              <span className="text-gray-900 dark:text-gray-100">{permission}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No permissions assigned</p>
                      )}
                    </div>
                    {editingRole.templateName && (
                      <p className="text-xs text-gray-500 mt-2">
                        This role is based on the "{editingRole.templateName}" template. Permissions are managed automatically.
                      </p>
                    )}
                  </div>
                </>
              )}
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" className="btn btn-outline-danger" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : (editingRole ? 'Update Role' : 'Activate Role')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
