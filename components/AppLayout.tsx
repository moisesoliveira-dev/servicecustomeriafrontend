"use client";

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Sidebar } from "./Layout/Sidebar";
import Dashboard from "./Dashboard";
import CompanyManager from "./CompanyManager";
import FlowBuilder from "./FlowBuilder";
import StateMonitor from "./StateMonitor";
import ExecutionLogsView from "./ExecutionLogsView";
import JsonMapperView from "./JsonMapperView";
import OutputGeneratorView from "./OutputGeneratorView";
import IntegrationHub from "./IntegrationHub";
import GlobalSettingsView from "./GlobalSettingsView";

type Route =
    | "/"
    | "/companies"
    | "/flow"
    | "/flow/monitor"
    | "/logs"
    | "/mapping"
    | "/output"
    | "/integrations"
    | "/settings";

export function AppLayout() {
    const [currentRoute, setCurrentRoute] = useState<Route>("/");

    const renderPage = () => {
        switch (currentRoute) {
            case "/":
                return <Dashboard />;
            case "/companies":
                return <CompanyManager />;
            case "/flow":
                return <FlowBuilder />;
            case "/flow/monitor":
                return <StateMonitor />;
            case "/logs":
                return <ExecutionLogsView />;
            case "/mapping":
                return <JsonMapperView />;
            case "/output":
                return <OutputGeneratorView />;
            case "/integrations":
                return <IntegrationHub />;
            case "/settings":
                return <GlobalSettingsView />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#02040a] text-slate-200">
            <Sidebar currentRoute={currentRoute} onNavigate={setCurrentRoute} />
            <main className="flex-1 flex flex-col relative overflow-hidden">
                <AnimatePresence mode="wait">{renderPage()}</AnimatePresence>
            </main>
        </div>
    );
}
