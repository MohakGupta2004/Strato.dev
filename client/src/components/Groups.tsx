import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { api } from "../utils/api";

export const Users = ({ isOpen, onClose, projectName }: { isOpen: boolean; onClose: () => void, projectName: string | null }) => {
    const [users, setUsers] = useState<Array<string>>([]);

    useEffect(() => {
        if (!projectName) {
            setUsers(["No Users Found"]);
            return;
        }

        api.get(`/project/${projectName}`)
            .then((result) => {
                console.log(result.data);
                // Assuming result.data is an array of usernames
                setUsers(Array.isArray(result.data) ? result.data : ["Invalid data format"]);
            })
            .catch((err) => {
                console.error(err);
                setUsers(["Failed to fetch users"]);
            });
    }, [projectName, isOpen]);

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
                <button className="px-4 py-2 bg-red-500 text-white rounded-lg cursor-pointer" onClick={onClose}>
                    X
                </button>
            </div>
            <div className="mt-4">
                {users.map((user, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-100 cursor-pointer rounded-md">
                        <span className="text-gray-800">{user}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};
