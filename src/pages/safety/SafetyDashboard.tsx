import { Link, NavLink } from 'react-router-dom';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useState, useEffect } from 'react';
import sortBy from 'lodash/sortBy';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconTrashLines from '../../components/Icon/IconTrashLines';
import IconEdit from '../../components/Icon/IconEdit';
import IconEye from '../../components/Icon/IconEye';
import axios from 'axios';
import { API_CONFIG } from '../../Api/apiConfig';

const SafetyDashboard = () => {
    const token = localStorage.getItem('token');
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Safety Work Order'));
        fetchPJOfiles();
    });
    const defaultParams: any = {id: null, job: '', department: '', personObserving: '', personBeingObserved: '', observationsReviewed: ''};
    const [pjolists, setPjoLists] = useState([defaultParams]);
    const [items, seItems] = useState([{
        id: 9,
        job: 'Work at Height',
        personObserving: 'Edwin Oduro',
        personBeingObserved: 'John Owusu',
        department: 'Mining',
        taskProcedures: 'YES',
        status: { tooltip: 'Completed', color: 'success' },
        obvservationsReviewed: { tooltip: 'NO', color: 'danger' },
        profile: 'profile-1.jpeg',
    },])

    const fetchPJOfiles = async() => {
        try {
            const response = await axios.get(`${API_CONFIG.baseURL}${API_CONFIG.pjos.endpoints.list}`, {
                headers: {
                    Authorization: `Bearer${token}`
                }
            })
            setPjoLists(response.data);
        } catch (error) {
            console.error("Error fetching Operators", error);
        }
    }

    const deleteRow = (id: any = null) => {
        if (window.confirm('Are you sure want to delete selected row ?')) {
            // if (id) {
            //     setRecords(items.filter((user) => user.id !== id));
            //     setInitialRecords(items.filter((user) => user.id !== id));
            //     setItems(items.filter((user) => user.id !== id));
            //     setSearch('');
            //     setSelectedRecords([]);
            // } else {
            //     let selectedRows = selectedRecords || [];
            //     const ids = selectedRows.map((d: any) => {
            //         return d.id;
            //     });
            //     const result = items.filter((d) => !ids.includes(d.id as never));
            //     setRecords(result);
            //     setInitialRecords(result);
            //     setItems(result);
            //     setSearch('');
            //     setSelectedRecords([]);
            //     setPage(1);
            // }
        }
    };

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState(sortBy(pjolists, 'job'));
    const [records, setRecords] = useState(initialRecords);
    const [selectedRecords, setSelectedRecords] = useState<any>([]);

    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'firstName',
        direction: 'asc',
    });

    useEffect(() => {
        setPage(1);
        /* eslint-disable react-hooks/exhaustive-deps */
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecords([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        setInitialRecords(() => {
            return pjolists.filter((item) => {
                return (
                    item.job.toLowerCase().includes(search.toLowerCase()) ||
                    item.personObserving.toLowerCase().includes(search.toLowerCase()) ||
                    item.personBeingObserved.toLowerCase().includes(search.toLowerCase()) ||
                    item.department.toLowerCase().includes(search.toLowerCase()) ||
                    item.taskProcedures.toLowerCase().includes(search.toLowerCase()) ||
                    item.obvservationsReviewed.tooltip.toLowerCase().includes(search.toLowerCase()) ||
                    item.status.tooltip.toLowerCase().includes(search.toLowerCase())
                );
            });
        });
    }, [search]);

    useEffect(() => {
        const data2 = sortBy(initialRecords, sortStatus.columnAccessor);
        setRecords(sortStatus.direction === 'desc' ? data2.reverse() : data2);
        setPage(1);
    }, [sortStatus]);

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
                        <input type="text" className="form-input w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                </div>

                <div className="datatables pagination-padding">
                    <DataTable
                        className="whitespace-nowrap table-hover job-table"
                        records={records}
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
                                render: ({ department, id }) => (
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
                            // {
                            //     accessor: 'observationsReviewed',
                            //     sortable: true,
                            //     // titleClassName: 'text-left',
                            //     render: ({ obvservationsReviewed, id }) => <span className={`badge badge-outline-${obvservationsReviewed.color} `}>{obvservationsReviewed.tooltip}</span>,
                            // },
                            // {
                            //     accessor: 'status',
                            //     sortable: true,
                            //     render: ({ status }) => <span className={`badge badge-outline-${status.color} `}>{status.tooltip}</span>,
                            // },
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

export default SafetyDashboard;