import React, { useState } from "react";
import styled from "@emotion/styled";
import { Draggable } from "react-beautiful-dnd";
import { Badge, Col, Row,Typography,Dropdown,Menu,Button,Popconfirm,Form,Modal,Input,Select,DatePicker,Upload } from 'antd';
import { PlusOutlined, UploadOutlined,EditOutlined } from '@ant-design/icons';
import moment from "moment";
import { CreateTask } from '../../api/TaskApi';
const {Text}=Typography
const Container = styled("div")`
  border: 1px solid lightgrey;
  margin-bottom: 8px;
  border-radius: 2px;
  padding: 8px;
  background: ${props => (props.isDragging ? "lightgreen" : "white")};
`;

const Task = ({ task, index,showEditModal}) => {
  
  const [users, setUsers] = useState([]);
  const [form] = Form.useForm();
  const handleDelete = async () => {
    try {
      
    } catch (error) {
      console.error("Lỗi khi xóa stage:", error);
    }
  };
  
  
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      const formattedDeadline = moment(values.deadline).format('YYYY-MM-DD HH:mm:ss');

      // const response = await CreateTask({
      //   assignee_ids: values.assigners,
      //   collaborator_ids: values.collaborators,
      //   deadline: formattedDeadline,
      //   description: values.description,
      //   priority: values.priority,
      //   title: values.title,
      //   stage_id: column.id,
      //   status: true,
      //   workspace_id: selectedWorkspace
      // });

      // tasks.push(response.data);
     
      form.resetFields();
    } catch (error) {
      console.error("Lỗi khi tạo task:", error);
    }
  };
  return (
   
    <Draggable draggableId={task.id} index={index} type="task">
      {(provided, snapshot) => (
        <Container
          ref={provided.innerRef}
          {...provided.dragHandleProps}
          {...provided.draggableProps}
          isDragging={snapshot.isDragging}
        >
          <Row justify="space-between">
            <Col >
              <div>{task.title}</div>
             
            </Col>
            <Col>
            <Button type="link" onClick={() => showEditModal(task.id)} icon={<EditOutlined/>  }></Button>
            </Col>
          
          </Row>
          <Row justify="space-between">
            <Col >
            
              <Text type="secondary">{task.deadline}</Text>
            </Col>
           
            <Col >

              <Badge
                count={task.priority}
                style={{ backgroundColor: task.priority === 'high' ? '#f5222d' : task.priority === 'medium' ? '#faad14' : '#52c41a' }}
              />
             
            </Col>
          </Row>
          
        

        </Container>
      )}
    </Draggable>
  
    

  );
};

export default Task;
