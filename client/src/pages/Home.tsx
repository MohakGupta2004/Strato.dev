import { useEffect, useState } from "react";
import { api } from "../utils/api";

export const Home = () => {
  const [projects, setProjects] = useState<Array<{ _id: string; name: string; users: Array<string> }>>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get("/project")
      .then((result) => {
        setProjects(result.data);
      })
      .catch(() => {
        setError("Failed to fetch projects.");
      })
      .finally(() => setLoading(false));
  }, []);

  const createProject = async () => {
    if (!projectName) return alert("Project name is required!");

    try {
      const result = await api.post("/project/create", 
        { name: projectName },
      );

      setProjects([...projects, result.data]); // Add new project to state
      setModalOpen(false); // Close modal
      setProjectName(""); // Clear input
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex items-center space-x-6 m-11">
      {/* Button to Open Modal */}
      <div onClick={() => setModalOpen(true)} className="h-25 w-25 flex justify-center items-center bg-white hover:bg-slate-700 text-black px-5 py-3 rounded cursor-pointer border">
        <button>+</button> 
      </div>

      {/* Show loading state */}
      {loading && <p>Loading projects...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Project List */}
      {projects.map((project) => (
        <div className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm" key={project._id}>
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
            {project.name}
          </h5>
          <a href="#" className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300">
            Start
            <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
            </svg>
          </a>
        </div>
      ))}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <input 
              type="text" 
              placeholder="Project name..." 
              className="border p-2 rounded w-full"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
            <div className="mt-4 flex justify-end space-x-4">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-gray-500 text-white rounded">
                Cancel
              </button>
              <button onClick={createProject} className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-700">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
