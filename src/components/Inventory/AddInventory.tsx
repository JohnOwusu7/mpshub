import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setPageTitle } from '../../store/themeConfigSlice';
import showMessage from '../Alerts/showMessage';
import { inventoryAdd } from '../../Api/api';

interface SingleFormData {
  itemNo: string;
  description: string;
  itemName: string;
  totalStock: number;
  categories: string;
}

const AddSingleEquipmentForm: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [singleFormData, setSingleFormData] = useState<SingleFormData>({
    itemNo: '',
    description: '',
    itemName: '',
    totalStock: 0,
    categories: '',
  });

  useEffect(() => {
    dispatch(setPageTitle('Add Single Equipment'));
  }, [dispatch]);

  const handleSingleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSingleFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSingleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { itemNo, description, itemName, totalStock } = singleFormData;

    if (!itemNo || !description || !itemName || totalStock <= 0) {
      showMessage({ message: 'Please fill in all required fields.', success: false });
      return;
    }

    try {
      const response = await inventoryAdd(singleFormData);
      if (response.success) {
        showMessage({ message: response.message, success: true });
        navigate('/inventory');
      } else {
        showMessage({ message: response.message, success: false });
      }
    } catch (error: any) {
      console.error('Error adding new equipment:', error);
      showMessage({ message: error.message || 'An error occurred.', success: false });
    }
  };

  return (
    <div className="flex xl:flex-row flex-col gap-2.5">
      <div className="panel px-0 flex-1 py-6 ltr:xl:mr-6 rtl:xl:ml-6">
        <hr className="border-white-light dark:border-[#1b2e4b] my-6" />
        <form className="space-y-5 dark:text-white" onSubmit={handleSingleSubmit}>
          <div className="mt-8 px-4">
            <div className="flex justify-between lg:flex-row flex-col">
              <div className="lg:w-1/2 w-full">
                <div className="text-lg">Enter Equipment Details:</div>
                <div className="flex items-center mt-4">
                  <label htmlFor="itemNo" className="ltr:mr-2 rtl:ml-2 w-1/3 mb-0">
                    Item No
                  </label>
                  <input
                    id="itemNo"
                    type="text"
                    name="itemNo"
                    className="form-input flex-1"
                    placeholder="Enter Item No"
                    value={singleFormData.itemNo}
                    onChange={handleSingleChange}
                    required
                  />
                </div>
                <div className="flex items-center mt-4">
                  <label htmlFor="itemName" className="ltr:mr-2 rtl:ml-2 w-1/3 mb-0">
                    Item Name
                  </label>
                  <input
                    id="itemName"
                    type="text"
                    name="itemName"
                    className="form-input flex-1"
                    placeholder="Enter Item Name"
                    value={singleFormData.itemName}
                    onChange={handleSingleChange}
                    required
                  />
                </div>
                <div className="flex items-center mt-4">
                  <label htmlFor="description" className="ltr:mr-2 rtl:ml-2 w-1/3 mb-0">
                    Description
                  </label>
                  <input
                    id="description"
                    type="text"
                    name="description"
                    className="form-input flex-1"
                    placeholder="Enter Item Description"
                    value={singleFormData.description}
                    onChange={handleSingleChange}
                    required
                  />
                </div>
                <div className="flex items-center mt-4">
                  <label htmlFor="totalStock" className="ltr:mr-2 rtl:ml-2 w-1/3 mb-0">
                    Total Stock
                  </label>
                  <input
                    id="totalStock"
                    type="number"
                    name="totalStock"
                    className="form-input flex-1"
                    placeholder="Enter Total Stock"
                    value={singleFormData.totalStock}
                    onChange={handleSingleChange}
                    min="1"
                    required
                  />
                </div>
                <div className="flex items-center mt-4">
                  <label htmlFor="categories" className="ltr:mr-2 w-1/3 mb-0">
                    Category
                  </label>
                  <select 
                    id="categories"
                    name='categories'
                    className='form-input flex-1'
                    placeholder='Select Category'
                    value={singleFormData.categories}
                    onChange={(e: any) => handleSingleChange(e)}>
                      <option value={''}>Select</option>
                      <option value={'DISPATCH'}>DISPATCH</option>
                      <option value={"NETWORK"}>NETWORK</option>
                      <option value={"SMARTCAP"}>SMARTCAPS</option>
                    </select>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center sm:flex-row flex-col mt-6 px-4">
            <div className="sm:mb-0 mb-6">
              <button type="submit" className="btn btn-primary">
                Add Equipment
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSingleEquipmentForm;
