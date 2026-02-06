import IconMenuDashboard from '../Icon/Menu/IconMenuDashboard';
import IconMenuTodo from '../Icon/Menu/IconMenuTodo';
import IconMenuNotes from '../Icon/Menu/IconMenuNotes';
import IconMenuScrumboard from '../Icon/Menu/IconMenuScrumboard';
import IconMenuContacts from '../Icon/Menu/IconMenuContacts';
import IconMenuFontIcons from '../Icon/Menu/IconMenuFontIcons';
import IconMenuUsers from '../Icon/Menu/IconMenuUsers';
import IconDribbble from '../Icon/IconDribbble';
import IconDesktop from '../Icon/IconDesktop';
import IconSettings from '../Icon/IconSettings';
import IconBolt from '../Icon/IconBolt';
import IconBuilding from '../Icon/IconBuilding'; // Added IconBuilding import
import IconServer from '../Icon/IconServer';
import IconDollarSign from '../Icon/IconDollarSign'; // Added IconDollarSign import
import { useSelector, useDispatch } from 'react-redux';
import { IRootState } from '../../store';
import { useState, useEffect } from 'react'; // Import useState and useEffect
import { getCompanyByIdApi, Company } from '../../Api/api'; // Import API functions and interfaces
import { fetchCompanyInfo, updateCompanyInfo } from '../../store/companySlice'; // Import company slice actions

interface MenuItem {
    label: string;
    link: string;
    icon: JSX.Element;
    permissions?: string[]; // Add permissions field
    children?: MenuItem[];
    moduleName?: string; // New field to associate with subscribed modules
    requireAllPermissions?: boolean; // If true, requires ALL permissions; if false/undefined, requires ANY permission
}

