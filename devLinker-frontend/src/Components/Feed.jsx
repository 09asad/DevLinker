import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addUserToFeed } from "../utils/feedSlice";
import { useEffect } from "react";
import UserCard from "./UserCard";

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();

  const getFeed = async () => {
    try {
      const res = await axios.get(BASE_URL + "/feed",
        { withCredentials: true }
      );
      dispatch(addUserToFeed(res.data));

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getFeed();
  }, []);

  if (!feed) return null;

  if (feed.length === 0) return <h1 className="text-center my-5 font-bold text-2xl"> No More User Found!</h1>;

  return (
    <div className="flex justify-center my-10">
      <UserCard user={feed[0]} />
    </div>
  );
};

export default Feed;
