import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { API_CONFIG } from '../../Api/apiConfig';
import { useNavigate } from 'react-router-dom';

interface InventoryItem {
  _id: string;
  itemName: string;
}

const GetItem: React.FC = () => {
  const navigate = useNavigate();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const authenticatedUser = useSelector((state: IRootState) => state.user.user);
  const user = authenticatedUser;

  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.equipment.endpoints.list}`);
        const data: InventoryItem[] = await response.json();
        setInventoryItems(data);
      } catch (error) {
        console.error('Error fetching inventory items:', error);
      }
    };

    fetchInventoryItems();
  }, []);

  const submitForm = async (values: { select: string; quantity: string; comment: string; }) => {
    try {
      await axios.post(`${API_CONFIG.baseURL}${API_CONFIG.equipment.endpoints.useItem}`, {
        itemId: values.select,
        quantity: values.quantity,
        userId: user.firstName,
        comment: values.comment
      });

      Swal.fire({
        icon: 'success',
        title: 'Items Received successfully',
        padding: '5px 10px',
        showConfirmButton: false,
        timer: 3000
      });
      navigate('/get-item')
    } catch (error) {
      console.error('Error deducting item quantity:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to deduct item quantity',
        padding: '10px 20px',
        showConfirmButton: false,
        timer: 3000
      });
    }
  };

  const SubmittedForm = Yup.object().shape({
    select: Yup.string().required('Please select an item from the list'),
    quantity: Yup.number().min(1, 'Please enter a valid quantity').required('Please enter the quantity'),
  });

  return (
    <Formik
      initialValues={{ select: '', quantity: '', comment: '' }}
      validationSchema={SubmittedForm}
      onSubmit={submitForm}
    >
      {({ errors, submitCount }) => (
        <Form className="space-y-5">
          <div>
            <label htmlFor="select">Select an Item:</label>
            <Field as="select" name="select" id="select" className="form-select">
              <option value="">Choose an Item</option>
              {inventoryItems.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.itemName}
                </option>
              ))}
            </Field>
            {submitCount && errors.select && (
              <div className="text-danger mt-1">{errors.select}</div>
            )}
          </div>
          <div className={submitCount && errors.quantity ? 'has-error' : ''}>
            <label htmlFor="quantity">Quantity:</label>
            <Field type="number" name="quantity" id="quantity" className="form-input" />
            {submitCount && errors.quantity && (
              <div className="text-danger mt-1">{errors.quantity}</div>
            )}
          </div>
          <div className={submitCount && errors.comment ? 'has-error' : ''}>
            <label htmlFor="comment">Comment:</label>
            <Field type="text" name="comment" id="comment" className="form-input" />
            {submitCount && errors.comment && (
              <div className="text-danger mt-1">{errors.comment}</div>
            )}
          </div>
          <button type="submit" className="btn btn-primary !mt-6">
            Submit Form
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default GetItem;
