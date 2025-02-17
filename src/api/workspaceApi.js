import axios from './axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';
const token = localStorage.getItem('token');


export const CreateWorkSpace = async ({  name, stages,subject_ids,user_ids }) => {
   
    try {
        const response = await axios.post(`${API_URL}/workspaces`, {
            name: name,
            stages:stages,
            subject_ids:subject_ids,
            user_ids:user_ids
        });

        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Created failed');
        } else if (error.request) {
            throw new Error('Cannot connect to server');
        } else {
            throw new Error('An error occurred');
        }
    }
}

export const GetAllWorkSpaces = async () => {
    try {
        const response = await axios.get(`${API_URL}/workspaces/all`);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Get all workspaces failed');
        } else if (error.request) {
            throw new Error('Cannot connect to server');
        } else {
            throw new Error('An error occurred');
        }
    }
}

export const GetWorkSpace = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/workspaces/${id}`);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Get workspace failed');
        } else if (error.request) {
            throw new Error('Cannot connect to server');
        } else {
            throw new Error('An error occurred');
        }
    }
}
export const GetWorkSpaceMe = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/workspaces/me`);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Get workspace failed');
        } else if (error.request) {
            throw new Error('Cannot connect to server');
        } else {
            throw new Error('An error occurred');
        }
    }
}
export const UpdateWorkSpace = async ({ id,
    name,
    user_ids,
    subject_ids,
    stages }) => {
    try {
        const response = await axios.put(`${API_URL}/workspaces/${id}`, {
            id,
            name,
            user_ids,
            subject_ids,
            stages
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Update failed');
        } else if (error.request) {
            throw new Error('Cannot connect to server');
        } else {
            throw new Error('An error occurred');
        }
    }
}

export const DeleteWorkSpace = async (ids) => {
    try {
        const response = await axios.delete(`${API_URL}/workspaces`, {
            data: { ids }
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Delete failed');
        } else if (error.request) {
            throw new Error('Cannot connect to server');
        } else {
            throw new Error('An error occurred');
        }
    }
}
export const GetWorkspaceDetailAPI= async(id)=>{
    try {
        const response = await axios.get(`${API_URL}/workspaces/${id}`);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Get failed');
        } else if (error.request) {
            throw new Error('Cannot connect to server');
        } else {
            throw new Error('An error occurred');
        }
    }
}