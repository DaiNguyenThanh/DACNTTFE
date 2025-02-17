import axios from './axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';


export const CreateComment = async ({ content, file_ids,mention_ids,object_id,source }) => {
    try {
      

        const response = await axios.post(`${API_URL}/comments`, {
            content:content,
            file_ids:file_ids,
            mention_ids:mention_ids,
            object_id:object_id,
            source:source
            
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

export const GetAllComments = async (object_id,source) => {
    try {
        const response = await axios.get(`${API_URL}/comments/all?object_id=${object_id}&&source=${source}`);
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



export const DeleteComments = async (ids) => {
    try {
        const response = await axios.delete(`${API_URL}/comments`, {
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
export const GetComment= async(id)=>{
    try {
        const response = await axios.get(`${API_URL}/comments/${id}`);
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
