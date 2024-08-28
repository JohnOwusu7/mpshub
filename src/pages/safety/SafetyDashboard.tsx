import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconTrashLines from '../../components/Icon/IconTrashLines';
import IconEdit from '../../components/Icon/IconEdit';
import IconEye from '../../components/Icon/IconEye';
import axios from 'axios';
import { API_CONFIG } from '../../Api/apiConfig';
import Swal from 'sweetalert2';
import showAlert from '../../components/Alerts/toDelete';

// TypeScript Interfaces
interface Status {
    tooltip: string;
    color: string;
}

interface ObservationsReviewed extends Status {}

interface Item {
    id: number;
    job: string;
    personObserving: string;
    personBeingObserved: string;
    department: string;
    taskProcedures: string;
    status: Status;
    obvservationsReviewed: ObservationsReviewed;
    profile: string;
}

const SafetyDashboard: React.FC = () => {
    const token = localStorage.getItem('token') || '';
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPageTitle('Safety Work Order'));
    }, [dispatch]);

    const [pjolists, setPjoLists] = useState<Item[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<Item[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'job',
        direction: 'asc',
    });
    const [selectedRecords, setSelectedRecords] = useState<Item[]>([]);

    // Fetch data
    useEffect(() => {
        const fetchPJOfiles = async () => {
            try {
                const response = await axios.get<Item[]>(`${API_CONFIG.baseURL}${API_CONFIG.pjos.endpoints.list}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log('Fetched PJO files:', response.data);
                setPjoLists(response.data);
                setItems(response.data);
            } catch (error) {
                console.error("Error fetching PJO files:", error);
            }
        };

        fetchPJOfiles();
    }, [token]);

    // Handle page size change
    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    // Handle pagination
    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setFilteredRecords(items.slice(from, to));
    }, [page, pageSize, items]);

    // Handle sorting
    useEffect(() => {
        const key = sortStatus.columnAccessor as keyof Item; // Type assertion
        const sortedData = [...items].sort((a, b) => {
            const aValue = a[key];
            const bValue = b[key];
            if (aValue < bValue) return sortStatus.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortStatus.direction === 'asc' ? 1 : -1;
            return 0;
        });
        setFilteredRecords(sortedData);
        setPage(1);
    }, [sortStatus, items]);

    // Handle search
    useEffect(() => {
        const searchLower = search.toLowerCase();
        const filtered = pjolists.filter(item =>
            item.job.toLowerCase().includes(searchLower) ||
            item.personObserving.toLowerCase().includes(searchLower) ||
            item.personBeingObserved.toLowerCase().includes(searchLower) ||
            item.department.toLowerCase().includes(searchLower) ||
            item.taskProcedures.toLowerCase().includes(searchLower) ||
            item.obvservationsReviewed.tooltip.toLowerCase().includes(searchLower) ||
            item.status.tooltip.toLowerCase().includes(searchLower)
        );
        setItems(filtered);
    }, [search, pjolists]);

    const deleteRow = async (id: number | null = null) => {
        const response = await showAlert({
            message: 'Are you sure you want to delete selected row?',
            success: false,
            result: '',
        });

        if (response.isConfirmed) {
            const updatedItems = items.filter(item => item.id !== id);
             try {
                await axios.delete(`${API_CONFIG.baseURL}${API_CONFIG.pjos.endpoints.delete}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
            } catch (error) {
                console.error('Error deleting Forms', error);
                
            }
            setItems(updatedItems);
            Swal.fire('Deleted!', 'Your item has been deleted.', 'success');
        } else if (response.dismiss === Swal.DismissReason.cancel) {
            Swal.fire('Cancelled', 'Your item is safe :)', 'error');
        }
    };

    return (
        <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
            <div className="job-table">
                <div className="mb-4.5 px-5 flex md:items-center md:flex-row flex-col gap-5">
                    <div className="flex items-center gap-2">
                        <button type="button" className="btn btn-danger gap-2" onClick={() => deleteRow()}>
                            <IconTrashLines />
                            Delete
                        </button>
                    </div>
                    <div className="ltr:ml-auto rtl:mr-auto">
                        <input
                            type="text"
                            className="form-input w-auto"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="datatables pagination-padding">
                    <DataTable
                        className="whitespace-nowrap table-hover job-table"
                        records={filteredRecords}
                        columns={[
                            {
                                accessor: 'job',
                                sortable: true,
                                render: ({ job }) => (
                                    <NavLink to="/safety/pjo/preview">
                                        <div className="text-primary underline hover:no-underline font-semibold">{`#${job}`}</div>
                                    </NavLink>
                                ),
                            },
                            {
                                accessor: 'department',
                                sortable: true,
                                render: ({ department }) => (
                                    <div className="flex items-center font-semibold">
                                        <div>{department}</div>
                                    </div>
                                ),
                            },
                            {
                                accessor: 'personObserving',
                                sortable: true,
                            },
                            {
                                accessor: 'personBeingObserved',
                                sortable: true,
                            },
                            {
                                accessor: 'status',
                                sortable: true,
                            },
                            {
                                accessor: 'status',
                                sortable: true,
                            },
                            {
                                accessor: 'action',
                                title: 'Actions',
                                sortable: false,
                                textAlignment: 'center',
                                render: ({ id }) => (
                                    <div className="flex gap-4 items-center w-max mx-auto">
                                        <NavLink to="/safety/pjo/edit" className="flex hover:text-info">
                                            <IconEdit className="w-4.5 h-4.5" />
                                        </NavLink>
                                        <NavLink to="/safety/pjo/preview" className="flex hover:text-primary">
                                            <IconEye />
                                        </NavLink>
                                        <button
                                            type="button"
                                            className="flex hover:text-danger"
                                            onClick={() => deleteRow(id)}
                                        >
                                            <IconTrashLines />
                                        </button>
                                    </div>
                                ),
                            },
                        ]}
                        highlightOnHover
                        totalRecords={items.length}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={(p) => setPage(p)}
                        recordsPerPageOptions={[10, 20, 30, 50, 100]}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        selectedRecords={selectedRecords}
                        onSelectedRecordsChange={setSelectedRecords}
                        paginationText={({ from, to, totalRecords }) => `Showing ${from} to ${to} of ${totalRecords} entries`}
                    />
                </div>
            </div>
        </div>
    );
};

export default SafetyDashboard;
