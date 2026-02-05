const env = (import.meta as any).env || {};
const VITE_API_BASE_URL = env.VITE_API_BASE_URL || '/api';
const VITE_SOCKET_URL = (() => {
  if (env.VITE_SOCKET_URL) return env.VITE_SOCKET_URL;
  try {
    if (VITE_API_BASE_URL.startsWith('http')) {
      return new URL(VITE_API_BASE_URL).origin;
    }
  } catch {}
  return (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : '/';
})();

export const API_CONFIG = {
  // baseURL: 'https://mpsserver.onrender.com/api',
  baseURL: VITE_API_BASE_URL,
  // socketUrl: 'https://mpsserver.onrender.com',
  socketUrl: VITE_SOCKET_URL,
  equipment: {
    endpoints: {
      list: '/equipments/list',
      add: '/equipments/add',
      bulk: '/equipments/bulkAdd',
      edit: '/equipments/:equipmentId',
      delete: '/equipments/:equipmentId',
      useItem: '/equipments/use-item',
      replaceItem: '/equipments/replace-item',
      leastQuantity: '/equipments/least-quantity',
      highQuantity: '/equipments/highest-quantity',
      mostUsed: '/equipments/most-used',
      transactions: '/equipments/all-transactions',
      download: '/equipments/download',
    },
  },
  users: {
    endpoints: {
      login: '/users/login',
      logout: '/users/logout',
      list: '/users/list',
      listEngineers: '/users/systemEngineers',
      listAdmin: '/users/administrative',
      getUser: '/users/get-user',
      add: '/users/add',
      edit: '/users/:userId/update',
      delete: '/users/:userId',
      active: 'users/:userId/block',
      inActive: 'users/:userId/unblock',
      changePassword: 'users/change-password',
      forgotPassword: '/users/forgot-password',
      send: '/users/send',
      ready: '/users/ready',
      listAll: '/users/list-all', // New endpoint for SUPER-ADMIN to list all users
    },
  },
  ipAddress: {
    endpoints: {
      listCategory: '/ip-addresses/category/:category',
      listOne: '/ip-addresses/:id',
      add: '/ip-address/add',
      edit: '/ip-addresses/:id',
      delete: '/ip-addresses/:id',
    },
  },
  issues: {
    endpoints: {
      list: '/issues/list',
      listOne: '/issues/:id',
      completed: '/issues/completed',
      add: '/issues/add',
      assignNew: '/issues',
      assignContractor: '/issues/contractor',
      edit: '/issues/:id',
      delete: '/issues/:id',
      deleteToTrash: '/issues/deleteToTrash',
      complete: '/issues/complete',
      completeProgress: '/issues/complete-progress',
      reported: '/issues/reported',
      assign: '/issues/assign',
      assigned: '/issues/assign',
      send: '/issues/send',
    },
  },
  transaction: {
      endpoints: {
        filter: '/equipments/filter',
        list: '/transactions/list',
        listOne: '/transactions/:id',
        add: '/transactions/add',
        edit: '/transactions/:id',
        delete: '/transactions/:id',
      },
  },
  reports: {
      endpoints: {
        list: '/reports/list',
        filter:'/reports/filter',
        listOne: '/reports/:id',
        add: '/reports/reportNew',
        edit: '/reports/:id',
        delete: '/reports/:id',
        download: '/reports/download',
      },
  },
  settings: {
    endpoints: {
      send: '/users/send',
    }
  },
  pjos: {
    endpoints: {
      list: '/planned-job-observation',
      delete: '/pjos/:id',
    }
  },
  sirs: {
    endpoints: {
      list: '/safety-interaction-records',
      delete: '/sirs/:id',
    }
  },
  companies: {
    endpoints: {
      register: '/register-company',
      list: '/companies',
      getById: '/companies/:companyId',
      updateModules: '/companies/:companyId/modules', // New endpoint for updating subscribed modules
      // Company Role Endpoints
      createRole: '/companies/roles',
      listRoles: '/companies/roles',
      getRoleById: '/companies/roles/:roleId',
      updateRole: '/companies/roles/:roleId',
      deleteRole: '/companies/roles/:roleId',
      // Role Template Endpoints
      listRoleTemplates: '/role-templates/templates',
      activateRoleTemplate: '/role-templates/activate',
      syncRoleWithTemplate: '/role-templates/sync/:roleId',
    },
  },
  departments: {
    endpoints: {
      create: '/departments',
      list: '/departments',
      getById: '/departments/:id',
      update: '/departments/:id',
      delete: '/departments/:id',
    },
  },
  sections: {
    endpoints: {
      create: '/sections',
      listByDepartment: '/sections/by-department/:departmentId',
      getById: '/sections/:id',
      update: '/sections/:id',
      delete: '/sections/:id',
    },
  },
  subsections: {
    endpoints: {
      create: '/subsections',
      listBySection: '/subsections/by-section/:sectionId',
      getById: '/subsections/:id',
      update: '/subsections/:id',
      delete: '/subsections/:id',
    },
  },
  services: {
    endpoints: {
      create: '/services',
      list: '/services',
      listBySection: '/services/by-section/:sectionId',
      getById: '/services/:id',
      update: '/services/:id',
      delete: '/services/:id',
    },
  },
  paymentTransactions: {
    endpoints: {
      create: '/payment-transactions',
      list: '/payment-transactions',
      getById: '/payment-transactions/:paymentId',
      confirm: '/payment-transactions/:paymentId/confirm',
      update: '/payment-transactions/:paymentId',
      delete: '/payment-transactions/:paymentId',
      statistics: '/payment-transactions/statistics',
    },
  },
};

