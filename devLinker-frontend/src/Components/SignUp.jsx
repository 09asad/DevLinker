import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addUser } from "../utils/userSlice";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

const SignUp = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignUp = async () => {

    try {
      if (!firstName || !lastName || !emailId || !password) {
        setError("All fields are required");
        return;
      }

      const res = await axios.post(
        BASE_URL + "/signup",
        {
          firstName,
          lastName,
          emailId,
          password,
        }, { withCredentials: true }
      );
      dispatch(addUser(res.data.data));
      return navigate("/profile");

    } catch (err) {
      setError(err.response?.data || "Something went wrong");
    }
  };

  return (
    <div className='flex justify-center my-20'>
      <div className="card bg-base-300 w-96 shadow-sm">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl">Sign Up</h2>
          <div>
            <fieldset className="fieldset my-5">

              <label className='font-semibold py-2'>First Name : </label>
              <input
                type="text"
                className="input w-full"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
              />

              <label className='font-semibold py-2'>Last Name : </label>
              <input
                type="text"
                className="input w-full"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
              />

              <label className='font-semibold py-2'>Email : </label>
              <input
                type="email"
                className="input w-full"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                placeholder="Enter your email"
              />

              <label className='font-semibold py-2 pt-3'>Password : </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  className="absolute right-3 top-2.5 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  👁️
                </button>
              </div>
            </fieldset>
          </div>
          <p className='text-red-500'>{error}</p>
          <div className="card-actions justify-center my-2">
            <button className="btn btn-primary w-full" onClick={handleSignUp}>Sign Up</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp;