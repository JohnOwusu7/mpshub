export const API_CONFIG = {
  baseURL: 'https://mpsserver.onrender.com/api',
  // baseURL: 'http://localhost:7854/api',
  socketUrl: 'https://mpsserver.onrender.com',
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
      getUser: '/users/get-user',
      add: '/users/add',
      edit: '/users/:userId',
      delete: '/users/:userId',
      active: 'users/:userId/block',
      inActive: 'users/:userId/unblock',
      changePassword: 'users/change-password',
    },
  },
  heavyEquipments: {
    endpoints: {
      list: '/heavy-equipments/list',
      listOne: '/heavy-equipments/:id',
      add: '/heavy-equipments',
      edit: '/heavy-equipments',
      delete: '/heavy-equipments',
    },
  },
  operators: {
    endpoints: {
      list: '/operators/list',
      listOne: '/operators/:id',
      add: '/operators',
      edit: '/operators',
      delete: '/operators',
    },
  },
  installations: {
    endpoints: {
      list: '/installations/list',
      listOne: '/installations/:id',
      add: '/installations/add',
      edit: '/installations/:id/equipmentStatus',
      delete: '/installations/:id',
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
      reported: '/issues/reported',
      assigned: '/issues/assign'
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
  }
};

