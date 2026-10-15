import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';
import { Link, useNavigate } from 'react-router-dom';
import { removeUser } from '../utils/userSlice';

const NavBar = () => {
    const user = useSelector((store) => store.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogOut = async () => {
        try {
            const res = await axios.post(BASE_URL + "/logout", {}, {
                withCredentials: true
            });
            dispatch(removeUser());
            return navigate("/login");        // Login page

        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="navbar bg-base-300 shadow-sm">
            <div className="flex-1">
                <Link to={user ? "/" : "/login"} className="btn btn-ghost text-2xl font-bold  rounded-lg">
                    <img src="/DevLinker-logo.png" alt="DevLinker logo" className="w-8 h-8" />
                    DevLinker
                </Link>
            </div>

            {user && <div>
                <Link to={"/connections"}>
                    <button className='btn bg-gray-700 rounded-full font-semibold  cursor-pointer hover:bg-gray-500 mx-2'>Connections</button>
                </Link>
                <Link to={"/requests"}>
                    <button className='btn bg-gray-700 rounded-full font-semibold  cursor-pointer hover:bg-gray-500 mx-2'>Requests</button>
                </Link>
            </div>}

            <div className="flex gap-2">
                {user && <div className="dropdown dropdown-end mx-5">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                        <div className="w-10 rounded-full">
                            <img
                                alt="user photo"
                                src={user.photoURL} />
                        </div>
                    </div>
                    <ul
                        tabIndex="-1"
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                        <li >
                            <Link to={"/profile"} className="justify-between">
                                {user.firstName} {user.lastName}
                            </Link>
                        </li>
                        <li>
                            <Link to="/password" className="justify-between">
                                Password
                            </Link>
                        </li>
                        <li>
                            <Link to="/premium" className="justify-between">
                                Premium
                            </Link>
                        </li>
                        <li onClick={handleLogOut}><a>Logout</a></li>
                    </ul>
                </div>}
            </div>
        </div>
    )
}

export default NavBar;