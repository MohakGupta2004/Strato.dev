import { motion } from "framer-motion";
export const Users = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    return (
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? "0%" : "-100%" }}
        exit={{ x: "-100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed top-0 left-0 h-full w-1/3 bg-white shadow-lg p-6 z-50 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Users</h2>
          <button className="px-4 py-2 bg-red-500 text-white rounded-lg" onClick={onClose}>
            X
          </button>
        </div>
        <div className="mt-4">
          {/* Example user list */}
          <div className="flex items-center space-x-3 p-2 hover:bg-gray-100 cursor-pointer rounded-md">
            <img src="https://images.unsplash.com/photo-1549078642-b2ba4bda0cdb?auto=format&fit=facearea&facepad=3&w=144&h=144" className="w-10 h-10 rounded-full" alt="User" />
            <span className="text-gray-800">John Doe</span>
          </div>
          <div className="flex items-center space-x-3 p-2 hover:bg-gray-100 cursor-pointer rounded-md">
            <img src="https://images.unsplash.com/photo-1590031905470-a1a1feacbb0b?auto=format&fit=facearea&facepad=3&w=144&h=144" className="w-10 h-10 rounded-full" alt="User" />
            <span className="text-gray-800">Jane Smith</span>
          </div>
        </div>
      </motion.div>
    );
  };