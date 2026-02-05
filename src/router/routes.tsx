import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

const Preview = lazy(() => import('../pages/safety/Preview'));
const InventoryAnalytics = lazy(() => import('../pages/Dashboard/InventoryAnalytics'));
const EditProfile = lazy(() => import('../pages/Users/EditProfile'));
const CreateTicket = lazy(() => import('../pages/Dispatch/CreateTicket'));
const Login = lazy(() => import('../pages/Auth/Login'));
const SubscriptionExpired = lazy(() => import('../pages/Auth/SubscriptionExpired'));
const Analytics = lazy(() => import('../pages/Dashboard/MainAnalytics'));
const SubscribedModulesDashboard = lazy(() => import('../pages/Dashboard/SubscribedModulesDashboard')); // Import new dashboard
const SuperAdminDashboard = lazy(() => import('../pages/Dashboard/SuperAdminDashboard')); // Import super admin dashboard
const IssueAnalyticsDashboard = lazy(() => import('../pages/Dashboard/IssueAnalyticsDashboard')); // Import issue analytics dashboard
const OperatorDashboard = lazy(() => import('../pages/Dashboard/OperatorDashboard')); // Import operator dashboard
const DashboardRouter = lazy(() => import('../pages/Dashboard/DashboardRouter')); // Import dashboard router
const CompanyDashboard = lazy(() => import('../pages/Dashboard/CompanyDashboard')); // Company home dashboard
const PrivateRoute = lazy(() => import ('../components/Authorization/PrivateRoute'));
const Profile = lazy(() => import('../pages/Users/Profile'));
const SubscriptionStatus = lazy(() => import('../pages/Users/SubscriptionStatus'));
const MyAssignedIssues = lazy(() => import('../pages/Activities/MyAssignedIssues'));
const RequestPassword = lazy(() => import('../pages/Auth/RequestPassword'))
const ActivityHub = lazy(() => import('../pages/Activities/ActivityHub'));
const Users = lazy(() => import('../pages/Users/Users'));
const Add = lazy(() => import('../pages/Apps/Invoice/Add'));
const UnauthorizedAccess = lazy(() => import('../components/Error'));
const NotFound = lazy(() => import('../components/NotFound'));
const DailyReport = lazy(() => import('../pages/Activities/DailyReport'));
const ContractorsDashboard = lazy(() => import('../pages/Contractors/Dashboard'));
const SignOutPage = lazy(() => import('../pages/Auth/SignOut'));
const Settings = lazy(() => import('../pages/AdminSettings/Settings'));
const SafetyDashboard = lazy(() => import('../pages/safety/SafetyDashboard'));
const PlannedJobObservation = lazy(() => import('../pages/safety/PlannedJob'));
const SafetyInteractionRecord = lazy(()=> import('../pages/safety/SafetyInteraction'));
const PreviewSafetyInteractionRecord = lazy(()=> import('../pages/safety/PreviewSafetyInteraction'));
const RegisterCompany = lazy(() => import('../pages/Admin/RegisterCompany'));
const CompaniesList = lazy(() => import('../pages/Admin/CompaniesList')); // Import the new CompaniesList component
const EditCompany = lazy(() => import('../pages/Admin/EditCompany')); // Import the new EditCompany component
const RoleManagement = lazy(() => import('../pages/AdminSettings/RoleManagement')); // Import the new RoleManagement component
const ChangePassword = lazy(() => import('../pages/Users/ChangePassword')); // Import the new ChangePassword component
const ModuleSubscriptionManagement = lazy(() => import('../pages/Admin/ModuleSubscriptionManagement')); // Import new ModuleSubscriptionManagement component
const PaymentManagement = lazy(() => import('../pages/Admin/PaymentManagement')); // Import PaymentManagement component
const AllCompanyUsers = lazy(() => import('../pages/Admin/AllCompanyUsers')); // Import new AllCompanyUsers component
const DepartmentManagement = lazy(() => import('../pages/AdminSettings/DepartmentManagement')); // Import new DepartmentManagement component
const SectionManagement = lazy(() => import('../pages/AdminSettings/SectionManagement')); // Import new SectionManagement component
const SubsectionManagement = lazy(() => import('../pages/AdminSettings/SubsectionManagement')); // Import new SubsectionManagement component
const ServiceManagement = lazy(() => import('../pages/AdminSettings/ServiceManagement')); // Import Service Management component

