import axios from './axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';


export const CreateFile = async ({ file, from }) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('from', from);

        const response = await axios.post(`${API_URL}/uploads`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
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

export const GetAllFile = async () => {
    try {
        const response = await axios.get(`${API_URL}/uploads/all`);
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


export const UpdateFile = async ({ id,path}) => {
    try {
        const response = await axios.put(`${API_URL}/uploads/${id}`, {
           id:id,
           path:path
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

export const DeleteFiles = async (ids) => {
    try {
        const response = await axios.delete(`${API_URL}/uploads`, {
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
export const GetFile= async(id)=>{
    try {
        const response = await axios.get(`${API_URL}/uploads/${id}`);
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
