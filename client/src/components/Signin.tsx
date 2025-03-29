import { useState } from "react";
import logo from "../assets/react.svg";
import { api } from "../utils/api";
import { useNavigate } from "react-router-dom";
import { Cookies } from "react-cookie";
import { useUser } from "../context/user.context"

function Signin() {
    const [isLogin, setIsLogin] = useState(true);
    const Switch = () => {
        setIsLogin(!isLogin);
    };
    const [isChecked, setIsChecked] = useState(false);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsChecked(e.target.checked);
    };
    const LoginChange = isLogin ? "Sign in" : "Sign up"

    const [personDetails, setPersonDetails] = useState({
        email: "",
        password: "",
    });

    const { setUser } = useUser();
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const cookie = new Cookies();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPersonDetails((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };


    const handleSubmitSignin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await api.post("/auth/login", personDetails);
            const token = result.data?.token;
            setUser(result.data.userObject);

            if (token) {
                localStorage.setItem("token", token);
                cookie.set("token", token);
                console.log("Token set, user will update in next render.");
                navigate("/wallet");
            }
        } catch (error: any) {
            setError(error.response?.data?.message || "Login failed");
        }
    };
    const handleSubmitSignup = async (e) => {
        e.preventDefault();
        try {
            const result = await api.post("/auth/register", personDetails);
            localStorage.setItem("token", result.data?.token);
            cookie.set("token", result.data?.token);

            setUser(result.data.userObject);
            navigate("/login");
        } catch (error: any) {
            setError(error?.response?.statusText || "Something went wrong");
        }
    }

    return (
        <>
            <div className="flex justify-center items-center">
                <div className="border p-5 rounded-md bg-gray-500">
                    <div className="flex flex-col items-center justify-center gap-5">
                        <div className="flex flex-col items-center">
                            <div className="border-2 rounded-xl p-2">
                                <img src={logo} alt="" />
                            </div>
                            <p>{LoginChange} to AI-AGENT</p>
                        </div>
                        <div className="flex flex-col" >
                            <form className="flex flex-col gap-10" onSubmit={isLogin ? handleSubmitSignin : handleSubmitSignup}>
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col">
                                        <label className="">Email</label>
                                        <input onChange={handleInputChange}
                                            value={personDetails.email}
                                            type="email"
                                            name="email"
                                            id="email"
                                            placeholder="example@example.com"
                                            className="border-2 rounded-md p-3" />
                                    </div>
                                    <div className="flex flex-col" >
                                        <label className="">Password</label>
                                        <div className="flex items-center border-2 rounded-md">
                                            <input
                                                type={isChecked ? "text" : "password"}
                                                placeholder="Your password"
                                                name="password"
                                                id="password"
                                                onChange={handleInputChange}
                                                value={personDetails.password}
                                                className="flex flex-col p-3"
                                            />
                                            <span className="flex flex-col" >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={handleChange}
                                                />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <button type="submit" className="text-white bg-blue-600 dark:text-black dark:bg-blue-500 border-none rounded-sm" >{LoginChange}</button>
                                    {error && <p className="text-center text-red-700 p-4">{error}</p>}
                                </div>
                            </form>
                        </div>
                        <div className="">
                            <button onClick={Switch}>
                                Don't have an account? <b className="text-blue-700" >{isLogin ? "Sign up" : "Sign in"}</b>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Signin;