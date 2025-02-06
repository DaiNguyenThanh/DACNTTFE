import React, { useState } from "react";
import styled from "@emotion/styled";
import { Draggable } from "react-beautiful-dnd";
import { Badge, Col, Row,Typography,Dropdown,Menu,Button,Popconfirm,Form,Modal,Input,Select,DatePicker,Upload } from 'antd';
import { PlusOutlined, UploadOutlined,EditOutlined,EllipsisOutlined,HistoryOutlined } from '@ant-design/icons';
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

const Task = ({ task, index,showEditModal,showHistoryDrawer}) => {
  
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
            <Badge
                count={task.priority}
                style={{ backgroundColor: task.priority === 'high' ? '#f5222d' : task.priority === 'medium' ? '#faad14' : '#52c41a' }}
              />
          
          {/* <Button type="link" onClick={()=>showHistoryDrawer(task.id)} icon={<EllipsisOutlined/>} />
          

      
        <Button type="link" onClick={() => showEditModal(task.id)} icon={<EditOutlined/>  }></Button> */}
            </Col>
          
          </Row>
          <Row justify="space-between">
            <Col >
            
              <Text type="secondary">{task.deadline}</Text>
            </Col>
           
            <Col >
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item ><Button type="link" onClick={() => showEditModal(task.id)} icon={<EditOutlined/>  }></Button></Menu.Item>
                  <Menu.Item><Button type="link" onClick={()=>showHistoryDrawer(task.id)} icon={<HistoryOutlined />} /></Menu.Item>
                </Menu>
              }
              overlayStyle={{ zIndex: 9999 }}
            >
              <Button type="text" style={{ margin: 0 }}>...</Button>
            </Dropdown>
            
             
            </Col>
          </Row>
          
        

        </Container>
      )}
    </Draggable>
  
    

  );
};

export default Task;
