import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
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

interface Item {
    id: number;
    doneBy: string;
    interactionPersonnel: string;
    areaDept: string;
    significantAspects: string;
    status: Status;
    profile: string;
}

const SafetyInteractionRecord: React.FC = () => {
    const token = localStorage.getItem('token') || '';
    const dispatch = useDispatch();
    const navigate = useNavigate(); // Use useNavigate hook

    useEffect(() => {
        dispatch(setPageTitle('Safety Work Order'));
    }, [dispatch]);

    const [sirlists, setSirLists] = useState<Item[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<Item[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'doneBy',
        direction: 'asc',
    });

    // Fetch data
    useEffect(() => {
        const fetchPJOfiles = async () => {
            try {
                const response = await axios.get<Item[]>(`${API_CONFIG.baseURL}${API_CONFIG.sirs.endpoints.list}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setSirLists(response.data);
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
        const key = sortStatus.columnAccessor as keyof Item;
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
        const filtered = sirlists.filter(item =>
            item.doneBy.toLowerCase().includes(searchLower) ||
            item.interactionPersonnel.toLowerCase().includes(searchLower) ||
            item.areaDept.toLowerCase().includes(searchLower) ||
            item.significantAspects.toLowerCase().includes(searchLower)
        );
        setItems(filtered);
    }, [search, sirlists]);

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
                });
                setItems(updatedItems);
                Swal.fire('Deleted!', 'Your item has been deleted.', 'success');
            } catch (error) {
                console.error('Error deleting item', error);
                Swal.fire('Error', 'There was an error deleting the item.', 'error');
            }
        } else if (response.dismiss === Swal.DismissReason.cancel) {
            Swal.fire('Cancelled', 'Your item is safe :)', 'error');
        }
    };

    const handlePreview = (item: Item) => {
        navigate('/safety/sir/preview', { state: { item } });
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
                        accessor: 'doneBy',
                        sortable: true,
                        render: (item) => (
                            <button
                            type="button"
                            className="text-primary underline hover:no-underline font-semibold"
                            onClick={() => handlePreview(item)} // Correctly passing item here
                            >
                            {`#${item.doneBy}`}
                            </button>
                        ),
                        },
                        {
                        accessor: 'areaDept',
                        sortable: true,
                        render: (item) => ( // Pass full item object
                            <div className="flex items-center font-semibold">
                            <div>{item.areaDept}</div>
                            </div>
                        ),
                        },
                        {
                        accessor: 'interactionPersonnel',
                        sortable: true,
                        render: (item) => item.interactionPersonnel // Simple render, if needed
                        },
                        {
                        accessor: 'significantAspects',
                        sortable: true,
                        render: (item) => item.significantAspects // Simple render, if needed
                        },
                        {
                        accessor: 'action',
                        title: 'Actions',
                        sortable: false,
                        textAlignment: 'center',
                        render: (item) => ( // Corrected here to use item
                            <div className="flex gap-4 items-center w-max mx-auto">
                            <NavLink to="/safety/sir/edit" className="flex hover:text-info">
                                <IconEdit className="w-4.5 h-4.5" />
                            </NavLink>
                            <button
                                type="button"
                                className="flex hover:text-primary"
                                onClick={() => handlePreview(item)} // Correct usage of item
                            >
                                <IconEye />
                            </button>
                            <button
                                type="button"
                                className="flex hover:text-danger"
                                onClick={() => deleteRow(item.id)} // Use item.id here
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
                    paginationText={({ from, to, totalRecords }) => `Showing ${from} to ${to} of ${totalRecords} entries`}
                    />

                </div>
            </div>
        </div>
    );
};

export default SafetyInteractionRecord;