// Define a flat list of all possible menu items with their required permissions
const allMenuItems: MenuItem[] = [
    {
        label: 'Dashboard',
        link: '/',
        icon: <IconMenuDashboard />,
        permissions: [], // No permission required - available to all users
        moduleName: 'mainDashboard', // Core module - always visible
        children: [
            {
                label: 'Super Admin Dashboard',
                link: '/',
                icon: <IconMenuDashboard />,
                permissions: ['SUPER-ADMIN'], // Only for SUPER-ADMIN
                moduleName: 'mainDashboard',
            },
            {
                label: 'Home',
                link: '/dashboard/home',
                icon: <IconMenuDashboard />,
                permissions: ['ADMIN', 'MANAGER'], // Company admins only
                moduleName: 'mainDashboard',
            },
            {
                label: 'Analytics',
                link: '/dashboard/issues',
                icon: <IconMenuDashboard />,
                permissions: ['issue:view', 'issue:assign'], // For Admin/Manager
                moduleName: 'issueReporting',
                requireAllPermissions: false, // Any of these permissions
            },
            {
                label: 'My Dashboard',
                link: '/dashboard/my',
                icon: <IconMenuDashboard />,
                permissions: [], // All company users (operators, engineers, etc.)
                moduleName: 'mainDashboard',
            },
            {
                label: 'Inventory Dash',
                link: '/dashboard/inventory',
                icon: <IconMenuDashboard />,
                permissions: ['inventory:view'],
                moduleName: 'inventory',
            },
        ]
    },
    {
        label: 'Issues',
        link: '/activity',
        icon: <IconMenuTodo />,
        permissions: [], // Parent: visibility from children
        moduleName: 'issueReporting',
        children: [
            {
                label: 'Activity Hub',
                link: '/activity',
                icon: <IconMenuTodo />,
                permissions: ['issue:view', 'issue:assign'],
                moduleName: 'issueReporting',
                requireAllPermissions: false,
            },
            {
                label: 'My Issues',
                link: '/my-issues',
                icon: <IconMenuNotes />,
                permissions: ['issue:view'],
                moduleName: 'issueReporting',
            },
            {
                label: 'Create ticket',
                link: '/ticket',
                icon: <IconMenuNotes />,
                permissions: ['issue:create'],
                moduleName: 'issueReporting',
            },
        ],
    },
    {
        label: 'Organization Setup',
        link: '#',
        icon: <IconBuilding />,
        permissions: ['ADMIN'], // ADMIN only – Manager does not need this
        moduleName: 'companyManagement',
        children: [
            {
                label: 'Register Company',
                link: '/admin/register-company',
                icon: <IconBolt />,
                permissions: ['company:register'], // SUPER-ADMIN only - company admins should NOT see this
                moduleName: 'companyManagement',
            },
            {
                label: 'Companies List',
                link: '/admin/companies',
                icon: <IconMenuContacts />,
                permissions: ['company:view'], // SUPER-ADMIN only - company admins should NOT see this
                moduleName: 'companyManagement',
            },
            {
                label: 'Section Management',
                link: '/admin/sections',
                icon: <IconBuilding />,
                permissions: ['section:manage'], // Company admins can create sections
                moduleName: 'companyManagement',
            },
            {
                label: 'Subsection Management',
                link: '/admin/subsections',
                icon: <IconBuilding />,
                permissions: ['section:manage'],
                moduleName: 'companyManagement',
            },
            {
                label: 'Service Management',
                link: '/admin/services',
                icon: <IconServer />,
                permissions: ['service:view', 'service:manage'],
                moduleName: 'companyManagement',
            },
            {
                label: 'User Management',
                link: '/users/list',
                icon: <IconMenuUsers />,
                permissions: ['user:view'], // Company admins can manage users
                moduleName: 'userManagement',
            },
        ]
    },
    {
        label: 'Roles Management',
        link: '/admin/roles',
        icon: <IconSettings />,
        permissions: ['role:manage'], // ADMIN only – Manager does not need this
        moduleName: 'roleManagement',
    },
    {
        label: 'Subscription Status',
        link: '/users/subscription-status',
        icon: <IconDollarSign />,
        permissions: ['ADMIN'], // ADMIN only – Manager does not need this
        moduleName: 'subscriptionStatus',
    },
    {
        label: 'Settings',
        link: '/settings',
        icon: <IconSettings />,
        permissions: ['user:manage:self', 'role:manage'], // ADMIN only – Manager (section head) does not need this
        moduleName: 'settings',
        requireAllPermissions: false,
    },
    {
        label: 'Report Forum',
        link: '/daily/report',
        icon: <IconDribbble />,
        permissions: ['report:view'],
        moduleName: 'reportForum',
    },
    {
        label: 'Safety Dashboard',
        link: '/',
        icon: <IconMenuTodo />,
        permissions: ['safety:view'],
        moduleName: 'safetyPJO',
        children: [
            {
                label: 'Planned Job Observation',
                link: '/safety/pjo',
                icon: <IconMenuDashboard />,
                permissions: ['safety:view'],
                moduleName: 'safetyPJO',
            },
            {
                label: 'Safety Interaction Record',
                link: '/safety/sir',
                icon: <IconMenuDashboard />,
                permissions: ['safety:view'],
                moduleName: 'safetyPJO',
            },
        ]
    },
    {
        label: 'Operators and Equipments',
        link: '/installations',
        icon: <IconMenuFontIcons />,
        permissions: ['installation:view', 'operator:view', 'equipment:view'],
        moduleName: 'equipmentAndOperator', // Group these under one module
        children: [
            {
                label: 'Installations List',
                link: '/installations/heavy-equipment',
                icon: <IconMenuFontIcons />,
                permissions: ['installation:view'],
                moduleName: 'equipmentAndOperator',
            },
            {
                label: 'Operators List',
                link: '/operators/all',
                icon: <IconMenuFontIcons />,
                permissions: ['operator:view'],
                moduleName: 'equipmentAndOperator',
            },
            {
                label: 'Heavy Equipment List',
                link: '/installations/heavy-equipment',
                icon: <IconMenuFontIcons />,
                permissions: ['equipment:view'],
                moduleName: 'equipmentAndOperator',
            },
        ],
    },
    {
        label: 'Inventory Hub',
        link: '/inventory',
        icon: <IconMenuScrumboard />,
        permissions: ['equipment:view'],
        moduleName: 'inventory',
    },
    {
        label: 'Module Management',
        link: '/admin/module-subscriptions',
        icon: <IconSettings />,
        permissions: ['SUPER-ADMIN'], // Only SUPER-ADMIN can see this
        moduleName: 'companyManagement', // Group under company management for SUPER-ADMIN
    },
    {
        label: 'Payment Management',
        link: '/admin/payments',
        icon: <IconDollarSign />,
        permissions: ['SUPER-ADMIN'], // Only SUPER-ADMIN can see this
        moduleName: 'companyManagement', // Group under company management for SUPER-ADMIN
    },
    {
        label: 'All Users Management',
        link: '/admin/all-company-users',
        icon: <IconMenuUsers />,
        permissions: ['SUPER-ADMIN'], // Only SUPER-ADMIN can see this
        moduleName: 'companyManagement', // Group under company management for SUPER-ADMIN
    },
    {
        label: 'Department Management',
        link: '/admin/departments',
        icon: <IconBuilding />,
        permissions: ['SUPER-ADMIN'], // SUPER-ADMIN only - company admins cannot see or create departments
        moduleName: 'companyManagement',
    },
];

