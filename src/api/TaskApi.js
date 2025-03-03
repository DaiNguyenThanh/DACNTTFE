import axios from './axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';
const token = localStorage.getItem('token');


export const CreateTask = async ({  assignee_ids, collaborator_ids,deadline,description,priority,stage_id,status,title,workspace_id,file_ids}) => {
   
    try {
        const response = await axios.post(`${API_URL}/tasks`, {
            assignee_ids: assignee_ids,
            collaborator_ids:collaborator_ids,
            deadline:deadline,
            description:description,
            priority:priority,
            stage_id:stage_id,
            status:status,
            title:title,
            workspace_id:workspace_id,
            file_ids:file_ids
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

export const GetAllTasks = async (stage_id, assignee_ids, collaborator_ids, deadline_from, deadline_to, priority, status,keyword) => {
    try {
        const queryParams = new URLSearchParams();
        
        if (stage_id !== null && stage_id !== undefined) queryParams.append('stage_id', stage_id);
        if (assignee_ids !== null && assignee_ids !== undefined &&assignee_ids.lenth>0) queryParams.append('assignee_ids', assignee_ids);
        if (deadline_from !== null && deadline_from !== undefined && deadline_from!=="") queryParams.append('deadline_from', deadline_from);
        if (deadline_to !== null && deadline_to !== undefined && deadline_to!=="") queryParams.append('deadline_to', deadline_to);
        if (priority !== null && priority !== undefined && priority!=="") queryParams.append('priority', priority);
        if (status !== null && status !== undefined) queryParams.append('status', status);
        if (keyword !== null && keyword !== undefined&& keyword!=="") queryParams.append('keyword', keyword);
        const response = await axios.get(`${API_URL}/tasks/all?${queryParams.toString()}`);
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


export const UpdateTask = async ({ id,assignee_ids, collaborator_ids,deadline,description,priority,stage_id,status,title,workspace_id,file_ids}) => {
    try {
        const response = await axios.put(`${API_URL}/tasks/${id}`, {
            assignee_ids: assignee_ids,
            collaborator_ids:collaborator_ids,
            deadline:deadline,
            description:description,
            priority:priority,
            stage_id:stage_id,
            status:status,
            title:title,
            workspace_id:workspace_id,
            file_ids:file_ids
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

export const DeleteTasks = async (ids) => {
    try {
        const response = await axios.delete(`${API_URL}/tasks`, {
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
export const GetTask= async(id)=>{
    try {
        const response = await axios.get(`${API_URL}/tasks/${id}`);
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
export const UpdatePosition= async(id,position,pre_task_id)=>{
    try {
        const response = await axios.patch(`${API_URL}/tasks/${id}/position-in-stage`,{
            id:id,
            position:position,
            pre_task_id:pre_task_id
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
export const UpdateTaskStage= async(id,position,pre_task_id,stage_id)=>{
    try {
        const response = await axios.patch(`${API_URL}/tasks/${id}/stage`,{
            id:id,
            position:position,
            pre_task_id:pre_task_id,
            stage_id:stage_id
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
export const PatchTask=async ({ id,assignee_ids, collaborator_ids,deadline,description,priority,stage_id,status,title,workspace_id,file_ids})=>{
    // Kiểm tra nếu các trường là null hoặc empty thì không gửi
    
    const dataToSend = {
        ...(assignee_ids && { assignee_ids }),
        ...(collaborator_ids && { collaborator_ids }),
        ...(deadline && { deadline }),
        ...(description && { description }),
        ...(priority && { priority }),
        ...(stage_id && { stage_id }),
        ...(status && { status }),
        ...(title && { title }),
        ...(workspace_id && { workspace_id }),
        ...(file_ids && { file_ids })
    };

    try {
        const response = await axios.patch(`${API_URL}/tasks/${id}`, dataToSend);
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

