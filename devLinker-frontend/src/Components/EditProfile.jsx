import axios from "axios";
import { useState } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";

const EditProfile = ({ user }) => {

    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName);
    const [photoURL, setPhotoURL] = useState(user.photoURL);
    const [age, setAge] = useState(user.age);
    const [gender, setGender] = useState(user.gender);
    const [about, setAbout] = useState(user.about);
    const [error, setError] = useState("");
    const dispatch = useDispatch();
    const [showToast, setShowToast] = useState(false);

    const update = async () => {
        try {
            const res = await axios.patch(BASE_URL + "/profile/edit",
                { firstName, lastName, age, gender, about, photoURL }, { withCredentials: true }
            );
            dispatch(addUser(res.data?.data));
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
            }, 3000); 
        } catch (err) {
            setError(err.response?.data);
        }
    };

    return (
        <div className="flex justify-center my-10">
            <div className='flex justify-center '>
                <div className="card bg-base-300 w-96 shadow-sm">
                    <div className="card-body">
                        <h2 className="card-title justify-center text-2xl">Edit Profile</h2>
                        <div className='p'>
                            <fieldset className="fieldset my-5">

                                <label className='font-bold py-2'>First Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                                <label className='font-bold py-2'>Last Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                                <label className='font-bold py-2'>Photo URL</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={photoURL}
                                    onChange={(e) => setPhotoURL(e.target.value)}
                                />
                                <label className='font-bold py-2'>Age</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                />
                                <label className='font-bold py-2'>Gender</label>
                                <select
                                    className="input"
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                                <label className='font-bold py-2'>About</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={about}
                                    onChange={(e) => setAbout(e.target.value)}
                                />
                            </fieldset>
                        </div>
                        <p className="text-red-500">{error}</p>
                        <div className="card-actions justify-center py-3">
                            <button className="btn btn-primary" onClick={update}>Update</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card bg-base-300 w-96 shadow-sm mx-10">
                <figure>
                    <img
                        src={photoURL}
                        alt="photo" />
                </figure>
                <div className="card-body">
                    <h2 className="card-title">{firstName + " " + lastName}</h2>
                    <p>{age + " , " + gender}</p>
                    <p>{about}</p>
                </div>
            </div> 

            {showToast && <div className="toast toast-top toast-center">
                <div className="alert alert-success">
                    <span>Profile Updated Successfully</span>
                </div>
            </div>}
        </div>
    )
};

export default EditProfile;