type Route = {
    path: string;
    element: React.ReactNode;
    layout?: string;
    allowedRoles?: string[];
    allowedPermissions?: string[]; // Add allowedPermissions
};

const routes: Route[] = [
    {
        path: '*',
        element: <NotFound />,
        layout: 'default',
    },
    {
        path: '/apps/invoice/add',
        element: <PrivateRoute path="/apps/invoice/add" element={<Add />} allowedPermissions={['invoice:manage']} />,
        layout: 'default'
    },
    // Auth
    {
        path: '/auth',
        element: <Login />,
        layout: 'blank',
    },
    {
        path: '/auth/subscription-expired',
        element: <SubscriptionExpired />,
        layout: 'blank',
    },
    {
        path: '/admin/register-company',
        element: <PrivateRoute path="/admin/register-company" element={<RegisterCompany />} allowedPermissions={['company:register']} />,
        layout: 'default',
    },
    {
        path: '/admin/companies',
        element: <PrivateRoute path="/admin/companies" element={<CompaniesList />} allowedPermissions={['company:view']} />,
        layout: 'default',
    },
    {
        path: '/admin/companies/edit/:companyId',
        element: <PrivateRoute path="/admin/companies/edit/:companyId" element={<EditCompany />} allowedPermissions={['company:manage']} />,
        layout: 'default',
    },
    {
        path: '/admin/module-subscriptions',
        element: <PrivateRoute path="/admin/module-subscriptions" element={<ModuleSubscriptionManagement />} allowedPermissions={['SUPER-ADMIN']} />,
        layout: 'default',
    },
    {
        path: '/admin/payments',
        element: <PrivateRoute path="/admin/payments" element={<PaymentManagement />} allowedPermissions={['SUPER-ADMIN']} />,
        layout: 'default',
    },
    {
        path: '/admin/all-company-users',
        element: <PrivateRoute path="/admin/all-company-users" element={<AllCompanyUsers />} allowedPermissions={['SUPER-ADMIN']} />,
        layout: 'default',
    },
    {
        path: '/admin/departments',
        element: <PrivateRoute path="/admin/departments" element={<DepartmentManagement />} allowedPermissions={['department:manage', 'company:manage', 'all:access']} />,
        layout: 'default',
    },
    {
        path: '/admin/departments/company/:companyId',
        element: <PrivateRoute path="/admin/departments/company/:companyId" element={<DepartmentManagement />} allowedPermissions={['department:manage', 'company:manage', 'all:access']} />,
        layout: 'default',
    },
    {
        path: '/admin/sections',
        element: <PrivateRoute path="/admin/sections" element={<SectionManagement />} allowedPermissions={['section:manage']} />,
        layout: 'default',
    },
    {
        path: '/admin/sections/company/:companyId/department/:departmentId',
        element: <PrivateRoute path="/admin/sections/company/:companyId/department/:departmentId" element={<SectionManagement />} allowedPermissions={['section:manage']} />,
        layout: 'default',
    },
    {
        path: '/admin/subsections',
        element: <PrivateRoute path="/admin/subsections" element={<SubsectionManagement />} allowedPermissions={['section:manage']} />,
        layout: 'default',
    },
    {
        path: '/admin/subsections/company/:companyId/department/:departmentId/section/:sectionId',
        element: <PrivateRoute path="/admin/subsections/company/:companyId/department/:departmentId/section/:sectionId" element={<SubsectionManagement />} allowedPermissions={['section:manage']} />,
        layout: 'default',
    },
    {
        path: '/admin/services',
        element: <PrivateRoute path="/admin/services" element={<ServiceManagement />} allowedPermissions={['service:view', 'service:manage', 'section:manage']} />,
        layout: 'default',
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
    // Dashboard - Role-based routing
    {
        path: '/',
        element: <PrivateRoute path="/" element={<DashboardRouter />} allowedPermissions={[]} />,
        layout: 'default',
    },
    {
        path: '/dashboard/home',
        element: <PrivateRoute path="/dashboard/home" element={<CompanyDashboard />} allowedRoles={['ADMIN', 'MANAGER']} />,
        layout: 'default',
    },
    {
        path: '/dashboard/issues',
        element: <PrivateRoute path="/dashboard/issues" element={<IssueAnalyticsDashboard />} allowedPermissions={['issue:view']} />,
        layout: 'default',
    },
    {
        path: '/dashboard/my',
        element: <PrivateRoute path="/dashboard/my" element={<OperatorDashboard />} allowedPermissions={[]} />,
        layout: 'default',
    },
    {
        path: '/my-issues',
        element: <PrivateRoute path="/my-issues" element={<MyAssignedIssues />} allowedPermissions={['issue:view']} />,
        layout: 'default',
    },
    {
        path: '/dashboard/inventory',
        element: <PrivateRoute path="/inventory/dash/" element={<InventoryAnalytics />} allowedPermissions={['dashboard:view']} />
    },

    // Contractors Dashboard
    {
        path: '/dashboard',
        element: <PrivateRoute path="/dashboard" element={<ContractorsDashboard />} allowedPermissions={['dashboard:view']} />,
        layout: 'default',
    },

    // users route
    {
        path: '/users/list',
        element: <PrivateRoute path="/users/list" element={<Users />} allowedPermissions={['user:view']} />,
        layout: 'default',
    },
    {
        path: '/users/profile',
        element: <PrivateRoute path="/users/profile" element={<Profile />} allowedPermissions={['user:view:self']} />,
        layout: 'default',
    },
    {
        path: '/users/profile-settings',
        element: <PrivateRoute path="/users/profile/edit" element={<EditProfile />} allowedPermissions={['user:manage:self']} />,
        layout: 'default',
    },
    {
        path: '/users/subscription-status',
        element: <PrivateRoute path="/users/subscription-status" element={<SubscriptionStatus />} allowedRoles={['SUPER-ADMIN', 'ADMIN', 'MANAGER']} />,
        layout: 'default',
    },
    {
        path: '/users/change-password',
        element: <PrivateRoute path="/users/change-password" element={<ChangePassword />} allowedPermissions={['user:manage:self']} />,
        layout: 'default',
    },
    // Tickets / Activity – single place to view and manage tickets (Activity Hub)
    {
        path: '/activity',
        element: <PrivateRoute path='/activity' element={<ActivityHub />} allowedPermissions={['issue:view', 'issue:assign']} />,
        layout: 'default',
    },
    {
        path: '/task-manager',
        element: <Navigate to="/activity" replace />,
        layout: 'default',
    },
    {
        path: '/ticket',
        element: <PrivateRoute path='/ticket' element={<CreateTicket />} allowedPermissions={['issue:create']} />,
        layout: 'default',
    },

    // Reports
    {
        path: '/daily/report',
        element: <PrivateRoute path='/daily/report' element={<DailyReport />} allowedPermissions={['report:view']} />,
        layout: 'default',
    },

    // Admin Settings
    {
        path: '/settings',
        element: <PrivateRoute path='/settings' element={<Settings />} allowedPermissions={['user:manage', 'role:manage']} />,
    },
    {
        path: '/admin/roles',
        element: <PrivateRoute path="/admin/roles" element={<RoleManagement />} allowedPermissions={['role:manage']} />,
        layout: 'default',
    },
    {
        path: '/admin/all-company-users',
        element: <PrivateRoute path="/admin/all-company-users" element={<AllCompanyUsers />} allowedPermissions={['SUPER-ADMIN']} />,
        layout: 'default',
    },

    // Safety Hubs
    {
        path: '/safety/dashboard',
        element: <PrivateRoute path='/safety/dashboard' element={<SafetyDashboard />} allowedPermissions={['safety:view']} />,
    },
    {
        path: '/safety/pjo',
        element: <PrivateRoute path='/safety/pjo' element={<PlannedJobObservation />} allowedPermissions={['safety:view']} />,
    },
    {
        path: '/safety/sir',
        element: <PrivateRoute path='/safety/sir' element={<SafetyInteractionRecord />} allowedPermissions={['safety:view']} />,
    },
    {
        path: '/safety/pjo/preview',
        element: <PrivateRoute path='/safety/pjo/preview' element={<Preview />} allowedPermissions={['safety:view']} />,
    },
    {
        path: '/safety/sir/preview',
        element: <PrivateRoute path='/safety/sir/preview' element={<PreviewSafetyInteractionRecord />} allowedPermissions={['safety:view']} />,
    },

];

export { routes };
