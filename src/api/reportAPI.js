import axios from './axios';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

export const GetReport = async (extra_group_field, group_field, stage_ids, sub_group_field, type, workspace_ids) => {
    try {
        const params = {};
        if (extra_group_field) params.extra_group_field = extra_group_field;
        if (group_field) params.group_field = group_field;
        if (Array.isArray(stage_ids) && stage_ids.length > 0) params.stage_ids = stage_ids;
        if (Array.isArray(workspace_ids) && workspace_ids.length > 0) params.workspace_ids = workspace_ids;
        if (sub_group_field) params.sub_group_field = sub_group_field;
        if (type) params.type = type;

        const queryString = new URLSearchParams(params).toString();
        const response = await axios.get(`${API_URL}/reports?${queryString}`);
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
};
export const CreateChart = async (color, extra_group_field, group_field, name, stage_ids, sub_group_field, type, workspace_ids) => {
    try {
        const response = await axios.post(`${API_URL}/charts`, {
            color: color,
            extra_group_field: extra_group_field,
            group_field: group_field,
            name: name,
            stage_ids: stage_ids,
            sub_group_field: sub_group_field,
            type: type,
            workspace_ids: workspace_ids
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Create failed');
        } else if (error.request) {
            throw new Error('Cannot connect to server');
        } else {
            throw new Error('An error occurred');
        }
    }
}
export const GetAllCharts = async () => {
    try {
        const response = await axios.get(`${API_URL}/charts/all`);
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
export const GetChart = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/charts/${id}`);
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
export const UpdateChart = async (id, color, extra_group_field, group_field, name, stage_ids, sub_group_field, type, workspace_ids) => {
    try {
        const response = await axios.put(`${API_URL}/charts/${id}`, {
            color: color,
            extra_group_field: extra_group_field,
            group_field: group_field,
            name: name,
            stage_ids: stage_ids,
            sub_group_field: sub_group_field,
            type: type,
            workspace_ids: workspace_ids
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
export const DeleteCharts = async (ids) => {
    try {
        const response = await axios.delete(`${API_URL}/charts`,{
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