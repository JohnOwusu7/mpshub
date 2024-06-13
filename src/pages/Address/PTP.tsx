import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';

import DataTableComponent from "../../components/APAddress/AddressList";

const PTPs = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('PTP List'));
    });

    return (
        <DataTableComponent category="PTP1" fetchUrl="http://localhost:7854/api/ip-address/category/PTP1" />
        );
};

export default PTPs;
