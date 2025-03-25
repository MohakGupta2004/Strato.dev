import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { api } from "../utils/api";
import Chat from "../components/Chat";

export const Projects = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const value = queryParams.get("name");

  const [isProjectExist, setIsProjectExist] = useState<{
    message: boolean;
    id: string;
  } | null>(null);

  useEffect(() => {
    if (!value) return;

    api
      .post("/project/check", { name: value })
      .then((result) => {
        console.log("PROJECT:", result.data);
        setIsProjectExist(result.data);
      })
      .catch((error) => {
        console.error("❌ Error checking project:", error);
        setIsProjectExist({ message: false, id: "" });
      });
  }, [value]);

  if (isProjectExist === null) {
    return (
      <div className="h-screen flex items-center justify-center text-white text-lg">
        Loading...
      </div>
    );
  }

  return (
    <>
      {isProjectExist.message ? (
        <div className="">
          <Chat projectId={isProjectExist.id} />
        </div>
      ) : (
        <div className="h-screen flex flex-col items-center justify-center text-white">
          <h2 className="text-2xl font-semibold bg-gray-800/80 px-6 py-4 rounded-lg shadow-lg">
            No projects exist 🚀
          </h2>
          <Navigate to="/" />
        </div>
      )}
    </>
  );
};
