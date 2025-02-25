import React, { useEffect, useState } from 'react';
import { Table, Card, Tabs, Input, DatePicker, Button, Row, Col, Modal, Form, Badge, Upload, Select, Popconfirm, message, Mentions, Avatar } from 'antd';
import moment from 'moment';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { CreateFile } from '../api/fileAPI';
import { CreateRequest } from '../api/requestAPI';
import { useWorkspace } from '../contexts/WorkspaceProvider';
import { GetWorkSpaceMe, GetWorkspaceDetailAPI } from '../api/workspaceApi';
import { GetAllTasks } from '../api/TaskApi';
import { GetAllRequest, GetRequest, ConfirmRequest, DeleteRequest } from '../api/requestAPI';
import { CreateComment ,GetAllComments} from '../api/commentAPI';
import { useForm } from "antd/es/form/Form";import { useParams,useNavigate } from 'react-router-dom'; 
import {
    BarChartOutlined,
    PieChartOutlined,
    PlusOutlined,
    EllipsisOutlined,
    NumberOutlined,
    UploadOutlined,
    UserOutlined,
    PaperClipOutlined,
    SendOutlined,
    EyeOutlined 
} from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
import { useAuth } from '../contexts/AuthContext';
import { getListUserAPI } from '../api/authApi';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const RequestPage = () => {
    const { id } = useParams(); 
   const {navigate}=useNavigate()
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [searchText, setSearchText] = useState('');
    const [dateRange, setDateRange] = useState([null, null]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [workspaces, setWorkspaces] = useState([]);
    const [stages, setStages] = useState([]);
    const [commentForm]=useForm()
    const [tasks, setTasks] = useState([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);
    const [selectedStage, setSelectedStage] = useState(null);
    const [form] = Form.useForm();
    const [requests, setRequests] = useState([]);
    const [requestDetail, setRequestDetail] = useState(null);
    const [showDate, setShowDate] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fileListComment,setFileListComment]=useState([])
    let isRemovingFile = false; // Biến cờ để theo dõi việc xóa file
    const { user } = useAuth()
    const [users, setUsers] = useState([])
    const [file, setFile] = useState(null);
    const [filePreviews, setFilePreviews] = useState(null);
    const [fileNames, setFileNames] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([])
    const [mentionedUsers, setMentionedUsers] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [commentTextToSend, setCommentTextToSend] = useState("");
    const [taskId, setTaskId] = useState(null)
    const [comments, setComments] = useState([])
    useEffect(() => {
       const fetchRequest=async(id)=>{
        if(id){
            const detail = await GetRequest(id);
            setRequestDetail(detail.data);
        }
       }
       if(id)
       fetchRequest(id)
    }, [id]); // Thêm id vào dependency array
    useEffect(() => {
        const fetchWorkspaces = async () => {
            try {
                const data = await GetWorkSpaceMe();
                if (Array.isArray(data.data)) {
                    setWorkspaces(data.data);
                } else {
                    console.error('Expected an array but got:', data);
                    setWorkspaces([]);
                }
            } catch (error) {
                console.error('Error fetching workspaces:', error.message);
            }
        };

        fetchWorkspaces();
    }, []);
    const fetchRequests = async () => {
        try {
            const data = await GetAllRequest();
            setRequests(data.data);
        } catch (error) {
            console.error('Error fetching requests:', error.message);
        }
    };
    useEffect(() => {


        fetchRequests();
    }, []);

    const handleWorkspaceChange = async (value) => {
        setSelectedWorkspace(value);
        setSelectedStage(null);
        try {
            const response = await GetWorkspaceDetailAPI(value);
            const stages = response.data.stages || [];
            setStages(stages);
        } catch (error) {
            console.error('Error fetching workspace details:', error.message);
        }
    };

    const handleStageChange = async (value) => {
        setSelectedStage(value);
        try {
            const tasksData = await GetAllTasks(value);
            setTasks(tasksData.data || []);
        } catch (error) {
            console.error('Error fetching tasks:', error.message);
        }
    };

    const filteredDataSource = requests.map(item => ({
        id: item.id,
        reason: item.reason,
        type: item.type,
        Note: item.Note,
        status: item.status,
        ApproveBy: item.ApproveBy,
        created_at: moment(item.created_at).format('DD/MM/YYYY HH:mm'),
        // Thêm các trường khác nếu cần
    })).filter(item => {
        const isInDateRange = dateRange[0] && dateRange[1]
            ? moment(item.created_at, 'DD/MM/YYYY HH:mm').isBetween(dateRange[0], dateRange[1], null, '[]')
            : true;

        return (activeTab === 'all' || item.status === activeTab) &&
            item?.reason?.includes(searchText.toLowerCase()) &&
            isInDateRange;
    });

    const handleRowClick = async (record) => {
        try {
            const detail = await GetRequest(record.id);
            const usersReponse = await getListUserAPI(detail.data.workspace.id);
            setUsers(usersReponse.data);
            setRequestDetail(detail.data);
            setSelectedRequest(record);
            setFileListComment([]);
            setFilePreviews(null);
            setFileNames([]);
            setCommentText("");
            const response = await GetAllComments(record.id, "request"); // Assume you have an API to get comments
            setComments(response.data);
            window.history.pushState({}, "", `/request/${record.id}`);
            // Thêm ID của request vào route
            
        } catch (error) {
            console.error('Error fetching request detail:', error.message);
        }
    };

    const columns = [
        {
            title: 'Reason',
            dataIndex: 'reason',
            render: (text, record) => (
                text
            ),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            render: (text) => (
                text === "change-deadline" ? "Change Deadline" :
                    text === "make-done" ? "Make Done" : text
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (text) => (
                <Badge count={text} style={{ backgroundColor: text === 'rejected' ? '#f5222d' : text === 'pending' ? '#faad14' : '#52c41a' }} />
            ),
        },
        // {
        //     title: 'Approver',
        //     dataIndex: 'ApproveBy',
        // },
        {
            title: 'Date',
            dataIndex: 'created_at',
        },
        {
            title: 'Action',
            dataIndex: 'detail',
            render: (text, record) => (
                <Button 
                  //type="primary" 
                  icon={<EyeOutlined />} 
                  onClick={() => handleRowClick(record)}
                >
                  Detail
                </Button>
              ),
        },
    ];

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            await handleSubmit(values);
            setIsModalVisible(false);
        } catch (error) {
            console.error('Validation failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values) => {
        try {
            let attachmentId = null;
            console.log(values.attachment)
            // Kiểm tra xem file có tồn tại hay không
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

            const formattedDate = moment(values.date).format('YYYY-MM-DD HH:mm:ss');

            const requestResponse = await CreateRequest({
                attachment_ids: attachmentIds.length > 0 ? attachmentIds : undefined, // Chỉ thêm attachmentId nếu có
                //deadline: formattedDate,
                reason: values.note,
                task_id: values.task_id,
                type: values.type,
                workspace_id: values.workspace_id,
                ...(values.type !== 'make-done' && { deadline: formattedDate })
            });
            form.resetFields()
            console.log('Request created successfully:', requestResponse);
            setRequests(prevRequests => [...prevRequests, requestResponse.data]);
            if (requestResponse.message == "Success") {
                await fetchRequests();
                message.success("Request created successfully!");
            }

        } catch (error) {
            console.error('Error creating request:', error.message);
            message.error(error.message)
        }
    };

    const handleApprove = async (requestId) => {
        try {
            // Gọi API để phê duyệt yêu cầu
            // Ví dụ: await ApproveRequest(requestId);
            const reason = " "
            const status = "approved"
            const response = await ConfirmRequest(requestId, { reason, status })
            const detail = await GetRequest(requestId)
            setRequestDetail(detail.data)
            console.log(`Request ${requestId} approved.`);
            if (response.message == "Success") {
                fetchRequests()
                message.success(`Request Approved.`)
            }
        } catch (error) {
            console.error('Error approving request:', error.message);
        }
    };

    const handleReject = async (requestId) => {
        try {
            // Gọi API để từ chối yêu cầu
            // Ví dụ: await RejectRequest(requestId);
            const reason = " "
            const status = "rejected"
            const response = await ConfirmRequest(requestId, { reason, status })

            if (response.message == "Success") {
                fetchRequests()
                message.success(`Request Rejected.`)
            }
        } catch (error) {
            console.error('Error declining request:', error.message);
        }
    };
    const handleDelete = async (requestId) => {
        try {
            const response = await DeleteRequest([requestId])
            if (response.message == "Success") {
                fetchRequests()
                message.success('Successfully Deleted! ');
            }
        } catch (error) {
            console.error('Error declining request:', error.message);
        }
    };

    const handleUploadChange = (info) => {
        let newFileList = [...info.fileList];
        setFileList(newFileList);
    };
    const handleCommentSubmit = async (values) => {
        try {
            const uploadedFiles = [];
            setCommentText("")
            commentForm.resetFields()
            for (const file of fileListComment) {
                const response = await CreateFile({ file: file, from: "comment" }); // Chờ từng file upload xong
                uploadedFiles.push(response.data); // Lưu kết quả response
            }
            const response = await CreateComment({ content: commentText, file_ids: uploadedFiles.map(f => f.id), mention_ids: mentionedUsers.map(user => user.key), object_id: requestDetail.id, source: "request" })
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
            setFileListComment(newFiles); // Lưu danh sách file vào state
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
    return (
        <div style={{ display: 'flex', margin: 16 }}>

            <div style={{ width: '50%' }}>
                <Row gutter={[8, 8]}>
                    <Col>
                        <Input
                            placeholder="Search by type"
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            style={{ marginBottom: '10px' }}
                        />
                    </Col>
                    <Col>
                        <RangePicker
                            onChange={dates => setDateRange(dates)}
                            style={{ marginBottom: '10px' }}
                        />
                    </Col>
                </Row>


                <Tabs defaultActiveKey="all" onChange={setActiveTab}>
                    <TabPane tab="All" key="all" />
                    <TabPane tab="Pending" key="pending" />
                    <TabPane tab="Approved" key="approved" />
                    <TabPane tab="Rejected" key="rejected" />
                </Tabs>
                <Table
                    dataSource={filteredDataSource}
                    columns={columns}
                    pagination={true}
                />
            </div>
            <div style={{ marginLeft: '20px', width: '50%' }}>
                <Button type="primary" onClick={() => setIsModalVisible(true)} style={{ marginBottom: '16px' }} icon={<PlusOutlined />}>Request</Button>
                {requestDetail ? (
                    <>
                        <Card title="Request Details">
                            <p><strong>Type:</strong> {requestDetail.type === "change-deadline" ? "Change Deadline" : requestDetail.type === "make-done" ? "Make Done" : requestDetail.type}</p>
                            <p><strong>Reason:</strong> {requestDetail.reason}</p>
                            <p><strong>Created by:</strong> {requestDetail.user.name}</p>
                            <p><strong>Status:</strong> {<Badge count={requestDetail.status} style={{ backgroundColor: requestDetail.status === 'rejected' ? '#f5222d' : requestDetail.status === 'pending' ? '#faad14' : '#52c41a' }} />}</p>
                            <p><strong>Created At:</strong> {moment(requestDetail.created_at).format('DD/MM/YYYY HH:mm')}</p>
                            {/* Thêm các trường khác nếu cần */}
                            <Row style={{ marginTop: '16px', marginBottom: 16 }}>
                                {requestDetail.can_confirm && (
                                    <Button type='primary' onClick={() => handleApprove(requestDetail.id)} style={{ marginRight: '8px' }}>Approval</Button>
                                )}
                                {requestDetail.can_reject && (
                                    <Button danger type='primary' onClick={() => handleReject(requestDetail.id)} style={{ marginRight: '8px' }}>Reject</Button>
                                )}
                                {requestDetail.can_delete && (
                                    <Popconfirm
                                        title="Are you sure you want to delete this request?"
                                        onConfirm={() => handleDelete(requestDetail.id)}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button danger >Delete</Button>
                                    </Popconfirm>
                                )}
                            </Row>
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
                                                    <Avatar src={comment?.user?.avatar} icon={!comment?.user?.avatar && <UserOutlined />} size="small" /> <strong>{comment?.user?.name}:</strong> {comment?.content}
                                                </p>
                                                {comment?.files && comment?.files?.length > 0 && (
                                                    <div style={{ marginTop: "5px", margin: 8 }}>
                                                        {comment.files.map((file, index) => (
                                                            file?.path?.endsWith(".jpg") || file?.path?.endsWith(".png") ? (
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
                        </Card>

                    </>
                ) : (
                    <Card title="Request Details">
                        <p>Click on a request to see details.</p>
                    </Card>
                )}
            </div>
            <Modal title="Add New Request" visible={isModalVisible} onOk={handleOk} onCancel={() => setIsModalVisible(false)} width={600} okButtonProps={{ loading }}>
                <Form form={form} layout="vertical">
                    <Form.Item label="Type" name="type" rules={[{ required: true, message: 'Please select a type!' }]}>
                        <Select placeholder="Select a type" onChange={value => {
                            form.setFieldsValue({ date: null }); // Reset date when type changes
                            // Cập nhật trạng thái để ẩn/hiện trường date
                            setShowDate(value === 'change-deadline');
                        }}>
                            <Option value="change-deadline">Change Deadline</Option>
                            <Option value="make-done">Make Done</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="Workspace" name="workspace_id" rules={[{ required: true, message: 'Please select a workspace!' }]}>
                        <Select placeholder="Select a workspace" onChange={handleWorkspaceChange} showSearch>
                            {workspaces.map(workspace => (
                                <Option key={workspace.id} value={workspace.id}>{workspace.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Stage" name="stage_id" rules={[{ required: true, message: 'Please select a stage!' }]}>
                        <Select placeholder="Select a stage" onChange={handleStageChange} showSearch disabled={!selectedWorkspace}>
                            {stages.map(stage => (
                                <Option key={stage.id} value={stage.id}>{stage.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Task" name="task_id" rules={[{ required: true, message: 'Please select a task!' }]}>
                        <Select placeholder="Select a task" showSearch disabled={!selectedStage}>
                            {tasks.map(task => (
                                <Option key={task.id} value={task.id}>{task.title}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    {showDate && (
                        <Form.Item label="Date and Time" name="date" rules={[{ required: true, message: 'Please select the date and time!' }]}>
                            <DatePicker showTime style={{ width: '100%' }} />
                        </Form.Item>
                    )}
                    <Form.Item label="Reason" name="note" rules={[{ required: true, message: 'Please input the reason!' }]}>
                        <Input.TextArea editorStyle={{ border: '1px solid #ddd', minHeight: '200px' }} />
                    </Form.Item>
                    {/* <Form.Item label="Reason" name="reason">
                        <Editor editorStyle={{ border: '1px solid #ddd', minHeight: '200px' }} />
                    </Form.Item> */}
                    <Form.Item name="attachment" label="Upload Attachment">
                        <Upload
                            onChange={handleUploadChange}
                            fileList={fileList}
                            beforeUpload={() => false}
                        >
                            <Button icon={<UploadOutlined />}>Click to Upload</Button>
                        </Upload>
                    </Form.Item>

                    {fileList.length > 0 && (
                        <div>
                            <h4>Uploaded File IDs:</h4>
                            <ul>
                                {fileList.map((file) => (
                                    <li key={file.uid}>File ID: {file.uid}</li>
                                ))}
                            </ul>
                        </div>
                    )}



                </Form>
            </Modal>
        </div>
    );
};

export default RequestPage;
