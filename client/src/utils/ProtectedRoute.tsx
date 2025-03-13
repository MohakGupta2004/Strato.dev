'use client'
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "./api";

interface ProtectedRouteProps {
    component: React.FC;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component }) => {
    const [user, setUser] = useState<{ _id: string; email: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        api.get('/auth/profile', {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(({ data }) => {
            setUser(data.message);
        })
        .catch(() => {
            setUser(null);
        })
        .finally(() => {
            setLoading(false);
        });
    }, []);

    if (loading) return <p>Loading...</p>;

    if (!user) {
        return <Navigate to="/login" />;
    }

    return <Component />;
};
