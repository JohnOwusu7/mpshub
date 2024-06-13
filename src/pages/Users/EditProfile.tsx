import React, { useState, FormEvent } from 'react';
import { useDispatch } from 'react-redux';
import { changePassword } from '../../Api/api';
import IconLogin from '../../components/Icon/IconLogin';

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

const EditProfile: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const dispatch = useDispatch();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const payload: ChangePasswordPayload = { currentPassword, newPassword };
      await changePassword(payload);
      setError('');
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mt-8 px-4">
        <div className="flex justify-between lg:flex-row flex-col">
          <div className="lg:w-1/2 w-full">
            <div className="flex items-center mt-4">
              <label htmlFor="current-password" className="ltr:mr-2 rtl:ml-2 w-1/3 mb-0">
                Current Password
              </label>
              <input
                id="current-password"
                type="password"
                name="current-password"
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="form-input flex-1"
                placeholder="Enter current password"
                required
              />
            </div>
            <div className="flex items-center mt-4">
              <label htmlFor="new-password" className="ltr:mr-2 rtl:ml-2 w-1/3 mb-0">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                name="new-password"
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-input flex-1"
                placeholder="Enter new password"
                required
              />
            </div>
            <div className="flex items-center mt-4">
              <label htmlFor="confirm-password" className="ltr:mr-2 rtl:ml-2 w-1/3 mb-0">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                name="confirm-password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input flex-1"
                placeholder="Confirm password"
                required
              />
            </div>
          </div>
        </div>
        <button type="submit" className="btn btn-secondary gap-2 mt-10 flex">
          <IconLogin className="ltr:mr-2 rtl:ml-2 shrink-0" />
          Change Password
        </button>
      </div>
      {error && <div>{error}</div>}
    </form>
  );
};

export default EditProfile;
