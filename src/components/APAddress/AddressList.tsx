import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import sortBy from 'lodash/sortBy';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconTrashLines from '../../components/Icon/IconTrashLines';
import IconPlus from '../../components/Icon/IconPlus';
import IconEdit from '../../components/Icon/IconEdit';
import { API_CONFIG } from '../../Api/apiConfig';

interface Address {
  _id: string;
  ipAddressRange: string;
  hostName: string;
  frequency: string;
  category: string;
  description: string;
  status: {
    tooltip: string;
    color: string;
  };
}

interface DataTableComponentProps {
  category: string;
  fetchUrl: string;
}

const DataTableComponent: React.FC<DataTableComponentProps> = ({ category, fetchUrl }) => {
  const dispatch = useDispatch();
  const [items, setItems] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'host', direction: 'asc' });
  const [page, setPage] = useState(1);
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [initialRecords, setInitialRecords] = useState<Address[]>([]);
  const [records, setRecords] = useState<Address[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<Address[]>([]);

  useEffect(() => {
    dispatch(setPageTitle(`${category} Addresses`));
  }, [category, dispatch]);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoading(true);
        const response = await fetch(fetchUrl);
        const data = await response.json();
        setItems(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [fetchUrl]);

  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    setRecords([...initialRecords.slice(from, to)]);
  }, [page, pageSize, initialRecords]);

  useEffect(() => {
    setInitialRecords(() => {
      return items.filter((item) => {
        return (
          item.ipAddressRange.toLowerCase().includes(search.toLowerCase()) ||
          item.hostName.toLowerCase().includes(search.toLowerCase()) ||
          item.description.toLowerCase().includes(search.toLowerCase()) ||
          item.frequency.toLowerCase().includes(search.toLowerCase()) ||
          item.status.tooltip.toLowerCase().includes(search.toLowerCase())
        );
      });
    });
  }, [search, items]);

  useEffect(() => {
    const sortedRecords = sortBy(initialRecords, sortStatus.columnAccessor);
    setRecords(sortStatus.direction === 'desc' ? sortedRecords.reverse() : sortedRecords);
    setPage(1);
  }, [sortStatus, initialRecords]);

  const deleteAddress = async (id: string) => {
    if (!id) {
      console.error('Address ID not found');
      return;
    }

    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await fetch(`http://localhost:7854/api/ip-address/${id}`, { method: 'DELETE' });
        const response = await fetch(fetchUrl);
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error('Error deleting address:', error);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <ul className="flex space-x-2 rtl:space-x-reverse">
        <li>
          <Link to="/address/maps" className="text-primary hover:underline">
            IP Address
          </Link>
        </li>
        <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
          <span>Lists</span>
        </li>
      </ul>

      <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
        <div className="invoice-table">
          <div className="mb-4.5 px-5 flex md:items-center md:flex-row flex-col gap-5">
            <div className="flex items-center gap-2">
              <Link to="/address/add" className="btn btn-primary gap-2">
                <IconPlus />
                Add New
              </Link>
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
              className="whitespace-nowrap table-hover invoice-table"
              records={records}
              columns={[
                {
                  accessor: 'ipAddressRange',
                  sortable: true,
                  render: ({ ipAddressRange }) => (
                    <NavLink to="/address/preview">
                      <div className="text-primary hover:no-underline font-semibold">{ipAddressRange}</div>
                    </NavLink>
                  ),
                },
                {
                  accessor: 'hostName',
                  sortable: true,
                  render: ({ hostName }) => <div className="text-left font-semibold">{hostName}</div>,
                },
                {
                  accessor: 'description',
                  sortable: true,
                },
                {
                  accessor: 'frequency',
                  sortable: true,
                  titleClassName: 'text-right',
                  render: ({ frequency }) => <div className="text-left font-semibold">{frequency}</div>,
                },
                {
                  accessor: 'status',
                  sortable: true,
                  render: ({ status }) => <span className={`badge badge-outline-${status.color}`}>{status.tooltip}</span>,
                },
                {
                  accessor: 'action',
                  title: 'Actions',
                  sortable: false,
                  textAlignment: 'center',
                  render: ({ _id }) => (
                    <div className="flex gap-4 items-center w-max mx-auto">
                      <NavLink to={`/address/edit/${_id}`} className="flex hover:text-info">
                        <IconEdit className="w-4.5 h-4.5" />
                      </NavLink>
                      <button type="button" className="flex hover:text-danger" onClick={() => deleteAddress(_id)}>
                        <IconTrashLines />
                      </button>
                    </div>
                  ),
                },
              ]}
              highlightOnHover
              totalRecords={initialRecords.length}
              recordsPerPage={pageSize}
              page={page}
              onPageChange={setPage}
              recordsPerPageOptions={PAGE_SIZES}
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
    </div>
  );
};

export default DataTableComponent;
