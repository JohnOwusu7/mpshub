import { lazy } from 'react';
import ContractorsDashboard from '../pages/Contractors/Dashboard';
import SignOutPage from '../pages/Auth/SignOut';
import Settings from '../pages/AdminSettings/Settings';
import SafetyDashboard from '../pages/safety/SafetyDashboard';
const Operators = lazy(() => import('../pages/Operators/Operators'))

const AddEquipmentBulkForm = lazy(() => import('../components/Inventory/BulkUpload'));
const InventoryAnalytics = lazy(() => import('../pages/Dashboard/InventoryAnalytics'));
const EditProfile = lazy(() => import('../pages/Users/EditProfile'));
const CreateTicket  = lazy(() => import('../pages/Dispatch/CreateTicket'));
const TransactionFilterForm = lazy(() => import('../pages/Dashboard/Report'));
const GetItemPage = lazy(() => import('../components/Inventory/getItemPage'));
const EquipmentList = lazy(() => import('../pages/Inventory/EquipmentList'));
const AddEquipmentForm = lazy(() => import('../components/Inventory/AddInventory'));
const Login = lazy(() => import('../pages/Auth/Login'));
const Analytics = lazy(() => import('../pages/Dashboard/MainAnalytics'));
const PrivateRoute = lazy(() => import ('../components/Authorization/PrivateRoute'));
const AddressEdit = lazy(() => import('../components/APAddress/AddressEdit'));
const Profile = lazy(() => import('../pages/Users/Profile'));
const Issues = lazy(() => import('../pages/Activities/Issues'));
const RequestPassword = lazy(() => import('../pages/Auth/RequestPassword'))

const ActivityHub = lazy(() => import('../pages/Activities/ActivityHub'));
const Maps = lazy(() => import('../pages/Address/Maps'));
const Shovels = lazy(() => import('../pages/Address/Shovels'));
const Trucks = lazy(() => import('../pages/Address/Trucks'));
const DispatchComputers = lazy(() => import('../pages/Address/DispatchComputers'));
const AddressAdd = lazy(() => import('../components/APAddress/AddressAdd'));
const Users = lazy(() => import('../pages/Users/Users'));
const PTPs = lazy(() => import('../pages/Address/PTP'));
const Add = lazy(() => import('../pages/Apps/Invoice/Add'));
const GetItem = lazy(() => import('../components/Inventory/GetItem'));
const ReplaceItem = lazy(() => import('../components/Inventory/replaceItem'))
const UnauthorizedAccess = lazy(() => import('../components/Error'));
const NotFound = lazy(() => import('../components/NotFound'));
const DailyReport = lazy(() => import('../pages/Activities/DailyReport'));

const HeavyEquipment = lazy(() => import('../pages/installations/HeavyEquipment'));

type Route = {
    path: string;
    element: React.ReactNode;
    layout?: string;
    allowedRoles?: string[];
};

