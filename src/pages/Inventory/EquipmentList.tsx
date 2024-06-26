import { Link, NavLink } from 'react-router-dom';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useState, useEffect } from 'react';
import sortBy from 'lodash/sortBy';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconTrashLines from '../../components/Icon/IconTrashLines';
import IconPlus from '../../components/Icon/IconPlus';
import IconEdit from '../../components/Icon/IconEdit';
import axios from 'axios';
import { API_CONFIG } from '../../Api/apiConfig';
import IconDownload from '../../components/Icon/IconDownload';
import Swal from 'sweetalert2';
import showAlert from './../../components/Alerts/toDelete';

interface Equipment {
    _id: any;
    lastUsedBy: any;
    id: string;
    name: string;
    itemNo: string;
    description: string;
    itemName: string;
    totalUsed: number;
    totalStock: number;
    currentQuantity: number;
    updatedAt: string;
    categories: string;
}

const EquipmentList: React.FC = () => {
    const dispatch = useDispatch();
    const [items, setItems] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Assuming you have the authenticated user object in your Redux store state
const authenticatedUser = useSelector((state: IRootState) => state.user.user);

// Function to get the user's role
const getUserRole = () => {
    // If the authenticated user object exists
    if (authenticatedUser) {
        // Extract the role property from the user object
        return authenticatedUser.role;
    } else {
        // If user is not authenticated or user object doesn't contain role property
        return 'guest';
    }
};

    useEffect(() => {
        const fetchEquipmentList = async () => {
            dispatch(setPageTitle('Inventory View'));

            try {
                const response = await axios.get<Equipment[]>(`${API_CONFIG.baseURL}${API_CONFIG.equipment.endpoints.list}`);

                const equipments = response.data;
                const userRole = getUserRole();

                const filteredEquipments = equipments.filter((category: {categories: string}) => {
                    if(userRole === 'AFRIYIE') {
                        return category.categories === 'NETWORK';
                    } else if (userRole === 'RAMJACK') {
                        return category.categories === 'SMARTCAP';
                    } else if (userRole === 'SYSTEMS-ENGINEER') {
                        return category.categories === 'NETWORK' && 'DISPATCH';
                    } else
                    return equipments;
                });

                const normalizedData: any = filteredEquipments.map(item => ({
                    id: item._id,
                    name: item.lastUsedBy,
                    itemNo: item.itemNo,
                    description: item.description,
                    itemName: item.itemName,
                    totalUsed: item.totalUsed,
                    totalStock: item.totalStock,
                    currentQuantity: item.currentQuantity,
                    updatedAt: item.updatedAt,
                }));
                setItems(normalizedData);
                setLoading(false);
            } catch (error: any) {
                setError(error.message);
                setLoading(false);
            }
        };

        fetchEquipmentList();
    }, []);

    const downloadEquipmentCSV = async () => {
        try {
            const response: any = await axios.get<Equipment>(`${API_CONFIG.baseURL}${API_CONFIG.equipment.endpoints.download}`, {
                responseType: 'blob', // Set responseType to 'blob' to receive binary data
            });

            // Create a Blob object from the binary data
            const blob = new Blob([response.data], { type: 'text/csv' });

            // Create a temporary URL for the Blob object
            const url = window.URL.createObjectURL(blob);

            // Create a link element
            const link = document.createElement('a');

            // Set the href attribute to the temporary URL
            link.href = url;

            // Set the download attribute with the desired file name
            link.setAttribute('download', 'equipment.csv');

            // Append the link to the document body
            document.body.appendChild(link);

            // Programmatically trigger the click event on the link to start the download
            link.click();

            // Remove the link from the document body
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading equipment CSV:', error);
            // Handle error
        }
    };

    const deleteRow = async (id: string) => {
        const response = await showAlert({
            message: 'Are you sure you want to delete selected row?',
            success: false,
            result: '',
        });

        if (response.isConfirmed) {
            const updatedItems = items.filter(item => item.id !== id);
            setItems(updatedItems);
            Swal.fire('Deleted!', 'Your item has been deleted.', 'success');
        } else if (response.dismiss === Swal.DismissReason.cancel) {
            Swal.fire('Cancelled', 'Your item is safe :)', 'error');
        }
    };

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState<Equipment[]>(sortBy(items, 'itemNo'));
    const [records, setRecords] = useState(initialRecords);
    const [selectedRecords, setSelectedRecords] = useState<Equipment[]>([]);

    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'itemNo',
        direction: 'asc',
    });

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecords([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        setInitialRecords(() => {
            return items.filter(item => {
                const searchableFields: (keyof Equipment)[] = ['itemNo', 'name', 'description', 'itemName', 'updatedAt', 'lastUsedBy'];
                return searchableFields.some(field =>
                    (item[field]?.toString().toLowerCase() || '').includes(search.toLowerCase())
                );
            });
        });
    }, [search, items]);
    

    useEffect(() => {
        const data2 = sortBy(initialRecords, sortStatus.columnAccessor);
        setRecords(sortStatus.direction === 'desc' ? data2.reverse() : data2);
        setPage(1);
    }, [sortStatus, initialRecords]);

    const formatDate = (date: string | number | Date) => {
        if (date) {
            const dt = new Date(date);
            const month = dt.getMonth() + 1 < 10 ? '0' + (dt.getMonth() + 1) : dt.getMonth() + 1;
            const day = dt.getDate() < 10 ? '0' + dt.getDate() : dt.getDate();
            return day + '/' + month + '/' + dt.getFullYear();
        }
        return '';
    };

    const randomColor = (currentQuantity: string | number) => {
        const color = ['primary', 'secondary', 'success', 'danger', 'warning', 'info'];
        const quantity = typeof currentQuantity === 'number' ? currentQuantity : parseInt(currentQuantity, 10);

        if (quantity >= 80) {
            return color[2];
        } else if (quantity >= 70) {
            return color[5];
        } else if (quantity >= 51) {
            return color[0];
        } else if (quantity >= 0) {
            return color[3];
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
            <div className="invoice-table">
                <div className="mb-4.5 px-5 flex md:items-center md:flex-row flex-col gap-5">
                    <div className="flex items-center gap-2">
                        <Link to="/inventory/upload-bulk" className="btn btn-primary">
                            Upload Bulk Equipment
                        </Link>
                        <Link to="/inventory/add" className="btn btn-primary gap-2">
                            <IconPlus />
                            Add New
                        </Link>
                        <Link to="#" className="btn btn-success gap-2" onClick={downloadEquipmentCSV}>
                            <IconDownload />
                            Download
                        </Link>
                    </div>
                    <div className="ltr:ml-auto rtl:mr-auto">
                        <input type="text" className="form-input w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                </div>

                <div className="datatables pagination-padding">
                    <DataTable
                        className="whitespace-nowrap table-hover invoice-table"
                        records={records}
                        columns={[
                            {
                                accessor: 'itemNo',
                                sortable: true,
                                render: ({ itemNo }) => (
                                    <NavLink to="/inventory/preview">
                                        <div className="text-primary underline hover:no-underline font-semibold">{`#${itemNo}`}</div>
                                    </NavLink>
                                ),
                            },
                            {
                                accessor: 'itemName',
                                sortable: true,
                            },
                            {
                                accessor: 'description',
                                sortable: true,
                            },
                            {
                                accessor: 'remaining item',
                                sortable: true,
                                render: ({ currentQuantity }) => (
                                    <div className="w-4/5 min-w-[100px] h-4.0 bg-[#ebedf2] dark:bg-dark/40 rounded-full flex">
                                        <div className={`h-4.0 rounded-full rounded-bl-full text-center text-white text-xs bg-${randomColor(currentQuantity.toString())}`} style={{ width: `${currentQuantity}%` }}>{currentQuantity}</div>
                                    </div>
                                ),
                            },
                            {
                                accessor: 'totalUsed',
                                sortable: true
                            },
                            {
                                accessor: 'total Stock',
                                sortable: true,
                                titleClassName: 'text-right',
                                render: ({ totalStock, id }) => <div className="text-center font-semibold">{`${totalStock}`}</div>,
                            },
                            {
                                accessor: 'updatedAt',
                                sortable: true,
                                render: ({ updatedAt }) => <div>{formatDate(updatedAt)}</div>
                            },
                            {
                                accessor: 'updated By',
                                sortable: true,
                                render: ({ name, id }) => (
                                    <div className="flex items-center font-semibold">
                                        {name}
                                    </div>
                                ),
                            },

                            {
                                accessor: 'action',
                                title: 'Actions',
                                sortable: false,
                                textAlignment: 'center',
                                render: ({ id }) => (
                                    <div className="flex gap-4 items-center w-max mx-auto">
                                        <NavLink to="#" className="flex hover:text-info">
                                            <IconEdit className="w-4.5 h-4.5" />
                                        </NavLink>
                                        <NavLink to="" className="flex">
                                            <button type="button" className="flex hover:text-danger" onClick={(e) => deleteRow(id)}>
                                                <IconTrashLines />
                                            </button>
                                        </NavLink>
                                    </div>
                                ),
                            },
                        ]}
                        highlightOnHover
                        totalRecords={initialRecords.length}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={(p) => setPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        selectedRecords={selectedRecords}
                        onSelectedRecordsChange={setSelectedRecords}
                        paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                    />
                </div>
            </div>
        </div>
    );
};

export default EquipmentList;
