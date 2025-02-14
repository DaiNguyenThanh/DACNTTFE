import React, { useState, useCallback, useEffect, useContext } from "react";
import { useParams } from 'react-router-dom';
import { Badge, Col, Row, Typography, Dropdown, Menu, Button, Popconfirm, Form, Modal, Input, Select, DatePicker, Upload, Avatar } from 'antd';
import styled from "@emotion/styled";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import moment from "moment";
import './Board.css'
import Column from "./Column";
import { GetWorkspaceDetailAPI } from "../../api/workspaceApi";
import { GetAllTasks, UpdateTask, PatchTask, GetTask } from "../../api/TaskApi";
import { useWorkspace } from "../../contexts/WorkspaceProvider";
import { useForm } from "antd/es/form/Form";
import { UpdatePosition } from "../../api/TaskApi";
import { UpdateTaskStage } from "../../api/TaskApi";
import { CreateFile } from "../../api/fileAPI";
import { PlusOutlined, UploadOutlined, EditOutlined, SendOutlined,PaperClipOutlined } from '@ant-design/icons';
import useUsers from '../../contexts/UserContext';
import { useAuth } from "../../contexts/AuthContext";

const Container = styled("div")`
  display: flex;
  background-color: ${(props) => (props.isDraggingOver ? "#639ee2" : "#f4f5f7")};
  padding: 8px;
  gap: 8px;
  max-height: 85vh;
  min-width:300px
`;

