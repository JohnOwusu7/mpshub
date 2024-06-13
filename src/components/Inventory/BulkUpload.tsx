import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryBulk } from '../../Api/api';
import showMessage from '../Alerts/showMessage';

const AddEquipmentBulkForm: React.FC = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files ? e.target.files[0] : null;
        setFile(selectedFile);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file) {
            console.error('No file uploaded');
            showMessage({ message: 'Please select a file.', success: false });
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await inventoryBulk(formData);

            if (response.success === true) {
                if (response.message) {
                    showMessage({ message: response.message, success: true });
                } else {
                    showMessage({ message: 'Bulk equipment uploaded successfully.', success: true });
                }
                navigate('/inventory');
            } else {
                showMessage({ message: response.message || 'Failed to upload bulk equipment.', success: false });
            }
        } catch (error: any) {
            console.error('Error adding bulk equipment:', error);
            showMessage({ message: 'Error adding bulk equipment', success: false });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex xl:flex-row flex-col gap-2.5">
            <div className="panel px-0 flex-1 py-6 ltr:xl:mr-6 rtl:xl:ml-6">
                <hr className="border-white-light dark:border-[#1b2e4b] my-6" />
                <form className="mt-8 px-4" onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="file" className="block mb-2">
                            Select file:
                        </label>
                        <input type="file" id="file" name="file" onChange={handleFileChange} />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={!file || isSubmitting}>
                        {isSubmitting ? 'Uploading...' : 'Upload Bulk Equipment'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddEquipmentBulkForm;
