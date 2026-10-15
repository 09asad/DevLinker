import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addRequest, removeRequest } from "../utils/requestSlice";
import { useEffect } from "react";

const Requests = () => {
  const dispatch = useDispatch();
  const requests = useSelector((store) => store.requests);

  const reviewRequest = async (status, _id) => {
    try {
      const res = await axios.post(BASE_URL + "/request/review/" + status + "/" + _id,
        {},
        { withCredentials: true }
      );
      dispatch(removeRequest(_id));

    } catch (err) {
        console.error(err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/request/received", {
        withCredentials: true,
      });
      dispatch(addRequest(res.data.data));

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (!requests) return;

  if (requests.length === 0) return <h1 className="text-center my-5 font-bold text-2xl"> No Request Found </h1>;

  return (
    <div>
      <h1 className="font-bold text-center text-2xl my-5">Requests</h1>

      {requests.map((request) => {
        const { _id, firstName, lastName, age, gender, about, photoURL } = request.fromUserId;

        return (
          <div
            key={_id}
            className="flex items-center gap-6 bg-base-300 p-2 rounded-2xl my-3"
          >
            <img src={photoURL} alt="photo" className="w-20 h-20 rounded-full object-cover" />
            <div className="max-w-xl">
              <h2 className="font-bold text-lg">{firstName} {lastName}</h2>
              <p className="text-sm">{age}, {gender}</p>
              <p className="text-sm mt-2 line-clamp-2">{about}</p>
            </div>
            <div className="flex ml-auto mx-5">
              <button className="btn btn-secondary mx-4" onClick={() => reviewRequest("accepted", request._id)}>Accept</button>
              <button className="btn btn-primary" onClick={() => reviewRequest("rejected", request._id)}>Reject</button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Requests;