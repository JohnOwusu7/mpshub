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

interface MenuItem {
    label: string;
    link: string;
    icon: JSX.Element;
    children?: MenuItem[];
}

const roleBasedMenuItems: { [key: string]: MenuItem[] } = {
    ADMIN: [
        {
            label: 'Dashboard',
            link: '/',
            icon: <IconMenuDashboard />,
            children: [
                {
                    label: 'Issues',
                    link: '/',
                    icon: <IconMenuDashboard />,
                },
                {
                    label: 'Inventory Dash',
                    link: '/dashboard/inventory',
                    icon: <IconMenuDashboard />,
                },
            ]
        },
        {
            label: 'Safety Dashboard',
            link: '/',
            icon: <IconMenuTodo />,
            children: [
                {
                    label: 'Planned Job Obervation',
                    link: '/safety/pjo',
                    icon: <IconMenuDashboard />,
                },
                {
                    label: 'Safety Interation Record',
                    link: '/safety/sir',
                    icon: <IconMenuDashboard />,
                },
            ]
        },
        {
            label: 'Operators and Equipments',
            link: '/installations',
            icon: <IconMenuFontIcons />,
            children: [
                {
                    label: 'Installations List',
                    link: '/installations/list',
                    icon: <IconMenuFontIcons />,
                },
                {
                    label: 'Operators List',
                    link: '/operators/all',
                    icon: <IconMenuFontIcons />,
                },
                {
                    label: 'Heavy Equipment List',
                    link: '/installations/heavy-equipment',
                    icon: <IconMenuFontIcons />,
                },
            ],
        },
        {
            label: 'IP Address',
            link: '/address',
            icon: <IconMenuContacts />,
            children: [
                {
                    label: 'MAPS',
                    link: '/address/maps',
                    icon: <IconMenuContacts />,
                },
                {
                    label: 'PTP1',
                    link: '/address/ptp1',
                    icon: <IconMenuContacts />,
                },
                {
                    label: 'Shovel List',
                    link: '/address/shovels',
                    icon: <IconMenuContacts />,
                },
                {
                    label: 'Trucks',
                    link: '/address/trucks',
                    icon: <IconMenuContacts />,
                },
                {
                    label: 'Dispatch Devices',
                    link: '/address/dispatch-computers',
                    icon: <IconMenuContacts />,
                },
            ],
        },
        {
            label: 'Activity Hub',
            link: '/task-manager',
            icon: <IconMenuTodo />,
        },
        {
            label: 'Inventory Hub',
            link: '/inventory',
            icon: <IconMenuScrumboard />,
        },
        {
            label: 'User Accounts',
            link: '/users/list',
            icon: <IconMenuUsers />,
        },
        {
            label: 'Report Forum',
            link: '/daily/report',
            icon: <IconDribbble />,
        },
        {
            label: 'Settings',
            link: '/settings',
            icon: <IconSettings />,
        }
    ],
    DISPATCH: [
        {
            label: 'Dispatch Hub',
            link: '/task-manager',
            icon: <IconMenuNotes />,
        },
        {
            label: 'Dispatch ticket forum',
            link: '/ticket',
            icon: <IconMenuNotes />,
        },
        {
            label: 'Assign Ticket',
            link: '/assign',
            icon: <IconMenuScrumboard />,
        },
    ],
    GEOTECH: [
        {
            label: 'Geotech Hub',
            link: '/activity',
            icon: <IconMenuNotes />,
        },
        {
            label: 'GEO Report forum',
            link: '/ticket',
            icon: <IconMenuNotes />,
        }
    ],
    'RAMJACK': [
        {
            label: 'RamJack Dashboard',
            link: '/dashboard',
            icon: <IconDesktop />,
        },
        {
            label: 'Inventory Hub',
            link: '/inventory',
            icon: <IconMenuScrumboard />,
        },
        {
            label: 'Equipment Usage',
            link: '/get-item',
            icon: <IconMenuTodo />,
        },
        {
            label: 'RamJack HUB',
            link: '/activity',
            icon: <IconMenuNotes />,
        },
        {
            label: 'Daily Report Tab',
            link: '/daily/report',
            icon: <IconDribbble />,
        },
    ],
    BENEWISE: [
        {
            label: 'Beniwise Dashbub',
            link: '/dashboard',
            icon: <IconDesktop />,
        },
        {
            label: 'Beniwise Ticket Forum',
            link: '/ticket',
            icon: <IconMenuNotes />,
        }
    ],
    'AFRIYIE': [
        {
            label: 'Afriyie Dash Hub',
            link: '/dashboard',
            icon: <IconDesktop />,
        },
        {
            label: 'Issuing Forum',
            link: '/activity',
            icon: <IconMenuNotes />,
        },
        {
            label: 'Equipment Usage',
            link: '/get-item',
            icon: <IconMenuTodo />,
        },
        {
            label: 'Inventory',
            link: '/inventory',
            icon: <IconMenuScrumboard />,
        },
        {
            label: 'IP Address Lists',
            link: '/address',
            icon: <IconMenuContacts />,
            children: [
                {
                    label: 'MAPS',
                    link: '/address/maps',
                    icon: <IconMenuContacts />,
                },
                {
                    label: 'PTP1',
                    link: '/address/ptp1',
                    icon: <IconMenuContacts />,
                },
                {
                    label: 'Shovel List',
                    link: '/address/shovels',
                    icon: <IconMenuContacts />,
                },
                {
                    label: 'Trucks',
                    link: '/address/trucks',
                    icon: <IconMenuContacts />,
                },
                {
                    label: 'Dispatch Devices',
                    link: '/address/dispatch-computers',
                    icon: <IconMenuContacts />,
                },
            ],
        },
        {
            label: 'Afriyie Daily Reports',
            link: '/daily/report',
            icon: <IconMenuNotes />,
        }
    ],
    'SYSTEMS-ENGINEER': [
        {
            label: 'Dash HUB',
            link: '/dashboard',
            icon: <IconDesktop />,
        },
        {
            label: 'IP Address List',
            link: '/address',
            icon: <IconMenuContacts />,
            children: [
                {
                    label: 'MAPS',
                    link: '/address/maps',
                    icon: <IconMenuContacts />,
                },
                {
                    label: 'PTP1',
                    link: '/address/ptp1',
                    icon: <IconMenuContacts />,
                },
                {
                    label: 'Shovel List',
                    link: '/address/shovels',
                    icon: <IconMenuContacts />,
                },
                {
                    label: 'Trucks',
                    link: '/address/trucks',
                    icon: <IconMenuContacts />,
                },
                {
                    label: 'Dispatch Devices',
                    link: '/address/dispatch-computers',
                    icon: <IconMenuContacts />,
                },
            ],
        },
        {
            label: 'Inventory Management',
            link: '/inventory',
            icon: <IconMenuScrumboard />,
        },
        {
            label: 'Systems Activity HUB',
            link: '/activity',
            icon: <IconMenuNotes />,
        },
        {
            label: 'Systems Daily Report',
            link: '/daily/report',
            icon: <IconDribbble />,
        },
        {
            label: 'Equipmnts Usage',
            link: '/get-item',
            icon: <IconMenuTodo />,
        },
        {
            label: 'Assign Ticket',
            link: '/task-manager',
            icon: <IconMenuScrumboard />,
        },

    ],
    MANAGER: [

        {
            label: 'Manager\'s Dashboard',
            link: '/',
            icon: <IconDesktop />,
        },
        {
            label: 'Inventory Dashboard',
            link: '/dashboard/inventory',
            icon: <IconMenuDashboard />,
        },
    ],
    SAFETY: [

        {
            label: 'Planned Job Observation',
            link: '/safety/pjo',
            icon: <IconDesktop />,
        },
        {
            label: 'Safety Interaction Record',
            link: '/safety/sir',
            icon: <IconMenuDashboard />,
        },
    ]
};

export default roleBasedMenuItems;
