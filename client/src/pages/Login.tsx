import { useState } from "react";
import { api } from "../utils/api";
import { useNavigate } from "react-router-dom";
import { Cookies } from "react-cookie";
import { useUser } from "../context/user.context";

export const Login = () => {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await api.post("/auth/login", personDetails);
            const token = result.data?.token;
            setUser(result.data.userObject);

            if (token) {
                localStorage.setItem("token", token);
                cookie.set("token", token);
                console.log("Token set, user will update in next render.");
                navigate("/");
            }
        } catch (error: any) {
            setError(error.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 h-screen grid content-center">
            <div className="flex items-center w-full max-w-md px-6 mx-auto lg:w-2/6">
                <div className="flex-1">
                    <div className="text-center">
                        <p className="mt-3 text-gray-500 dark:text-gray-300">Login</p>
                    </div>

                    <div className="mt-8">
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label className="block mb-2 text-sm text-gray-600 dark:text-gray-200">
                                    Email Address
                                </label>
                                <input
                                    onChange={handleInputChange}
                                    value={personDetails.email}
                                    type="email"
                                    name="email"
                                    id="email"
                                    placeholder="example@example.com"
                                    className="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                                />
                            </div>

                            <div className="mt-6">
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm text-gray-600 dark:text-gray-200">Password</label>
                                </div>

                                <input
                                    onChange={handleInputChange}
                                    value={personDetails.password}
                                    type="password"
                                    name="password"
                                    id="password"
                                    placeholder="Your Password"
                                    className="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                                />
                            </div>

                            <div className="mt-6">
                                <button
                                    type="submit"
                                    className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-300 transform bg-blue-500 rounded-lg hover:bg-blue-400 focus:outline-none focus:bg-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
                                >
                                    Sign In
                                </button>
                                {error && <p className="text-center text-red-700 p-4">{error}</p>}
                            </div>
                        </form>

                        <p className="mt-6 text-sm text-center text-gray-400">
                            Don't have an account yet?{" "}
                            <a href="#" className="text-blue-500 focus:outline-none focus:underline hover:underline">
                                Sign Up
                            </a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
