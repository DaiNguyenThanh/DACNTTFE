import axios from './axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';
const token = localStorage.getItem('token');


export const CreateStage = async ({  id, name}) => {
   
    try {
        const response = await axios.post(`${API_URL}/stages`, {
            name: name
          
          
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

export const GetAllStages = async () => {
    try {
        const response = await axios.get(`${API_URL}/stages/all`);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Get all stages failed');
        } else if (error.request) {
            throw new Error('Cannot connect to server');
        } else {
            throw new Error('An error occurred');
        }
    }
}


export const UpdateStage = async ({ id,name}) => {
    try {
        const response = await axios.put(`${API_URL}/stages/${id}`, {
            id: id,
         name:name
          
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

export const DeleteStages = async (ids) => {
    try {
        const response = await axios.delete(`${API_URL}/stages`, {
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
export const GetStageDetailAPI= async(id)=>{
    try {
        const response = await axios.get(`${API_URL}/stages/${id}`);
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