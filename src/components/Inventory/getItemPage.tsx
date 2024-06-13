import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { IRootState } from '../../store';

const GetItemPage = () => {
  // Fetch the authenticated user from the Redux store
  const authenticatedUser = useSelector((state: IRootState) => state.user.user);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6 text-white">
        <div className="panel bg-gradient-to-r from-green-500 to-green-400">
            <div className="flex justify-between">
            <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Equipment Usage Page</div>
            </div>
                <div className="flex items-center mt-5">
                    <div className="text-2xl font-bold ltr:mr-3 rtl:ml-3">{`Hello ${authenticatedUser.firstName},`}</div>
                <div className="badge bg-white/30">BULLET was last equipment used </div>
            </div>
            <div className="flex items-center font-semibold mt-5">
                    <Link to={'/get-item/input'} className="btn btn-primary btn-lg w-full border-0 bg-gradient-to-r from-red-400 to-red-300">
                        Get Equipment
                    </Link>
            </div>

            <div className="flex items-center font-semibold mt-5">
                    <Link to={'/replace-item/input'} className="btn btn-primary btn-lg w-full border-0 bg-gradient-to-r from-green-600 to-green-500">
                        Return Equipment
                    </Link>
            </div>
        </div>
    </div>
  );
};

export default GetItemPage;
