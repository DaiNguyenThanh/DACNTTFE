import React, { useState, useContext, useEffect } from "react";
import { useParams } from 'react-router-dom';
import styled from "@emotion/styled";
import Task from "./Task";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { Dropdown, Menu, Popconfirm, Button, Col, Row, Modal, Form, Input, Select, DatePicker, Upload } from "antd";
import moment from "moment";
import { PlusOutlined, UploadOutlined, EditOutlined } from '@ant-design/icons';

import { getListUserAPI } from "../../api/authApi";
import { UserContext } from "../../contexts/UserContext";
import useUsers from '../../contexts/UserContext';
import { CreateTask } from '../../api/TaskApi';
import { CreateFile } from "../../api/fileAPI";
import { useWorkspace } from "../../contexts/WorkspaceProvider";
import { DeleteStages, UpdateStage } from '../../api/StageApi';

import { role } from "../../utils";
const Container = styled("div")`
  margin: 8px;
  border-radius: 2px;
  border: 1px solid lightgrey;
  display: flex;
  flex-direction: column;
  width: 300px;
  background: white;
`;
const Title = styled("h3")`
  padding: 8px;
`;

const TaskList = styled("div")`
  padding: 8px;
  flex-grow: 1;
  min-height: 30px;
  //height: ${({ tasks }) => (tasks.length > 0 ? `${tasks.length * 100}px` : '0px')};
  transition: background-color ease 0.2s;
  background-color: ${props =>
    props.isDraggingOver ? "palevioletred" : "white"};
`;
const Column = ({ tasks, column, index, starter, updateColumns, showEditModal, showHistoryDrawer, setStarter, showCommentModal, users }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  //const [users, setUsers] = useState([]);
  const [form] = Form.useForm();
  const { selectedWorkspace } = useWorkspace()
  const [isEditModalVisible, setIsEditModalStageVisible] = useState(false);
  const [stageName, setStageName] = useState(column.title);
  const { workspaceId } = useParams();
  const user = JSON.parse(localStorage.getItem('user')); // Lấy thông tin người dùng từ localStorage
  // Lấy thông tin người dùng từ localStorage

  const userRole = user ? user.role : null;


  const showModal = () => {
    form.resetFields()
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {

      let attachmentId = null;
      const values = await form.validateFields();
      const formattedDeadline = values.deadline.format('YYYY-MM-DD HH:mm:ss');
      const attachmentIds = []; // Mảng để lưu trữ các ID file đã tạo
      if (values.attachment && values.attachment.fileList.length > 0) {

        for (const file of values.attachment.fileList) {
          const attachmentResponse = await CreateFile({ file: file.originFileObj, from: 'request' }); // Sử dụng file.originFileObj
          if (attachmentResponse.message === "Success") {
            attachmentIds.push(attachmentResponse.data.id); // Thêm ID file vào mảng
          }
        }
        attachmentId = attachmentIds; // Gán mảng ID file cho attachmentId
      }
      console.log(values.deadline)
      const response = await CreateTask({
        assignee_ids: values.assigners,
        collaborator_ids: values.collaborators,
        deadline: formattedDeadline,
        description: values.description,
        priority: values.priority,
        title: values.title,
        stage_id: column.id,
        status: false,
        workspace_id: workspaceId,
        file_ids: attachmentIds.length > 0 ? attachmentIds : undefined
      });

      // Cập nhật state starter với task mới
      setStarter((prev) => ({
        ...prev,
        tasks: {
          ...prev.tasks,
          [response.data.id]: response.data, // Thêm task mới vào tasks
        },
        columns: {
          ...prev.columns,
          [column.id]: {
            ...prev.columns[column.id],
            taskIds: [...prev.columns[column.id].taskIds, response.data.id], // Thêm ID của task mới vào danh sách taskIds của cột
          },
        },
      }));

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Lỗi khi tạo task:", error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleDelete = async () => {
    try {
      await DeleteStages([column.id]);
      starter.removeColumn(column.id);
      if (starter.updateColumns) {
        starter.updateColumns();
      }
    } catch (error) {
      console.error("Lỗi khi xóa stage:", error);
    }
  };

  const showEditModalStage = () => {
    console.log(starter)

    setIsEditModalStageVisible(true);
    setStageName(column.title);
  };

  const handleEditOk = async () => {
    try {
      await UpdateStage({ id: column.id, name: stageName });

      // Cập nhật lại state starter với tên mới
      setStarter((prev) => ({
        ...prev,
        columns: {
          ...prev.columns,
          [column.id]: {
            ...prev.columns[column.id],
            title: stageName, // Cập nhật tên cột với tên mới
          },
        },
      }));

      setIsEditModalStageVisible(false);
      await updateColumns();
    } catch (error) {
      console.error("Lỗi khi cập nhật stage:", error);
    }
  };

  const handleEditCancel = () => {
    setIsEditModalStageVisible(false);
  };

  const handleUploadChange = (info) => {
    console.log(info.fileList);
  };

  return (
    <Draggable draggableId={column.id} index={index} type="column">
      {(provided) => (
        <Container
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            minHeight: 200, // Chiều cao tối thiểu
            height: `calc(210px + ${tasks.length * 80}px)`, // Tăng chiều cao dựa trên số lượng tasks
            maxHeight: 900, // Giới hạn chiều cao tối đa
            overflowY: "auto", // Hiển thị thanh cuộn khi quá dài
          }}
        >
          <Row justify="space-between">
            <Col>
              <Title>{column.title} </Title>
            </Col>
            <Col>
              {(userRole === role.RoleAdmin || userRole === role.RoleSubManager) && (
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item onClick={showEditModalStage}>Edit</Menu.Item>
                      <Popconfirm title="Are you sure to delete?" onConfirm={handleDelete}>
                        <Button type="link">Delete</Button>
                      </Popconfirm>
                    </Menu>
                  }
                  overlayStyle={{ zIndex: 9999 }}
                >
                  <Button type="text" style={{ margin: 12 }}>...</Button>
                </Dropdown>
              )}
            </Col>
          </Row>

          <Droppable droppableId={column.id} type="task">
            {(provided, snapshot) => (
              <TaskList
                tasks={tasks}
                isDraggingOver={snapshot.isDraggingOver}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {Array.isArray(tasks) && tasks.length > 0 ? (
                  tasks.map((task, index) => (
                    task && task.id ? (
                      <Task key={task.id} task={task} index={index} showEditModal={showEditModal} showHistoryDrawer={showHistoryDrawer} setStarter={setStarter} showCommentModal={showCommentModal}  />
                    ) : null
                  ))
                ) : (
                  <div style={{ textAlign: "center", marginTop: "20px", color: "gray" }}>No tasks available</div>
                )}
                {provided.placeholder}
              </TaskList>
            )}
          </Droppable>
          {(userRole === role.RoleAdmin || userRole === role.RoleSubjectManager) && (
            <Button type="primary" style={{ margin: '8px' }} onClick={showModal}>
              <PlusOutlined />
              Add New Task
            </Button>
          )}


          <Modal title="Create New Task" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
            <Form form={form} layout="vertical">
              <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Please input the task title!' }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Description" name="description">
                <Input.TextArea />
              </Form.Item>
              <Form.Item label="Assigners" name="assigners">
                <Select placeholder="Select assigners" mode="multiple">
                  {users?.length > 0 ? users?.map(user => (
                    <Select.Option key={user.id} value={user.id}>{user.name}</Select.Option>
                  )) : <Select.Option disabled>No users available</Select.Option>}
                </Select>
              </Form.Item>
              <Form.Item label="Collaborators" name="collaborators">
                <Select placeholder="Select collaborators" mode="multiple">
                  {users?.length > 0 ? users?.map(user => (
                    <Select.Option key={user.id} value={user.id}>{user.name}</Select.Option>
                  )) : <Select.Option disabled>No users available</Select.Option>}
                </Select>
              </Form.Item>
              <Form.Item label="Deadline" name="deadline">
                <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
              </Form.Item>
              <Form.Item label="Priority" name="priority">
                <Select placeholder="Select priority">
                  <Select.Option value="high">High</Select.Option>
                  <Select.Option value="medium">Medium</Select.Option>
                  <Select.Option value="low">Low</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="attachment" label="Upload Attachment">
                <Upload
                  beforeUpload={() => false}

                >
                  <Button icon={<UploadOutlined />}>Click to Upload</Button>
                </Upload>
              </Form.Item>
            </Form>
          </Modal>

          <Modal title="Edit Stage" visible={isEditModalVisible} onOk={handleEditOk} onCancel={handleEditCancel}>
            <Form layout="vertical">
              <Form.Item label="Stage Name" required>
                <Input value={stageName} onChange={(e) => setStageName(e.target.value)} />
              </Form.Item>
            </Form>
          </Modal>
        </Container>
      )}
    </Draggable>
  );
};

export default Column;
