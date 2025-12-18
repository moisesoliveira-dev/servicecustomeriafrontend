"use client";

import { AppProvider, useApp } from "@/context/AppContext";
import Login from "@/components/Login";
import { AppLayout } from "@/components/AppLayout";

function AppContent() {
    const { isAuthenticated } = useApp();

    return isAuthenticated ? <AppLayout /> : <Login />;
}

export default function Home() {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
}
