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
            <div>
                <div>
                    <div className="">
                        <div>
                            <div className="">
                                <img src={logo} alt="" />
                            </div>
                            <p>{LoginChange} to AI-AGENT</p>
                        </div>
                        <div>
                            <form onSubmit={isLogin ? handleSubmitSignin : handleSubmitSignup}>
                                <div>
                                    <label className="">Email</label>
                                    <input onChange={handleInputChange}
                                        value={personDetails.email}
                                        type="email"
                                        name="email"
                                        id="email"
                                        placeholder="example@example.com"
                                        className="" />
                                </div>
                                <div>
                                    <label className="">Password</label>
                                    <input
                                        type={isChecked ? "text" : "password"}
                                        placeholder="Your password"
                                        name="password"
                                        id="password"
                                        onChange={handleInputChange}
                                        value={personDetails.password}
                                        className=""
                                    />
                                    <div>
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={handleChange}
                                        />
                                        <label>Show Password</label>
                                    </div>
                                </div>
                                <div className="">
                                    <button type="submit" className="" >{LoginChange}</button>
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