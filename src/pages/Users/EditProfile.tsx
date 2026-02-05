import React, { useState, useEffect, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { setPageTitle } from '../../store/themeConfigSlice';
import { User } from '../../Api/api'; // Import the User interface
import axios from 'axios';
import { API_CONFIG } from '../../Api/apiConfig';
import Swal from 'sweetalert2';
import IconPencilPaper from '../../components/Icon/IconPencilPaper';
import { Link } from 'react-router-dom';

const EditProfile: React.FC = () => {
  const dispatch = useDispatch();
  const authenticatedUser = useSelector((state: IRootState) => state.user.user);
  const user = authenticatedUser || { _id: '', firstName: 'Guest', lastName: '', email: '', identityNo: '', roleName: '', phone: '', position: '', companyId: '' };

  const [firstName, setFirstName] = useState<string>(user.firstName);
  const [lastName, setLastName] = useState<string>(user.lastName);
  const [phone, setPhone] = useState<string>(user.phone);
  const [position, setPosition] = useState<string>(user.position);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    dispatch(setPageTitle('Edit Profile'));
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setPhone(user.phone);
    setPosition(user.position);
  }, [dispatch, user]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUserData: Partial<User> = {
        firstName,
        lastName,
        phone,
        position,
      };

      const response = await axios.put(
        `${API_CONFIG.baseURL}${API_CONFIG.users.endpoints.edit.replace(':userId', user._id)}`,
        updatedUserData,
        { headers: { companyid: user.companyId } }
      );

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: response.data.message || 'Profile updated successfully!',
        });
        // Optionally, dispatch an action to update Redux store with new user data
        // dispatch(updateUserInStore(response.data.user)); 
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.data.message || 'Failed to update profile.',
        });
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'An unexpected error occurred.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
        <ul className="flex space-x-2 rtl:space-x-reverse">
            <li>
                <Link to="/users/profile" className="text-primary hover:underline">
                    Profile
                </Link>
            </li>
            <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                <span>Edit Profile</span>
            </li>
        </ul>
        <div className="pt-5">
            <div className="panel">
                <h5 className="font-semibold text-lg dark:text-white-light mb-5">Edit Personal Information</h5>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="firstName">First Name</label>
                            <input id="firstName" type="text" placeholder="Enter First Name" className="form-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                        </div>
                        <div>
                            <label htmlFor="lastName">Last Name</label>
                            <input id="lastName" type="text" placeholder="Enter Last Name" className="form-input" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email">Email (Read-only)</label>
                        <input id="email" type="email" className="form-input" value={user.email} readOnly disabled />
                    </div>

                    <div>
                        <label htmlFor="identityNo">Employee ID (Read-only)</label>
                        <input id="identityNo" type="text" className="form-input" value={user.identityNo} readOnly disabled />
                    </div>

                    <div>
                        <label htmlFor="phone">Phone Number</label>
                        <input id="phone" type="text" placeholder="Enter Phone Number" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    </div>

                    <div>
                        <label htmlFor="position">Position</label>
                        <input id="position" type="text" placeholder="Enter Position" className="form-input" value={position} onChange={(e) => setPosition(e.target.value)} required />
                    </div>

                    <div>
                        <label htmlFor="roleName">Role (Read-only)</label>
                        <input id="roleName" type="text" className="form-input" value={user.roleName} readOnly disabled />
                    </div>

                    {user.companyId && (
                        <div>
                            <label htmlFor="companyId">Company ID (Read-only)</label>
                            <input id="companyId" type="text" className="form-input" value={user.companyId} readOnly disabled />
                        </div>
                    )}

                    <div className="flex justify-end mt-6">
                        <button type="submit" className="btn btn-primary gap-2" disabled={loading}>
                            {loading ? 'Saving...' : (<><IconPencilPaper className="w-5 h-5 shrink-0" /> Update Profile</>)}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
};

export default EditProfile;
