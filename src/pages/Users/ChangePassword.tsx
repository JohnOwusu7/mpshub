import React, { useState, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { changePassword } from '../../Api/api';
import IconLogin from '../../components/Icon/IconLogin';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

const ChangePassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useDispatch();
  const user = useSelector((state: IRootState) => state.user.user);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!currentPassword || !newPassword || !confirmPassword) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'All password fields are required.',
        });
        setLoading(false);
        return;
    }

    if (newPassword !== confirmPassword) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'New password and confirm password do not match.',
        });
        setLoading(false);
        return;
    }

    if (newPassword.length < 6) { // Example: Minimum password length
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'New password must be at least 6 characters long.',
        });
        setLoading(false);
        return;
    }

    try {
      const payload: ChangePasswordPayload = { currentPassword, newPassword };
      const response = await changePassword(payload);

      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: response.message || 'Password changed successfully!',
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.message || 'Failed to change password.',
        });
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
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
                <span>Change Password</span>
            </li>
        </ul>
        <div className="pt-5">
            <div className="panel">
                <h5 className="font-semibold text-lg dark:text-white-light mb-5">Change Password</h5>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="current-password">Current Password</label>
                        <input
                            id="current-password"
                            type="password"
                            placeholder="Enter current password"
                            className="form-input"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="new-password">New Password</label>
                        <input
                            id="new-password"
                            type="password"
                            placeholder="Enter new password"
                            className="form-input"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="confirm-password">Confirm New Password</label>
                        <input
                            id="confirm-password"
                            type="password"
                            placeholder="Confirm new password"
                            className="form-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex justify-end mt-6">
                        <button type="submit" className="btn btn-primary gap-2" disabled={loading}>
                            {loading ? 'Saving...' : (<><IconLogin className="w-5 h-5 shrink-0" /> Change Password</>)}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
};

export default ChangePassword;
