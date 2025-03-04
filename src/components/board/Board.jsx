import React, { useState, useCallback, useEffect, useContext } from "react";
import { useParams ,useNavigate} from 'react-router-dom';
import { Badge, Col, Row, Typography, Dropdown, Menu, Button, Popconfirm, Form, Modal, Input, Select, DatePicker, Upload, Avatar, Mentions } from 'antd';
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
import { getListUserAPI } from "../../api/authApi";
import { CreateFile } from "../../api/fileAPI";
import { CreateComment, GetComment, GetAllComments } from "../../api/commentAPI";
import { PlusOutlined, UploadOutlined, EditOutlined, SendOutlined, PaperClipOutlined, UserOutlined } from '@ant-design/icons';
import useUsers from '../../contexts/UserContext';
import { useAuth } from "../../contexts/AuthContext";
import { path, role } from "../../utils";
const { Option } = Mentions;
const Container = styled("div")`
  display: flex;
  background-color: ${(props) => (props.isDraggingOver ? "#639ee2" : "#f4f5f7")};
  padding: 8px;
  gap: 8px;
  max-height: 85vh;
  min-width:300px
`;

const App = ({ filters, showHistoryDrawer, taskID }) => {
  const {navigate}=useNavigate()
  const [starter, setStarter] = useState({ tasks: {}, columns: {}, columnOrder: [] });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth()
  const [addTaskForm] = useForm();
  const [commentForm] = useForm()
  const { noMember, assignedToMe, noDates, overdue, dueNextDay, dueNextWeek, dueNextMonth, low, medium, high, markComplete, markNotComplete,keyword } = filters;
  const { workspaceId } = useParams();
  const [IsEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedTask, setSelectedTask] = useState(null)
  const [users, setUsers] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [submitfileList, setSubmitFileList] = useState([]);
  let isRemovingFile = false; // Biến cờ để theo dõi việc xóa file
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [file, setFile] = useState(null);
  const [filePreviews, setFilePreviews] = useState(null);
  const [fileNames, setFileNames] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([])
  const [mentionedUsers, setMentionedUsers] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentTextToSend, setCommentTextToSend] = useState("");
  const [taskId, setTaskId] = useState(null)
  const [comments, setComments] = useState([
  ]);
  const currentUser = useAuth()
  const userRole = JSON.parse(localStorage.getItem('user'))?.role;
  useEffect(() => {
    const fetchUsers = async () => {
      try {

        const response = await getListUserAPI(workspaceId);
        setUsers(response.data.data);
        console.log(users)
      } catch (error) {
        console.error("Lỗi khi lấy danh sách người dùng:", error);
      }
    };

    fetchUsers();
  }, []);
  useEffect(() => {
    const fetchTask = async () => {
      try {


        const response = await GetTask(taskID); // Thay đổi ở đây
        setSelectedTask(response.data);
        setIsEditModalVisible(true);
        if (response.data?.files?.length > 0) {
          setFileList(response.data.files)
        }
        else {
          setFileList([])
        }
        if (response.data?.submit_files?.length > 0) {
          setSubmitFileList(response.data.submit_files)
        }
        else {
          setSubmitFileList([])
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
      }
      catch (e) {
        navigate(path.HOME

        )
      }
    }
    if (taskID)
      fetchTask()
  }, [taskID])
  useEffect(() => {
    const fetchWorkspaceDetails = async () => {
      if (!workspaceId) return;
      setIsLoading(true);

      try {
        const response = await GetWorkspaceDetailAPI(workspaceId);
        //setUsers(response.data.users)
        const stages = response.data.stages || [];
        let deadline_from = moment();
        let deadline_to = moment();
        let priotiry = "";
        const status = "";
        const assignee_ids = [];
        const collaborator_ids = [];
        if (noMember) {
          assignee_ids = undefined
        }
        if (assignedToMe) {
          assignee_ids.push(user?.id)
        }

        if (noDates) {
          deadline_from = undefined;
          deadline_to = undefined;
        }
        if (overdue) {
          deadline_from = undefined;
          deadline_to = moment().subtract(1, 'days'); // Lùi lại 1 ngày
        }

        if (dueNextDay) {
          deadline_from = moment();
          deadline_to = moment().add(1, 'days'); // Cộng thêm 1 ngày
        }

        if (dueNextWeek) {
          deadline_from = moment();
          deadline_to = moment().add(1, 'weeks'); // Cộng thêm 7 ngày
        }

        if (dueNextMonth) {
          deadline_from = moment();
          deadline_to = moment().add(1, 'months'); // Cộng thêm 30 ngày
        }

        // Format lại ngày nếu cần
        if (deadline_from) {
          deadline_from = deadline_from.format("DD/MM/YYYY");
        }
        if (deadline_to) {
          deadline_to = deadline_to.format("DD/MM/YYYY");
        }
        if (low) {
          priotiry = "low"
        }
        if (medium) {
          priotiry = "medium"
        }
        if (high) {
          priotiry = "high"
        }
        if (markComplete) {
          status = true
        }
        if (markNotComplete) {
          status = false
        }
        
        // Thêm logic để query API với deadline
        const allTasks = await Promise.all(
          stages.map((stage) =>
            GetAllTasks(stage.id, assignee_ids, collaborator_ids, deadline_from, deadline_to, priotiry, status,keyword).catch(() => [])
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
            tasks[task.id] = { id: task.id, title: task.title, deadline: task.deadline, priority: task.priority, description: task.description, assignee_ids: task.assignee_ids, collaborator_ids: task.collaborator_ids,status:task.status };
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
  }, [workspaceId, noDates, dueNextDay, low, medium, high, markComplete, dueNextWeek, dueNextMonth, markNotComplete, noMember, assignedToMe, overdue,keyword]);

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
    window.history.pushState({}, "", `/workspace/` + workspaceId);
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
    window.history.pushState({}, "", `/workspace/` + workspaceId + "/task/" + taskId);
    setIsEditModalVisible(true);
    if (response.data?.files?.length > 0) {
      setFileList(response.data.files)
    }
    else {
      setFileList([])
    }
    if (response.data?.submit_files?.length > 0) {
      setSubmitFileList(response.data.submit_files)
    }
    else {
      setSubmitFileList([])
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
  
  const handleUploadSubmitFile = async (info) => {
    // Kiểm tra xem có phải là sự kiện xóa file không



    const { file } = info;

    // Kiểm tra nếu file đã được tải lên thành công

    const response = await CreateFile({ file: file, from: "submit_file" });
    if (response.message === "Success") {
      const fileId = response.data.id;

      // Cập nhật fileList với file mới
      setSubmitFileList(prevFileList => {
        // Đảm bảo prevFileList là một mảng
        const currentFileList = Array.isArray(prevFileList) ? prevFileList : [];
        const updatedFileList = [
          ...currentFileList,
          { id: fileId, url: response.data?.path } // Thêm file mới vào fileList
        ];

        // Gọi API để cập nhật task với file mới
        PatchTask({ id: selectedTask.id, submit_file_ids: updatedFileList.map(file => file.id) }); // Gọi API ở đây

        return updatedFileList; // Trả về fileList đã cập nhật
      });
    }
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
    setTaskId(taskId);
    setFileList([]);
 
    setFilePreviews(null);
    setFileNames([]);
    setCommentText("")
    setIsCommentModalVisible(true);
    try {
      const response = await GetAllComments(taskId, "task"); // Assume you have an API to get comments
      setComments(response.data);

    }
    catch (e) {
      console.log("Get comment failed: ", e)
    }
  };

  const handleCommentSubmit = async (values) => {
    setCommentText("");
    commentForm.resetFields()
    try {

      const uploadedFiles = [];


      for (const file of fileList) {
        const response = await CreateFile({ file: file, from: "comment" }); // Chờ từng file upload xong
        uploadedFiles.push(response.data); // Lưu kết quả response
      }
      const response = await CreateComment({ content: commentText, file_ids: uploadedFiles.map(f => f.id), mention_ids: mentionedUsers.map(user => user.key), object_id: taskId, source: "task" })
      if (response && response.data) {
        setComments(prevComments => [response.data, ...prevComments]); // Thêm comment mới vào danh sách
      }

    }
    catch (e) {

    }
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
    setFilePreviews(null);
    setFileNames([]);
  };
  const handleFileChange = (info) => {
    const newFiles = info.fileList.map(file => file.originFileObj); // Lấy tất cả các file

    if (newFiles.length > 0) {
      setFileList(newFiles); // Lưu danh sách file vào state
      setFileNames(newFiles.map(file => file.name)); // Lưu danh sách tên file

      // Tạo preview cho file ảnh
      const previews = newFiles.map(file =>
        file.type.startsWith("image/") ? URL.createObjectURL(file) : null
      );
      setFilePreviews(previews);
    }
  };
  const handleMentionSelect = (user) => {
    console.log(user)

    if (user && !mentionedUsers.some(u => u.key === user.key)) {
      setMentionedUsers([...mentionedUsers, user]);
      setCommentTextToSend((prev) => prev + ` <${user.key}>`);
      setCommentText(commentText + user.value)
    }

    console.log(mentionedUsers)
  };
  const handleCommentChange = (value) => {
    setCommentText(value);
    setCommentTextToSend(replaceNamesWithIds(value)); // Cập nhật text gửi đi
    console.log(commentTextToSend)
    console.log(commentText)

  };
  const replaceNamesWithIds = (text) => {
    let newText = text;
    if (Array.isArray(users)) {
      users.forEach((user) => {
        const regex = new RegExp(`@${user.name}\\b`, "g"); // Tìm đúng @TênUser
        newText = newText.replace(regex, `<${user.id}>`); // Thay thế bằng @<ID>
      });
    }

    return newText;
  };
  const highlightMentions = (text) => {
    return text.replace(/@([\wÀ-ỹ\d]+)/g, '<span style="color: blue;">@$1</span>');
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
                    users={users}

                  />
                );
              })}
              {provided.placeholder}
            </Container>
          )}
        </Droppable>
      </DragDropContext>
      <Modal title={userRole === role.RoleTeacher ? "Detail Task" : "Edit New Task"} open={IsEditModalVisible} onCancel={handleCancel} footer={null}>
        <Form form={form} layout="vertical">
          <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Please input the task title!' }]}>
            <Input
              onBlur={(e) => handleFieldChange({ title: e.target.value })}
              disabled={userRole === role.RoleTeacher}
            />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea disabled={userRole === role.RoleTeacher} onBlur={(e) => handleFieldChange({ description: e.target.value })} />
          </Form.Item>
          <Form.Item label="Assigners" name="assignee_ids">
            <Select
              disabled={userRole === role.RoleTeacher}
              placeholder="Select assigners"
              mode="multiple"
              onChange={(value) => handleFieldChange({ assignee_ids: value })}
              value={selectedTask?.assignees || []}
            >
              {users?.length > 0 ? users?.map(user => (
                <Select.Option key={user?.id} value={user?.id}>{user.name}</Select.Option>
              )) : <Select.Option disabled>No users available</Select.Option>}
            </Select>
          </Form.Item>
          <Form.Item label="Collaborators" name="collaborator_ids">
            <Select
              disabled={userRole === role.RoleTeacher}
              placeholder="Select collaborators"
              mode="multiple"
              onChange={(value) => handleFieldChange({ collaborator_ids: value })}
              value={selectedTask?.collaborators || []}
            >
              {users?.length > 0 ? users?.map(user => (
                <Select.Option key={user?.id} value={user?.id}>{user?.name}</Select.Option>
              )) : <Select.Option disabled>No users available</Select.Option>}
            </Select>
          </Form.Item>
          <Form.Item label="Deadline" name="deadline">
            <DatePicker disabled={userRole === role.RoleTeacher} showTime onChange={(date) => handleFieldChange({ deadline: date ? date.format('YYYY-MM-DD HH:mm:ss') : null })} />
          </Form.Item>
          <Form.Item label="Priority" name="priority">
            <Select disabled={userRole === role.RoleTeacher} placeholder="Select priority" onChange={(value) => handleFieldChange({ priority: value })}>
              <Select.Option value="high">High</Select.Option>
              <Select.Option value="medium">Medium</Select.Option>
              <Select.Option value="low">Low</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="attachment" label="Upload Attachment" >
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
              <Button disabled={userRole === role.RoleTeacher} icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="submit_file" label="Submit File" >
            <Upload
              disabled={true}
              //onChange={handleUploadSubmitFile}
              fileList={submitfileList?.map(file => ({
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
             {/* <Button icon={<UploadOutlined />}>Click to Upload</Button> */}
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
        <Form onFinish={handleCommentSubmit} form={commentForm}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Avatar src={user?.avatar} size="small" icon={!user?.avatar && <UserOutlined />} />
            <Form.Item
              name="comment"
              style={{ flex: 1, marginBottom: 0 }}
            //rules={[{ required: true, message: "Please input your comment!" }]}
            >
              <Mentions
                //dangerouslySetInnerHTML={{ __html: highlightMentions(commentText) }}
                rows={1}
                placeholder="Add a comment"
                autoSize={{ minRows: 1, maxRows: 3 }}
                value={commentText}
                onChange={handleCommentChange}
                onSelect={handleMentionSelect}
                style={{ width: "100%" }}
                className="custom-mentions"
              >
                {Array.isArray(users) && users.length > 0 ? (
                  users.map((user) => (
                    <Option key={user.id} value={user.name}>
                      <Avatar
                        size="small"
                        src={user.avatar || <UserOutlined />}
                        style={{ marginRight: 8 }}
                      />
                      {user.name}
                    </Option>
                  ))
                ) : (
                  <Option disabled>No Data</Option>
                )}

              </Mentions>
              {/* <p
                style={{ margin: 0 }}
                dangerouslySetInnerHTML={{ __html: highlightMentions(commentText) }}
              ></p> */}
            </Form.Item>
            <Upload showUploadList={false} beforeUpload={() => false} onChange={handleFileChange}>
              <Button icon={<PaperClipOutlined />} />
            </Upload>
            <Button type="primary" htmlType="submit" icon={<SendOutlined />} />
          </div>

          {/* Hiển thị tên file hoặc hình preview */}
          {fileNames.length > 0 && (
            <div
              style={{
                marginLeft: 16,
                marginTop: "8px",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "8px",
                maxHeight: 300
              }}
            >
              {fileNames.map((name, index) => (
                <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: 'wrap' }}>
                  {filePreviews[index] ? (
                    <img
                      src={filePreviews[index]}
                      alt="Preview"
                      style={{
                        maxWidth: "150px",
                        maxHeight: "150px",
                        borderRadius: "4px",
                        margin: "8px",
                      }}
                    />
                  ) : (
                    <span>📄 {name}</span>
                  )}
                </div>
              ))}
            </div>
          )}

        </Form>
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

                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0 }}>
                    <Avatar src={comment?.user?.avatar} size="small" icon={!comment?.user?.avatar && <UserOutlined />} /> <strong>{comment?.user?.name}:</strong> {comment?.content}
                  </p>
                  {comment.files && comment.files.length > 0 && (
                    <div style={{ marginTop: "5px", margin: 8 }}>
                      {comment.files.map((file, index) => (
                        file.path.endsWith(".jpg") || file.path.endsWith(".png") ? (
                          <a key={index} href={file.path} target="_blank" rel="noopener noreferrer" download>
                            <img
                              src={file.path}
                              alt="Attachment"
                              style={{ maxWidth: "100px", display: "block", marginTop: "5px" }}
                            />
                          </a>
                        ) : (
                          <a key={index} href={file.path} target="_blank" rel="noopener noreferrer">
                            📄 {file?.filename || "attachment"}
                          </a>

                        )
                      ))}
                    </div>
                  )}
                </div>
                <small style={{ whiteSpace: "nowrap", color: "#888" }}>
                  {moment.utc(comment.created_at, "YYYY-MM-DD HH:mm:ss").fromNow()}
                </small>
              </div>
            ))
          ) : (
            <p style={{ textAlign: "center", color: "#888" }}>No comments yet.</p>
          )}
        </div>


      </Modal>

    </>

  );
};

export default App;
