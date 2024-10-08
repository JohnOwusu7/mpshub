import { lazy } from 'react';

const Preview = lazy(() => import('../pages/safety/Preview'));
const Operators = lazy(() => import('../pages/Operators/Operators'));
const AddEquipmentBulkForm = lazy(() => import('../components/Inventory/BulkUpload'));
const InventoryAnalytics = lazy(() => import('../pages/Dashboard/InventoryAnalytics'));
const EditProfile = lazy(() => import('../pages/Users/EditProfile'));
const CreateTicket  = lazy(() => import('../pages/Dispatch/CreateTicket'));
const GetItemPage = lazy(() => import('../components/Inventory/getItemPage'));
const EquipmentList = lazy(() => import('../pages/Inventory/EquipmentList'));
const AddEquipmentForm = lazy(() => import('../components/Inventory/AddInventory'));
const Login = lazy(() => import('../pages/Auth/Login'));
const Analytics = lazy(() => import('../pages/Dashboard/MainAnalytics'));
const PrivateRoute = lazy(() => import ('../components/Authorization/PrivateRoute'));
const Profile = lazy(() => import('../pages/Users/Profile'));
const Issues = lazy(() => import('../pages/Activities/Issues'));
const RequestPassword = lazy(() => import('../pages/Auth/RequestPassword'))
const ActivityHub = lazy(() => import('../pages/Activities/ActivityHub'));
const Users = lazy(() => import('../pages/Users/Users'));
const Add = lazy(() => import('../pages/Apps/Invoice/Add'));
const GetItem = lazy(() => import('../components/Inventory/GetItem'));
const ReplaceItem = lazy(() => import('../components/Inventory/replaceItem'))
const UnauthorizedAccess = lazy(() => import('../components/Error'));
const NotFound = lazy(() => import('../components/NotFound'));
const DailyReport = lazy(() => import('../pages/Activities/DailyReport'));
const HeavyEquipment = lazy(() => import('../pages/installations/HeavyEquipment'));
const ContractorsDashboard = lazy(() => import('../pages/Contractors/Dashboard'));
const SignOutPage = lazy(() => import('../pages/Auth/SignOut'));
const Settings = lazy(() => import('../pages/AdminSettings/Settings'));
const SafetyDashboard = lazy(() => import('../pages/safety/SafetyDashboard'));
const AddOperatorBulkForm = lazy(() => import('../pages/Operators/bulkUpload'));
const PlannedJobObservation = lazy(() => import('../pages/safety/PlannedJob'));
const SafetyInteractionRecord = lazy(()=> import('../pages/safety/SafetyInteraction'));
const PreviewSafetyInteractionRecord = lazy(()=> import('../pages/safety/PreviewSafetyInteraction'));

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
        element: <PrivateRoute path="/dashboard" element={<ContractorsDashboard />} allowedRoles={['SYSTEMS-ENGINEER', 'RAMJACK', 'AFRIYIE', 'DISPATCH', 'BENEWISE', 'GEOTECH', 'ADMIN']}/>,
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
        element: <PrivateRoute path='/task-manager' element={<ActivityHub /> } allowedRoles={['ADMIN', 'MANAGER', 'DISPATCH', 'SYSTEMS-ENGINEER']}/>,
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

    {
        path: '/operators/upload-bulk',
        element: <PrivateRoute path='/operators/upload-bulk' element={<AddOperatorBulkForm />} allowedRoles={['ADMIN', 'SYSTEMS-ENGINEER']}/>,
        layout: 'default',
    },

    // Admin Settings
    {
        path: '/settings',
        element: <PrivateRoute path='/settings' element={<Settings />} allowedRoles={['ADMIN']} />,
    },

    // Safety Hubs
    {
        path: '/safety/dashboard',
        element: <PrivateRoute path='/safety/dashboard' element={<SafetyDashboard />} allowedRoles={['ADMIN', 'SAFETY']} />,
    },
    {
        path: '/safety/pjo',
        element: <PrivateRoute path='/safety/pjo' element={<PlannedJobObservation />} allowedRoles={['ADMIN', 'SAFETY']} />,
    },
    {
        path: '/safety/sir',
        element: <PrivateRoute path='/safety/sir' element={<SafetyInteractionRecord />} allowedRoles={['ADMIN', 'SAFETY']} />,
    },
    {
        path: '/safety/pjo/preview',
        element: <PrivateRoute path='/safety/pjo/preview' element={<Preview />} allowedRoles={['ADMIN', 'SAFETY']} />,
    },
    {
        path: '/safety/sir/preview',
        element: <PrivateRoute path='/safety/sir/preview' element={<PreviewSafetyInteractionRecord />} allowedRoles={['ADMIN', 'SAFETY']} />,
    },

];

export { routes };
