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
  } | null>(null); // ✅ Corrected initialization

  useEffect(() => {
    if (!value) return; // ✅ Prevent unnecessary API calls

    api
      .post("/project/check", { name: value })
      .then((result) => {
        console.log("PROJECT:", result.data);
        setIsProjectExist(result.data); // ✅ Ensure the correct response structure
      })
      .catch((error) => {
        console.error("❌ Error checking project:", error);
        setIsProjectExist({ message: false, id: "" }); // ✅ Handle API failure
      });
  }, [value]);

  if (isProjectExist === null) {
    return <div>Loading...</div>; // ✅ Loading state
  }

  return (
    <>
      {isProjectExist.message ? (
        <div className="">
          <Chat projectId={isProjectExist.id} />
        </div>
      ) : (
        <Navigate to="/" />
      )}
    </>
  );
};
