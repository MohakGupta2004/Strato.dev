import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api } from '../utils/api';

export const Projects = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const value = queryParams.get('name');
  const [isProjectExist, setIsProjectExist] = useState<boolean | null>(null); // Default: null (loading state)

  useEffect(() => {
    if (!value) return; // Prevent API call if name is missing

    api.post('/project/check', {
        name: value
    })
    .then((result) => {
        console.log(result.data);
        setIsProjectExist(result.data); // Expecting true/false
    })
    .catch((error) => {
        console.error("Error checking project:", error);
        setIsProjectExist(false); // On error, assume project does not exist
    });
  }, [value]); // ✅ Added value as a dependency

  if (isProjectExist === null) {
    return <div>Loading...</div>; // Show a loading state while waiting for API response
  }

  return <>{isProjectExist ? <div>{value}</div> : <Navigate to="/" />}</>
};
