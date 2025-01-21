import axios from './axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';


export const CreateRequest = async ({ attachment_ids, deadline,reason,task_id,type,workspace_id }) => {
    try {
      

        const response = await axios.post(`${API_URL}/requests`, {
            attachment_ids:attachment_ids,
            deadline:deadline,
            reason:reason,
            task_id:task_id,
            type:type,
            workspace_id:workspace_id
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

export const GetAllRequest = async () => {
    try {
        const response = await axios.get(`${API_URL}/requests/all`);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Get all failed');
        } else if (error.request) {
            throw new Error('Cannot connect to server');
        } else {
            throw new Error('An error occurred');
        }
    }
}


export const UpdateRequest = async ({ id,reason}) => {
    try {
        const response = await axios.put(`${API_URL}/requests/${id}`, {
           id:id,
           path:reason
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

export const DeleteRequest = async (ids) => {
    try {
        const response = await axios.delete(`${API_URL}/requests`, {
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
export const GetRequest= async(id)=>{
    try {
        const response = await axios.get(`${API_URL}/requests/${id}`);
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
export const ConfirmRequest= async(id, { reason, status }) => {
    try {
        const response = await axios.patch(`${API_URL}/requests/${id}/confirm`, {
            reason: reason,
            status: status
        });
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

