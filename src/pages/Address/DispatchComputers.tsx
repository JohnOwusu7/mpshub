import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import { API_CONFIG } from '../../Api/apiConfig';

import DataTableComponent from "../../components/APAddress/AddressList";

const DispatchComputers = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Dispatch Computers List'));
    });

    return (
        <DataTableComponent category="DISPATCH-COMPUTERS" fetchUrl= '{$newUrl}' />
        );
};

export default DispatchComputers;