const hasRequiredPermissions = (userPermissions: string[], requiredPermissions?: string[], userRoleName?: string, requireAll?: boolean): boolean => {
    if (!requiredPermissions || requiredPermissions.length === 0) {
        return true; // No specific permissions required, so access is granted
    }
    // Check if any required item is a role name (like 'SUPER-ADMIN')
    const roleNames = ['SUPER-ADMIN', 'ADMIN', 'MANAGER'];
    const hasRoleMatch = requiredPermissions.some(req => {
        if (roleNames.includes(req) && userRoleName === req) {
            return true;
        }
        return false;
    });
    if (hasRoleMatch) {
        return true;
    }
    // If requireAll is true, check that ALL permissions are present
    // Otherwise, check that ANY permission is present (default behavior)
    if (requireAll) {
        return requiredPermissions.every(permission => userPermissions.includes(permission));
    }
    return requiredPermissions.some(permission => userPermissions.includes(permission));
};

const CORE_ADMIN_MODULES = ['userManagement', 'roleManagement', 'settings', 'companyManagement', 'mainDashboard', 'subscriptionStatus', 'issueReporting']; // Admin/Manager modules (Issues always available when user has issue:* permissions)
const CORE_USER_MODULES = ['mainDashboard']; // Modules visible to all users (subscriptionStatus is admin-only)

