import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';

import DataTableComponent from "../../components/APAddress/AddressList";

const Trucks = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Trucks List'));
    });

    return (
        <DataTableComponent category="TRUCKS" fetchUrl="http://localhost:7854/api/ip-address/category/TRUCKS" />
        );
};

export default Trucks;
