import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';

import DataTableComponent from "../../components/APAddress/AddressList";

const Maps = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('MAPS List'));
    });


    return (
        <DataTableComponent category="Maps" fetchUrl="http://172.21.59.11:7854/api/ip-address/category/MAPS" />
        );
};

export default Maps;