const filterMenuItems = (
    menuItems: MenuItem[],
    userPermissions: string[],
    isSuperAdmin: boolean,
    subscribedModules: string[],
    userRoleName?: string
): MenuItem[] => {
    const roleForCheck = userRoleName ?? (isSuperAdmin ? 'SUPER-ADMIN' : undefined);

    if (isSuperAdmin) {
        return menuItems; // Super-admin sees everything
    }

    return menuItems.filter(item => {
        // Always show core user modules (like Dashboard) to all users
        if (CORE_USER_MODULES.includes(item.moduleName as string)) {
            // For parent menus with children, check if any child is accessible
            if (item.children) {
                const filteredChildren = filterMenuItems(item.children, userPermissions, isSuperAdmin, subscribedModules, userRoleName);
                // Always show Dashboard parent even if no children are visible (it will route to appropriate dashboard)
                item.children = filteredChildren;
                // Dashboard should always be visible - it has no permission requirement
                return true;
            }
            // For items without children, show if no permission required or user has permission
            return !item.permissions || item.permissions.length === 0 || hasRequiredPermissions(userPermissions, item.permissions, roleForCheck, item.requireAllPermissions);
        }

        // Always show core ADMIN modules regardless of subscription (visibility still filtered by permissions/role)
        if (CORE_ADMIN_MODULES.includes(item.moduleName as string)) {
            if (item.children) {
                const filteredChildren = filterMenuItems(item.children, userPermissions, isSuperAdmin, subscribedModules, userRoleName);
                if (filteredChildren.length === 0) {
                    return false;
                }
                item.children = filteredChildren;
                // If parent has required permissions (e.g. ADMIN only), user must pass that to see the parent at all
                if (item.permissions && item.permissions.length > 0) {
                    if (!hasRequiredPermissions(userPermissions, item.permissions, roleForCheck, item.requireAllPermissions)) {
                        return false; // e.g. Organisation Setup is ADMIN-only; Manager must not see it
                    }
                }
                return true;
            }
            return hasRequiredPermissions(userPermissions, item.permissions, roleForCheck, item.requireAllPermissions);
        }

        // For other modules, check subscription first, then permissions
        const isCoreModule = CORE_USER_MODULES.includes(item.moduleName as string) || CORE_ADMIN_MODULES.includes(item.moduleName as string);
        if (item.moduleName && !isCoreModule && !subscribedModules.includes(item.moduleName)) {
            return false; // Not subscribed to this module
        }

        const hasAccess = hasRequiredPermissions(userPermissions, item.permissions, roleForCheck, item.requireAllPermissions);
        if (item.children) {
            const filteredChildren = filterMenuItems(item.children, userPermissions, isSuperAdmin, subscribedModules, userRoleName);
            // Only keep the parent if there are visible children
            if (filteredChildren.length === 0) {
                return false; // No visible children, hide parent
            }
            // Update the children array with filtered results
            item.children = filteredChildren;
            // Keep parent if it has access or any of its children have access
            // If parent has no permission requirement, show if any child is visible
            if (!item.permissions || item.permissions.length === 0) {
                return item.children.length > 0;
            }
            return hasAccess || item.children.length > 0;
        }
        return hasAccess;
    });
};

export const useGenerateMenuItems = (): MenuItem[] => {
    const dispatch = useDispatch();
    const user = useSelector((state: IRootState) => state.user.user);
    const companyInfo = useSelector((state: IRootState) => state.company?.companyInfo);
    const [filteredMenuItems, setFilteredMenuItems] = useState<MenuItem[]>([]);

    const userPermissions = user?.permissions || [];
    const isSuperAdmin = user?.roleName === 'SUPER-ADMIN';
    const companyId = user?.companyId;

    // Fetch company info when companyId changes
    useEffect(() => {
        if (companyId && !companyInfo) {
            dispatch(fetchCompanyInfo(companyId) as any);
        }
    }, [companyId, dispatch, companyInfo]);

    // Refresh company info periodically or when needed
    useEffect(() => {
        if (companyId) {
            // Fetch company info on mount and set up interval to refresh
            dispatch(fetchCompanyInfo(companyId) as any);
            
            // Refresh every 30 seconds to catch module updates
            const interval = setInterval(() => {
                dispatch(updateCompanyInfo(companyId) as any);
            }, 30000); // 30 seconds

            return () => clearInterval(interval);
        }
    }, [companyId, dispatch]);

    useEffect(() => {
        const subscribedModules = companyInfo?.subscribedModules || [];
        const userRoleName = user?.roleName;
        const items = filterMenuItems(allMenuItems, userPermissions, isSuperAdmin, subscribedModules, userRoleName);
        setFilteredMenuItems(items);
    }, [userPermissions, isSuperAdmin, companyInfo, user?.roleName]); // Re-filter when user or companyInfo changes

    return filteredMenuItems;
};
