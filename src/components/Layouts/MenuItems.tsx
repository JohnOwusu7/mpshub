import React from 'react';
import IconMenuDashboard from '../Icon/Menu/IconMenuDashboard';
import IconMenuTodo from '../Icon/Menu/IconMenuTodo';
import IconMenuNotes from '../Icon/Menu/IconMenuNotes';
import IconMenuScrumboard from '../Icon/Menu/IconMenuScrumboard';
import IconMenuContacts from '../Icon/Menu/IconMenuContacts';
import IconMenuFontIcons from '../Icon/Menu/IconMenuFontIcons';
import IconMenuUsers from '../Icon/Menu/IconMenuUsers';
import IconDribbble from '../Icon/IconDribbble';
import IconDesktop from '../Icon/IconDesktop';

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
            label: 'Installations',
            link: '/installations',
            icon: <IconMenuFontIcons />,
            children: [
                {
                    label: 'Installations List',
                    link: '/installations/list',
                    icon: <IconMenuFontIcons />,
                },
                {
                    label: 'Equipment List',
                    link: '/installations/equipment',
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
        }
    ],
    DISPATCH: [
        {
            label: 'Dispatch Hub',
            link: '/activity',
            icon: <IconMenuNotes />,
        },
        {
            label: 'Dispatch ticket forum',
            link: '/ticket',
            icon: <IconMenuNotes />,
        }
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
    'RAM-JACK': [
        {
            label: 'Ram Jack Dashboard',
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
            label: 'Ram Jack HUB',
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
            label: 'DASH HUB',
            link: '/dashboard',
            icon: <IconDesktop />,
        },
        {
            label: 'IP ADDRESS LIST',
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
            label: 'INVENTORY MANAGEMENT',
            link: '/inventory',
            icon: <IconMenuScrumboard />,
        },
        {
            label: 'SYSTEMS ACTIVITY HUB',
            link: '/activity',
            icon: <IconMenuNotes />,
        },
        {
            label: 'SYSTEMS DAILY REPORTS',
            link: '/daily/report',
            icon: <IconDribbble />,
        },
        {
            label: 'EQUIPMENT USAGE',
            link: '/get-item',
            icon: <IconMenuTodo />,
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
    ]
};

export default roleBasedMenuItems;
