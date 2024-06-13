import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setPageTitle } from '../../store/themeConfigSlice';
import showMessage from '../Alerts/showMessage';
import { addAddress } from '../../Api/api';

interface AddressData {
  ipAddressRange: string;
  hostName: string;
  frequency: string;
  category: string;
  description: string;
  status: Status;
}

interface Status {
  tooltip: string;
  color: string;
}

const defaultStatus: Status = {
  tooltip: 'ACTIVE',
  color: 'success',
};

const AddressEdit: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [addressData, setAddressData] = useState<AddressData>({
    ipAddressRange: '',
    hostName: '',
    frequency: '',
    category: 'MAPS',
    description: '',
    status: defaultStatus,
  });

  useEffect(() => {
    dispatch(setPageTitle('Address Add'));
  }, [dispatch]);

  const handleAddAddress = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await addAddress(addressData);
      if (response.success) {
        showMessage({ message: response.message, success: true });
        navigate(`/address/${addressData.category.toLowerCase()}`);
      }
    } catch (error: any) {
      console.error('Error adding address:', error);
      showMessage({ message: error.message, success: false });
    }
  };

  const categoryList = ['MAPS', 'TRUCKS', 'SHOVELS', 'DISPATCH-COMPUTERS', 'PTP1'];

  return (
    <div className="flex xl:flex-row flex-col gap-2.5">
      <div className="panel px-0 flex-1 py-6 ltr:xl:mr-6 rtl:xl:ml-6">
        <hr className="border-white-light dark:border-[#1b2e4b] my-6" />
        <form className="space-y-5 dark:text-white" onSubmit={handleAddAddress}>
          <div className="mt-8 px-4">
            <div className="flex justify-between lg:flex-row flex-col">
              <div className="lg:w-1/2 w-full">
                <div className="text-lg">IP Address Details:</div>
                <div className="flex items-center mt-4">
                  <label htmlFor="ipAddressRange" className="ltr:mr-2 rtl:ml-2 w-1/3 mb-0">
                    IP Address Range
                  </label>
                  <input
                    id="ipAddressRange"
                    type="text"
                    name="ipAddressRange"
                    className="form-input flex-1"
                    placeholder="Enter IP range"
                    value={addressData.ipAddressRange}
                    onChange={(e) => setAddressData({ ...addressData, ipAddressRange: e.target.value })}
                  />
                </div>
                <div className="flex items-center mt-4">
                  <label htmlFor="hostName" className="ltr:mr-2 rtl:ml-2 w-1/3 mb-0">
                    Host Name
                  </label>
                  <input
                    id="hostName"
                    type="text"
                    name="hostName"
                    className="form-input flex-1"
                    placeholder="Enter Device name"
                    value={addressData.hostName}
                    onChange={(e) => setAddressData({ ...addressData, hostName: e.target.value })}
                  />
                </div>
                <div className="flex items-center mt-4">
                  <label htmlFor="frequency" className="ltr:mr-2 rtl:ml-2 w-1/3 mb-0">
                    Frequency
                  </label>
                  <input
                    id="frequency"
                    type="text"
                    name="frequency"
                    className="form-input flex-1"
                    placeholder="Enter frequency range"
                    value={addressData.frequency}
                    onChange={(e) => setAddressData({ ...addressData, frequency: e.target.value })}
                  />
                </div>
                <div className="flex items-center mt-4">
                  <label htmlFor="category" className="ltr:mr-2 rtl:ml-2 w-1/3 mb-0">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    className="form-select flex-1"
                    value={addressData.category}
                    onChange={(e) => setAddressData({ ...addressData, category: e.target.value })}
                  >
                    {categoryList.map((i) => (
                      <option key={i}>{i}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 px-4">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              className="form-textarea min-h-[130px]"
              placeholder="Description...."
              value={addressData.description}
              onChange={(e) => setAddressData({ ...addressData, description: e.target.value })}
            />
          </div>
          <div className="flex items-center sm:flex-row flex-col mt-6 px-4">
            <div className="sm:mb-0 mb-6">
              <button type="submit" className="btn btn-primary">
                Add Item
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressEdit;
