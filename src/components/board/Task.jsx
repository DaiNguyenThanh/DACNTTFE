import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { Draggable } from "react-beautiful-dnd";
import { Badge, Col, Row, Typography, Dropdown, Menu, Button, Popconfirm, Form, Modal, Input, Select, DatePicker, Upload } from 'antd';
import { PlusOutlined, UploadOutlined, EditOutlined, EllipsisOutlined, HistoryOutlined, DeleteOutlined,CommentOutlined  } from '@ant-design/icons';
import moment from "moment";
import { CreateTask, DeleteTasks } from '../../api/TaskApi';
import { useAuth } from "../../contexts/AuthContext";
import { role } from "../../utils";
const { Text } = Typography
const Container = styled("div")`
  border: 1px solid lightgrey;
  margin-bottom: 8px;
  border-radius: 2px;
  padding: 8px;
  background: ${props => (props.isDragging ? "lightgreen" : "white")};
`;

const Task = ({ task, index, showEditModal, showHistoryDrawer,setStarter,showCommentModal }) => {
  const user = JSON.parse(localStorage.getItem('user')); // Lấy thông tin người dùng từ localStorage
  // Lấy thông tin người dùng từ localStorage

  const userRole = user ? user.role : null;

  const handleDeleteTask = async (taskId) => {
    try {
      await DeleteTasks([taskId]); // Gọi API xóa task
      // Cập nhật state để xóa task khỏi UI
      setStarter((prev) => {
        const newTasks = { ...prev.tasks };
        delete newTasks[taskId]; // Xóa task khỏi danh sách
        return {
          ...prev,
          tasks: newTasks,
        };
      });
    } catch (error) {
      console.error("Lỗi khi xóa task:", error);
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
                    <Menu.Item>
                      {(userRole === role.RoleAdmin || userRole === role.RoleSubjectManager) && (
                        <Button type="link" onClick={() => showEditModal(task.id)} icon={<EditOutlined />} />
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      <Button 
                        type="link" 
                        onClick={() => showCommentModal(task.id)} 
                        icon={<CommentOutlined  style={{ color: 'violet' }} />}
                      />
                    </Menu.Item>
                    <Menu.Item>
                      <Button 
                        type="link" 
                        onClick={() => showHistoryDrawer(task.id)} 
                        icon={<HistoryOutlined style={{ color: 'green' }} />}
                      />
                    </Menu.Item>
                    
                    <Menu.Item>
                    {(userRole === role.RoleAdmin || userRole === role.RoleSubjectManager) && (
                        <Popconfirm
                        title="Are you sure to delete this task?"
                        onConfirm={() => handleDeleteTask(task.id)}
                      >
                        <Button type="link" danger icon={<DeleteOutlined />}></Button>
                      </Popconfirm>
                      )}
                     
                    </Menu.Item>
                  
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
