import { useState } from "react";
import { api } from "../utils/api";
import { useNavigate } from "react-router-dom";
import { Cookies } from "react-cookie";
import { useUser } from "../context/user.context";

export const Signup = () => {
  const [personDetails, setPersonDetails] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const {setUser } = useUser();
  const navigate = useNavigate();
  const cookie = new Cookies();

  return (
    <div className="bg-white dark:bg-gray-900 h-screen grid content-center">
      <div className="flex items-center w-full max-w-md px-6 mx-auto lg:w-2/6">
        <div className="flex-1">
          <div className="text-center">
            <p className="mt-3 text-gray-500 dark:text-gray-300">Register</p>
          </div>

          <div className="mt-8">
            <form
              onSubmit={async (e) => {
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
              }}
            >
              <div>
                <label className="block mb-2 text-sm text-gray-600 dark:text-gray-200">
                  Email Address
                </label>
                <input
                  type="email"
                  onChange={(e) =>
                    setPersonDetails((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  value={personDetails.email}
                  name="email"
                  id="email"
                  placeholder="example@example.com"
                  className="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                />
              </div>

              <div className="mt-6">
                <label className="text-sm text-gray-600 dark:text-gray-200">Password</label>
                <input
                  type="password"
                  onChange={(e) =>
                    setPersonDetails((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  value={personDetails.password}
                  name="password"
                  id="password"
                  placeholder="Your Password"
                  className="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                />
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full cursor-pointer px-4 py-2 tracking-wide text-white transition-colors duration-300 transform bg-blue-500 rounded-lg hover:bg-blue-400 focus:outline-none focus:bg-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
                >
                  Sign up
                </button>
              </div>
              <p className="text-center text-red-700 p-4">{error}</p>
            </form>

            <p
              onClick={() => navigate("/login")}
              className="mt-6 text-sm text-center text-gray-400 cursor-pointer"
            >
              Have an account?{" "}
              <span className="text-blue-500 focus:outline-none focus:underline hover:underline">
                Sign In
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
