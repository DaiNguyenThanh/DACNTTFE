import React, { createContext, useContext, useState, useEffect } from 'react';
import { GetWorkSpaceMe } from '../api/workspaceApi';

const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => {
    const [selectedWorkspace, setSelectedWorkspace] = useState();
    const [selectedWorkspaceName, setSelectedWorkspaceName] = useState();
    const [workspaces, setWorkspaces] = useState([]);

    useEffect(() => {
        const fetchWorkspaces = async () => {
            try {
                const response = await GetWorkSpaceMe();
                setWorkspaces(response.data);
                
            } catch (error) {
                console.error('Failed to fetch workspaces:', error);
            }
        };

        fetchWorkspaces();
    }, []);

    return (
        <WorkspaceContext.Provider value={{ selectedWorkspace, setSelectedWorkspace, selectedWorkspaceName, setSelectedWorkspaceName,workspaces }}>
            {children}
        </WorkspaceContext.Provider>
    );
};

export const useWorkspace = () => {
    return useContext(WorkspaceContext);
};