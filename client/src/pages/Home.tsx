import { useEffect, useState } from "react";
import { api } from "../utils/api";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const [projects, setProjects] = useState<
    Array<{ _id: string; name: string; users: Array<string> }>
  >([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/project")
      .then((result) => {
        setProjects(Array.isArray(result.data) ? result.data : []);
      })
      .catch(() => {
        setError("Failed to fetch projects.");
        setProjects([]); // Fallback to empty array
      })
      .finally(() => setLoading(false));
  }, []);

  const createProject = async () => {
    if (!projectName) return alert("Project name is required!");

    try {
      const result = await api.post("/project/create", {
        name: projectName,
      });

      setProjects((prevProjects) => [...prevProjects, result.data]);
      setModalOpen(false);
      setProjectName("");
    } catch (err) {
      console.error(err);
    }
  };

  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-8">
      {/* Button to Open Modal */}
      <div
        onClick={() => setModalOpen(true)}
        className="h-16 w-16 flex justify-center items-center bg-gray-800 hover:bg-gray-700 text-white px-5 py-3 rounded-full cursor-pointer border border-gray-600 shadow-md transition-all"
      >
        <button className="text-2xl">+</button>
      </div>

      {/* Show loading state */}
      {loading && <p className="text-gray-400 mt-6">Loading projects...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* No projects exist */}
      {!loading && projects.length === 0 && (
        <p className="text-gray-400 text-lg mt-6">No projects exist 🚀</p>
      )}

      {/* Project List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 w-full max-w-6xl">
      {projects.map((project) => (
  <div
    key={project._id}
    className="p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-lg backdrop-blur-lg bg-opacity-50 transition hover:bg-opacity-70"
  >
    <h5 className="mb-2 text-2xl font-bold tracking-tight text-white">
      {project.name}
    </h5>
    <p className="text-gray-400">
      Collaborators: {Array.isArray(project.users) ? project.users.length : 0}
    </p>
    <button
      onClick={() => navigate(`/projects?name=${project.name}`)}
      className="mt-3 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 transition"
    >
      Start
    </button>
  </div>
))}

      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <input
              type="text"
              placeholder="Project name..."
              className="border p-2 rounded w-full bg-gray-700 text-white"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
