import React, {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../Api/apiConfig';

interface HeavyEquipment {
    heavyEquipmentName: string;
    status: string;
}

const HeavyEquipment: React.FC = () => {
    return (
        <div className='p-2'>
            <h2 className='text-2xl font mb-4 text-bold'>Trucks List</h2>
            <button className='bg-blue-500 hover:bg-gray-300 hover:text-blue-500 text-white font-bold py-2 px-4 rounded'>Add New Truck</button>
            <div className='pt-5'>
                <table className='min-w-full bg-white border-gray-400'>
                    <thead>
                    <tr>
                        <th className='py-2 px-4 border-b'>Equipment Name</th>
                        <th className='py-2 px-4 border-b'>Truck Status</th>
                    </tr>
                    </thead>
                    <tbody>
                        <td className='py-2 px-4 border-b'>DT05</td>
                        <td className='py-2 px-4 border-b'>On Site</td>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HeavyEquipment;