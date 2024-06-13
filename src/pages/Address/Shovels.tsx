import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';

import DataTableComponent from "../../components/APAddress/AddressList";

const Shovels = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Shovels List'));
    });

    return (
        <DataTableComponent category="SHOVELS" fetchUrl="http://localhost:7854/api/ip-address/category/SHOVELS" />
        );
};

export default Shovels;