const routes: Route[] = [
    {
        path: '*',
        element: <NotFound />,
        layout: 'default',
    },
    {
        path: '/apps/invoice/add',
        element: <PrivateRoute path="/apps/invoice/add" element={<Add />} />,
        layout: 'default'
    },
    // Auth
    {
        path: '/auth',
        element: <Login />,
        layout: 'blank',
    },
    {
        path: '/auth/request-password',
        element: <RequestPassword />,
        layout: 'blank',
    },
    {
        path: '/sign-out',
        element: <SignOutPage />,
        layout: 'blank',
    },
    // Dashboard
    {
        path: '/',
        element: <PrivateRoute path="/" element={<Analytics />} allowedRoles={['ADMIN', 'MANAGER']} />,
        layout: 'default',
    },
    {
        path: '/dashboard/inventory',
        element: <PrivateRoute path="/inventory/dash/" element={<InventoryAnalytics />} allowedRoles={['ADMIN', 'MANAGER']}/>
    },

    // Contractors Dashboard
    {
        path: '/dashboard',
        element: <PrivateRoute path="/dashboard" element={<ContractorsDashboard />} allowedRoles={['SYSTEMS-ENGINEER', 'RAMJACK', 'AFRIYIE', 'DISPATCH', 'BENEWISE', 'GEOTECH']}/>,
        layout: 'default',
    },

    // IP Addresses
    {
        path: '/address/maps',
        element: <PrivateRoute path="/address/maps" element={<Maps />} allowedRoles={['ADMIN', 'SYSTEMS-ENGINEER', 'AFRIYIE']} />,
        layout: 'default',
    },
    {
        path: '/address/maps',
        element: <PrivateRoute path="/address/maps" element={<Maps />} allowedRoles={['ADMIN', 'SYSTEMS-ENGINEER', 'AFRIYIE']}/>,
        layout: 'default',
    },
    {
        path: '/address/ptp1',
        element: <PrivateRoute path="/address/ptp1" element={<PTPs />} allowedRoles={['ADMIN', 'SYSTEMS-ENGINEER', 'AFRIYIE']}/>,
        layout: 'default',
    },
    {
        path: '/address/shovels',
        element: <PrivateRoute path="/address/shovels" element={<Shovels />} allowedRoles={['ADMIN', 'SYSTEMS-ENGINEER', 'AFRIYIE']}/>,
        layout: 'default',
    },
    {
        path: '/address/trucks',
        element: <PrivateRoute path="/address/shovels" element={<Trucks />} allowedRoles={['ADMIN', 'SYSTEMS-ENGINEER', 'AFRIYIE']}/>,
        layout: 'default',
    },
    {
        path: '/address/dispatch-computers',
        element: <PrivateRoute path="/address/dispatch-computers" element={<DispatchComputers />} allowedRoles={['ADMIN', 'SYSTEMS-ENGINEER', 'AFRIYIE']}/>,
        layout: 'default',
    },
    {
        path: '/address/add',
        element: <PrivateRoute path="/address/add" element={<AddressAdd />} allowedRoles={['ADMIN', 'SYSTEMS-ENGINEER', 'AFRIYIE']}/>,
        layout: 'default',
    },
    {
        path: '/address/edit',
        element: <PrivateRoute path="/address/edit" element={<AddressEdit />} allowedRoles={['ADMIN', 'SYSTEMS-ENGINEER', 'AFRIYIE']}/>,
        layout: 'default',
    },

    // users route
    {
        path: '/users/list',
        element: <PrivateRoute path="/users/list" element={<Users />} allowedRoles={['ADMIN', 'MANAGER']} />,
        layout: 'default',
    },
    {
        path: '/users/profile',
        element: <PrivateRoute path="/users/profile" element={<Profile />} />,
        layout: 'default',
    },
    {
        path: '/users/profile-settings',
        element: <PrivateRoute path="/users/profile/edit" element={<EditProfile />} />,
        layout: 'default',
    },
    // Activity Hub
    {
        path: '/activity/',
        element: <PrivateRoute path='/activity' element={<Issues />} allowedRoles={['SYSTEMS-ENGINEER', 'AFRIYIE', 'RAMJACK', 'DISPATCH', 'BENEWISE', 'GEOTECH']}/>,
        layout: 'blank',
    },
    {
        path: '/task-manager',
        element: <PrivateRoute path='/task-manager' element={<ActivityHub /> } allowedRoles={['ADMIN', 'MANAGER']}/>,
        layout: 'default',
    },
    {
        path: '/ticket',
        element: <PrivateRoute path='/ticket' element={<CreateTicket /> } allowedRoles={['BENEWISE', 'DISPATCH', 'ADMIN', 'MANAGER', 'GEOTECH']}/>,
        layout: 'default',
    },

    // getting Inventory Item
    {
        path: '/get-item/input',
        element: <PrivateRoute path='/task/scrumboard' element={<GetItem />} allowedRoles={['SYSTEMS-ENGINEER', 'AFRIYIE', 'RAMJACK']}/>,
        layout: 'default',
    },
    {
        path: '/replace-item/input',
        element: <PrivateRoute path='/task/scrumboard' element={<ReplaceItem />} allowedRoles={['SYSTEMS-ENGINEER', 'AFRIYIE', 'RAMJACK']}/>,
        layout: 'default',
    },
    {
        path: '/get-item',
        element: <PrivateRoute path='/task/scrumboard' element={<GetItemPage />} allowedRoles={['SYSTEMS-ENGINEER', 'AFRIYIE', 'RAMJACK']}/>,
        layout: 'default',
    },

    // Inventory Management
    {
        path: '/inventory',
        element: <PrivateRoute path='inventory' element={<EquipmentList />} allowedRoles={['RAMJACK', 'ADMIN', 'SYSTEMS-ENGINEER', 'AFRIYIE']}/>,
        layout: 'default',
    },
    {
        path: '/inventory/add',
        element: <PrivateRoute path='inventory/add' element={<AddEquipmentForm />} allowedRoles={['ADMIN', 'SYSTEMS-ENGINEER', 'AFRIYIE', 'RAMJACK']}/>,
        layout: 'default',
    },
    {
        path: '/inventory/upload-bulk',
        element: <PrivateRoute path='/inventory/upload-bulk' element={<AddEquipmentBulkForm />} allowedRoles={['ADMIN', 'SYSTEMS-ENGINEER']}/>,
        layout: 'default',
    },
    {
        path: "/unauthorized",
        element: <UnauthorizedAccess />,
        layout: "default",
    },

    // Reports
    {
        path: '/daily/report',
        element: <PrivateRoute path='/daily/report' element={<DailyReport />} allowedRoles={['ADMIN', 'SYSTEMS-ENGINEER', 'RAMJACK', 'AFRIYIE']} />,
        layout: 'default',
    },

    // Installations & Operators
    {
        path: '/installations/heavy-equipment',
        element: <PrivateRoute path='/installations/heavy-equipment' element={<HeavyEquipment />} allowedRoles={['ADMIN']} />,
    },
    {
        path: '/operators/all',
        element: <PrivateRoute path='/installations/heavy-equipment' element={<Operators />} allowedRoles={['ADMIN']} />,
    },

    // Admin Settings
    {
        path: '/settings',
        element: <PrivateRoute path='/settings' element={<Settings />} allowedRoles={['ADMIN']} />,
    },

    // Safety Hubs
    {
        path: '/safety/dashboard',
        element: <PrivateRoute path='/safety/dashboard' element={<SafetyDashboard />} allowedRoles={['ADMIN']} />,
    },

];

export { routes };
