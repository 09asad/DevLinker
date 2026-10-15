import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../utils/connectionSlice";
import { Link } from "react-router-dom";

const Connections = () => {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();

  const fetchConnections = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/connections", {
        withCredentials: true,
      });
      dispatch(addConnections(res.data.data));

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  if (!connections) return;

  if (connections.length === 0) return <h1 className="text-center my-5 font-bold text-2xl"> No Connection Found </h1>;

  return (
    <div>
      <h1 className="font-bold text-center text-2xl my-5">Connections</h1>

      {connections.map((connection) => {
        const { _id, firstName, lastName, age, gender, about, photoURL } = connection;

        return (
          <div
            key={_id}
            className="flex items-center gap-6 bg-base-300 p-2 rounded-2xl my-3"
          >
            <img src={photoURL} alt="photo" className="w-20 h-20 rounded-full object-cover" />
            <div className="flex-1 ">
              <h2 className="font-bold text-lg">{firstName} {lastName}</h2>
              <p className="text-sm">{age}, {gender}</p>
              <p className="text-sm mt-2 line-clamp-2">{about}</p>
            </div>
            <Link to={`/chat/${_id}`}>
              <button className="btn bg-blue-500">Chat💬</button>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default Connections;