const App = ({ filters, showHistoryDrawer }) => {
  const [starter, setStarter] = useState({ tasks: {}, columns: {}, columnOrder: [] });
  const [isLoading, setIsLoading] = useState(false);
  const { addTaskForm } = useForm();
  const { noMember, assignedToMe, noDates, overdue, dueNextDay, low, medium, high } = filters;
  const { workspaceId } = useParams();
  const [IsEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedTask, setSelectedTask] = useState(null)
  const { users } = useUsers();
  const [fileList, setFileList] = useState([]);
  let isRemovingFile = false; // Biến cờ để theo dõi việc xóa file
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileName, setFileName] = useState("");


  const [comments, setComments] = useState([
    {
      id: 1,
      user: { name: "Alice", avatar: "https://i.pravatar.cc/40?img=1" },
      text: "This is a comment with an image.",
      created_at: moment().subtract(5, "minutes").toISOString(),
      fileUrl: "https://via.placeholder.com/100", // Hình ảnh
    },
    {
      id: 2,
      user: { name: "Bob", avatar: "https://i.pravatar.cc/40?img=2" },
      text: "Here's a document you might find useful.",
      created_at: moment().subtract(10, "minutes").toISOString(),
      fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", // File PDF
    },
    {
      id: 3,
      user: { name: "Charlie", avatar: "https://i.pravatar.cc/40?img=3" },
      text: "No attachments here, just a message.",
      created_at: moment().subtract(15, "minutes").toISOString(),
    },
    {
      id: 4,
      user: { name: "David", avatar: "https://i.pravatar.cc/40?img=4" },
      text: "Check out this cool GIF!",
      created_at: moment().subtract(20, "minutes").toISOString(),
      fileUrl: "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif", // GIF
    },
  ]);
  const currentUser = useAuth()

  useEffect(() => {
    const fetchWorkspaceDetails = async () => {
      if (!workspaceId) return;
      setIsLoading(true);

      try {
        const response = await GetWorkspaceDetailAPI(workspaceId);
        const stages = response.data.stages || [];
        const deadline_from = moment().format("DD/MM/YYYY")
        const deadline_to = moment().format("DD/MM/YYYY")
        let priotiry = "low"
        const status = false
        const assignee_ids = []
        const collaborator_ids = []
        // if (noDates) {
        //   deadline_from = undefined;
        //   deadline_to = undefined;
        // } else if (dueNextDay) {
        //   deadline_from = new Date();
        //   deadline_to.setDate(deadline_to.getDate() + 1); // Cộng thêm 1 ngày
        // }
        if (low) {
          priotiry = "low"
        }
        if (medium) {
          priotiry = "medium"
        }
        if (high) {
          priotiry = "high"
        }
        // Thêm logic để query API với deadline
        const allTasks = await Promise.all(
          stages.map((stage) =>
            GetAllTasks(stage.id, assignee_ids, collaborator_ids, deadline_from, deadline_to, priotiry, status).catch(() => [])
          ) // Trả về mảng rỗng nếu API lỗi
        );


        // Chuyển đổi dữ liệu API sang định dạng starter
        const tasks = {};
        const columns = {};
        const columnOrder = [];
        stages.forEach((stage, index) => {
          const stageTasks = allTasks[index].data;
          // Gắn tasks vào object tasks
          stageTasks.forEach((task) => {
            tasks[task.id] = { id: task.id, title: task.title, deadline: task.deadline, priority: task.priority, description: task.description, assignee_ids: task.assignee_ids, collaborator_ids: task.collaborator_ids };
          });

          // Gắn cột vào object columns
          columns[stage.id] = {
            id: stage.id,
            title: stage.name,
            taskIds: stageTasks.map((task) => task.id), // Lưu trữ taskIds cho từng column
          };
          // Lưu thứ tự cột
          columnOrder.push(stage.id);
        });

        setStarter({ tasks, columns, columnOrder });
      } catch (error) {
        console.error("Error fetching workspace details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspaceDetails();
  }, [workspaceId, noDates, dueNextDay, low, medium, high]);

  useEffect(() => {
    console.log("Danh sách người dùng đã thay đổi:", users);
    // Bạn có thể thực hiện các hành động khác ở đây nếu cần
  }, [users]);

  const onDragEnd = useCallback(async ({ destination, source, draggableId, type }) => {
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "column") {
      // Kéo thả cột
      const newOrder = Array.from(starter.columnOrder);
      newOrder.splice(source.index, 1);
      newOrder.splice(destination.index, 0, draggableId);

      setStarter((prev) => ({
        ...prev,
        columnOrder: newOrder,
      }));
      return;
    }

    const start = starter.columns[source.droppableId];
    const end = starter.columns[destination.droppableId];

    if (start === end) {
      // Kéo thả task trong cùng cột
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...start,
        taskIds: newTaskIds,
      };

      setStarter((prev) => ({
        ...prev,
        columns: {
          ...prev.columns,
          [newColumn.id]: newColumn,
        },
      }));

      // Gửi API cập nhật vị trí
      const newPosition = destination.index; // Vị trí mới
      let position;
      let preTaskId
      if (newPosition === 0) {
        position = 'top'; // Nếu là task đầu tiên
      } else if (newPosition === newTaskIds.length - 1) {
        position = 'bottom'; // Nếu là task cuối cùng
      } else {
        position = 'middle'; // Nếu ở giữa
        preTaskId = newTaskIds[destination.index - 1] || null;
      }

      await UpdatePosition(draggableId, position, preTaskId); // Gọi API với position
      return;
    } else {
      // Kéo thả task giữa các cột
      const startTaskIds = Array.from(start.taskIds);
      const endTaskIds = Array.from(end.taskIds);

      startTaskIds.splice(source.index, 1);
      endTaskIds.splice(destination.index, 0, draggableId);

      const newStartColumn = {
        ...start,
        taskIds: startTaskIds,
      };

      const newEndColumn = {
        ...end,
        taskIds: endTaskIds,
      };

      setStarter((prev) => ({
        ...prev,
        columns: {
          ...prev.columns,
          [newStartColumn.id]: newStartColumn,
          [newEndColumn.id]: newEndColumn,
        },
      }));

      // Gửi API cập nhật vị trí và stage
      const newPosition = destination.index; // Vị trí mới
      let position;
      let preTaskId;
      if (newPosition === 0) {
        position = 'top'; // Nếu là task đầu tiên
      } else if (newPosition === endTaskIds.length - 1) {
        position = 'bottom'; // Nếu là task cuối cùng
      } else {
        position = 'middle'; // Nếu ở giữa
        preTaskId = endTaskIds[destination.index - 1] || null; // ID của task trước đó
      }

      const stageId = end.id; // ID của stage mới

      await UpdateTaskStage(draggableId, position, preTaskId, stageId); // Gọi API với position và stage_id
    }
  }, [starter]);

  const updateColumns = () => {
    // Cập nhật lại state columns
    setStarter((prev) => ({
      ...prev,
      columns: {
        ...prev.columns,
      },
    }));
  };
  const handleDelete = async () => {
    try {

    } catch (error) {
      console.error("Lỗi khi xóa stage:", error);
    }
  };
  const handleCancel = () => {
    setIsEditModalVisible(false);
  };
  const handleFieldChange = async (changedFields) => {
    const updatedData = {
      id: selectedTask.id, // ID của task đang được chỉnh sửa
      ...changedFields, // Chỉ gửi các trường đã thay đổi
    };

    // Chuyển đổi deadline sang định dạng moment nếu có
    if (updatedData.deadline) {
      updatedData.deadline = moment(updatedData.deadline).format('YYYY-MM-DD HH:mm:ss');
    }

    try {
      await PatchTask(updatedData); // Gọi hàm PatchTask với dữ liệu đã cập nhật

      // Cập nhật state starter sau khi patch thành công
      setStarter((prev) => ({
        ...prev,
        tasks: {
          ...prev.tasks,
          [selectedTask.id]: {
            ...prev.tasks[selectedTask.id],
            ...changedFields, // Cập nhật các trường đã thay đổi
          },
        },
      }));
    } catch (error) {
      console.error("Lỗi khi cập nhật task:", error);
    }
  };
  const showEditModal = async (taskId) => {
    // Gọi API để lấy task dựa trên id
    const response = await GetTask(taskId); // Thay đổi ở đây
    setSelectedTask(response.data);
    setIsEditModalVisible(true);
    if (response.data?.files?.length > 0) {
      setFileList(response.data.files)
    }
    else {
      setFileList([])
    }
    console.log(fileList);
    // Reset các trường trong form
    form.resetFields();

    // Thiết lập giá trị mặc định cho form
    form.setFieldsValue({
      title: response.data.title,
      description: response.data.description || '', // Nếu có trường mô tả
      assignee_ids: response.data.assignee_ids || [], // Nếu có trường assignee_ids
      collaborator_ids: response.data.collaborator_ids || [], // Nếu có trường collaborator_ids
      deadline: moment(response.data.deadline), // Chuyển đổi deadline sang định dạng moment
      priority: response.data.priority,
      attachment: response.data.files
    });
  };
  const handleUploadChange = async (info) => {
    // Kiểm tra xem có phải là sự kiện xóa file không

    if (isRemovingFile) {
      isRemovingFile = false; // Reset biến cờ
      return; // Ngăn chặn việc xử lý khi xóa file
    }

    const { file } = info;

    // Kiểm tra nếu file đã được tải lên thành công

    const response = await CreateFile({ file: file, from: "task" });
    if (response.message === "Success") {
      const fileId = response.data.id;

      // Cập nhật fileList với file mới
      setFileList(prevFileList => {
        // Đảm bảo prevFileList là một mảng
        const currentFileList = Array.isArray(prevFileList) ? prevFileList : [];
        const updatedFileList = [
          ...currentFileList,
          { id: fileId, url: response.data?.path } // Thêm file mới vào fileList
        ];

        // Gọi API để cập nhật task với file mới
        PatchTask({ id: selectedTask.id, file_ids: updatedFileList.map(file => file.id) }); // Gọi API ở đây

        return updatedFileList; // Trả về fileList đã cập nhật
      });
    }
  };
  const handleRemoveFile = async (file) => {
    isRemovingFile = true; // Đánh dấu là đang xóa file
    const updatedFileList = fileList.filter(item => item.id !== file.id); // Lọc file đã xóa
    setFileList(updatedFileList); // Cập nhật lại fileList

    // Nếu cần gọi API để xóa file, thực hiện ở đây
    try {

      await PatchTask({ id: selectedTask?.id, file_ids: updatedFileList?.map(item => item.id) }); // Cập nhật lại task với danh sách file mới
    } catch (error) {
      console.error("Lỗi khi xóa file:", error);
    }
  };
  const showCommentModal = async (taskId) => {
    // Fetch comments for the task
    // const response = await GetTaskComments(taskId); // Assume you have an API to get comments
    //setComments(response.data);
    setIsCommentModalVisible(true);
  };

  const handleCommentSubmit = (values) => {
    // const newComment = {
    //   id: comments.length + 1,
    //   user: { name: "You", avatar: "https://i.pravatar.cc/40?img=5" },
    //   text: values.comment,
    //   created_at: new Date().toISOString(),
    //   fileUrl: file ? (filePreview ? filePreview : file.name) : null,
    //   fileName: file ? file.name : null,
    // };
    // setComments([...comments, newComment]);

    // Reset file
    setFile(null);
    setFilePreview(null);
    setFileName("");
  };
  const handleFileChange = (info) => {
    const selectedFile = info.fileList[0]?.originFileObj;
  console.log(selectedFile)
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
  
      // Kiểm tra nếu là ảnh thì tạo URL preview
      if (selectedFile.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(selectedFile));
      } else {
        setFilePreview(null);
      }
    }
  };
  
  return isLoading ? (
    <div>Loading...</div>
  ) : (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-column" type="column" direction="horizontal">
          {(provided, snapshot) => (
            <Container
              ref={provided.innerRef}
              {...provided.droppableProps}
              isDraggingOver={snapshot.isDraggingOver}
            >
              {starter.columnOrder.map((columnId, index) => {
                const column = starter.columns[columnId];
                const tasks = column.taskIds.map((taskId) => starter.tasks[taskId]);

                return (
                  <Column
                    key={column.id}
                    index={index}
                    column={column}
                    tasks={tasks}
                    form={addTaskForm}
                    starter={starter}
                    updateColumns={updateColumns}
                    showEditModal={showEditModal}
                    showHistoryDrawer={showHistoryDrawer}
                    setStarter={setStarter}
                    showCommentModal={showCommentModal}
                  />
                );
              })}
              {provided.placeholder}
            </Container>
          )}
        </Droppable>
      </DragDropContext>
      <Modal title="Edit New Task" open={IsEditModalVisible} onCancel={handleCancel} footer={null}>
        <Form form={form} layout="vertical">
          <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Please input the task title!' }]}>
            <Input onBlur={(e) => handleFieldChange({ title: e.target.value })} />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea onBlur={(e) => handleFieldChange({ description: e.target.value })} />
          </Form.Item>
          <Form.Item label="Assigners" name="assignee_ids">
            <Select
              placeholder="Select assigners"
              mode="multiple"
              onChange={(value) => handleFieldChange({ assignee_ids: value })}
              value={selectedTask?.assignee_ids || []}
            >
              {users.length > 0 ? users.map(user => (
                <Select.Option key={user.id} value={user.id}>{user.name}</Select.Option>
              )) : <Select.Option disabled>No users available</Select.Option>}
            </Select>
          </Form.Item>
          <Form.Item label="Collaborators" name="collaborator_ids">
            <Select
              placeholder="Select collaborators"
              mode="multiple"
              onChange={(value) => handleFieldChange({ collaborator_ids: value })}
              value={selectedTask?.collaborator_ids || []}
            >
              {users.length > 0 ? users.map(user => (
                <Select.Option key={user.id} value={user.id}>{user.name}</Select.Option>
              )) : <Select.Option disabled>No users available</Select.Option>}
            </Select>
          </Form.Item>
          <Form.Item label="Deadline" name="deadline">
            <DatePicker showTime onChange={(date) => handleFieldChange({ deadline: date ? date.format('YYYY-MM-DD HH:mm:ss') : null })} />
          </Form.Item>
          <Form.Item label="Priority" name="priority">
            <Select placeholder="Select priority" onChange={(value) => handleFieldChange({ priority: value })}>
              <Select.Option value="high">High</Select.Option>
              <Select.Option value="medium">Medium</Select.Option>
              <Select.Option value="low">Low</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="attachment" label="Upload Attachment">
            <Upload
              onChange={handleUploadChange}
              fileList={fileList?.map(file => ({
                uid: file.id,
                name: file.id,
                status: 'done',
                url: file.url,
                onRemove: (file) => {
                  handleRemoveFile(file); // Gọi hàm xóa file
                  return false; // Trả về false để ngăn chặn onChange
                },
              }))}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
      title="Comments"
      open={isCommentModalVisible}
      onCancel={() => setIsCommentModalVisible(false)}
      footer={null}
    >
      <div style={{ maxHeight: "500px", overflowY: "auto", marginBottom: "16px" }}>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 0",
                borderBottom: "1px solid #ddd",
              }}
            >
              <Avatar src={comment.user.avatar} size="small" />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0 }}>
                  <strong>{comment.user.name}:</strong> {comment.text}
                </p>
                {comment.fileUrl && (
                  <div style={{ marginTop: "5px" }}>
                    {comment.fileUrl.endsWith(".pdf") ||
                    comment.fileUrl.endsWith(".docx") ? (
                      <a href={comment.fileUrl} target="_blank" rel="noopener noreferrer">
                        📄 {comment.fileName}
                      </a>
                    ) : (
                      <img
                        src={comment.fileUrl}
                        alt="Attachment"
                        style={{ maxWidth: "100px", display: "block", marginTop: "5px" }}
                      />
                    )}
                  </div>
                )}
              </div>
              <small style={{ whiteSpace: "nowrap", color: "#888" }}>
                {moment(comment.created_at).fromNow()}
              </small>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", color: "#888" }}>No comments yet.</p>
        )}
      </div>

      <Form onFinish={handleCommentSubmit}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Avatar src="https://i.pravatar.cc/40?img=5" size="small" />
          <Form.Item
            name="comment"
            style={{ flex: 1, marginBottom: 0 }}
            rules={[{ required: true, message: "Please input your comment!" }]}
          >
            <Input.TextArea rows={1} placeholder="Add a comment" autoSize={{ minRows: 1, maxRows: 3 }} />
          </Form.Item>
          <Upload showUploadList={false} beforeUpload={() => false} onChange={handleFileChange}>
            <Button icon={<PaperClipOutlined />} />
          </Upload>
          <Button type="primary" htmlType="submit" icon={<SendOutlined />} />
        </div>
        
        {/* Hiển thị tên file hoặc hình preview */}
        {fileName && (
          <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
            {filePreview ? (
              <img
                src={filePreview}
                alt="Preview"
                style={{ maxWidth: "300px", maxHeight: "200px", borderRadius: "4px" ,margin:24}}
              />
            ) : (
              <span>📄 {fileName}</span>
            )}
          </div>
        )}
      </Form>
    </Modal>
    </>

  );
};

export default App;
