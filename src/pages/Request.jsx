import React, { useEffect, useState } from 'react';
import { Table, Card, Tabs, Input, DatePicker, Button, Row, Col, Modal, Form, Badge, Upload, Select,Popconfirm,message } from 'antd';
import moment from 'moment';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { CreateFile } from '../api/fileAPI';
import { CreateRequest } from '../api/requestAPI';
import { useWorkspace } from '../contexts/WorkspaceProvider';
import { GetAllWorkSpaces, GetWorkspaceDetailAPI } from '../api/workspaceApi';
import { GetAllTasks } from '../api/TaskApi';
import { GetAllRequest, GetRequest,ConfirmRequest ,DeleteRequest } from '../api/requestAPI';
import {
    BarChartOutlined,
    PieChartOutlined,
    PlusOutlined,
    EllipsisOutlined,
    NumberOutlined
} from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const RequestPage = () => {
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [searchText, setSearchText] = useState('');
    const [dateRange, setDateRange] = useState([null, null]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [workspaces, setWorkspaces] = useState([]);
    const [stages, setStages] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);
    const [selectedStage, setSelectedStage] = useState(null);
    const [form] = Form.useForm();
    const [requests, setRequests] = useState([]);
    const [requestDetail, setRequestDetail] = useState(null);

    useEffect(() => {
        const fetchWorkspaces = async () => {
            try {
                const data = await GetAllWorkSpaces();
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
            item.reason.includes(searchText.toLowerCase()) &&
            isInDateRange;
    });

    const handleRowClick = async (record) => {
        try {
            const detail = await GetRequest(record.id);
            setRequestDetail(detail.data);
            setSelectedRequest(record);
        } catch (error) {
            console.error('Error fetching request detail:', error.message);
        }
    };

    const columns = [
        {
            title: 'Reason',
            dataIndex: 'reason',
            render: (text, record) => (
                <a onClick={() => handleRowClick(record)}>{text}</a>
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
        {
            title: 'Approver',
            dataIndex: 'ApproveBy',
        },
        {
            title: 'Date',
            dataIndex: 'created_at',
        },
    ];

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            await handleSubmit(values);
            setIsModalVisible(false);

        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleSubmit = async (values) => {
        try {
            let attachmentId = null;

            // Kiểm tra xem file có tồn tại hay không
            if (values.attachment && values.attachment.length > 0) {
                const attachmentResponse = await CreateFile({ file: values.attachment[0], from: 'request' }); // Sử dụng values.attachment[0] nếu là mảng
                attachmentId = attachmentResponse.data.id;
            }

            const formattedDate = moment(values.date).format('YYYY-MM-DD HH:mm:ss');

            const requestResponse = await CreateRequest({
                attachment_ids: attachmentId ? [attachmentId] : undefined, // Chỉ thêm attachmentId nếu có
                deadline: formattedDate,
                reason: values.note,
                task_id: values.task_id,
                type: values.type,
                workspace_id: values.workspace_id
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
        }
    };

    const handleApprove = async (requestId) => {
        try {
            // Gọi API để phê duyệt yêu cầu
            // Ví dụ: await ApproveRequest(requestId);
            const reason=" "
            const status="approved"
            const  response= await ConfirmRequest(requestId,{reason, status})
            const detail= await GetRequest(requestId)
            setRequestDetail(detail.data)
            console.log(`Request ${requestId} approved.`);
            if(response.message=="Success"){
                fetchRequests()
                message.success(`Request ${requestId} approved.`)
            }
        } catch (error) {
            console.error('Error approving request:', error.message);
        }
    };

    const handleReject = async (requestId) => {
        try {
            // Gọi API để từ chối yêu cầu
            // Ví dụ: await RejectRequest(requestId);
            const reason=" "
            const status="rejected"
            const  response= await ConfirmRequest(requestId,{reason, status})
            
            if(response.message=="Success"){
                fetchRequests()
                message.success(`Request ${requestId} Rejected.`)
            }
        } catch (error) {
            console.error('Error declining request:', error.message);
        }
    };
    const handleDelete = async (requestId) => {
        try {
            const response= await DeleteRequest([requestId])
            if(response.message=="Success"){
                fetchRequests()
                message.success('Successfully Deleted! ');
            }
        } catch (error) {
            console.error('Error declining request:', error.message);
        }
    };
    return (
        <div style={{ display: 'flex', margin: 16 }}>

            <div style={{ width: '50%' }}>
                <Row gutter={[8, 8]}>
                    <Col>
                        <Input
                            placeholder="Search by title"
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
                <Button type="primary" onClick={() => setIsModalVisible(true)} style={{ marginBottom: '16px' }} icon={<PlusOutlined/>}>Request</Button>
                {requestDetail ? (
                    <>
                        <Card title="Request Details">
                            <p><strong>Type:</strong> {requestDetail.type==="change-deadline" ? "Change Deadline" : requestDetail.type==="make-done" ? "Make Done" : requestDetail.type}</p>
                            <p><strong>Reason:</strong> {requestDetail.reason}</p>
                            <p><strong>Created by:</strong> {requestDetail.user.name}</p>
                            <p><strong>Status:</strong> { <Badge count={requestDetail.status} style={{ backgroundColor: requestDetail.status === 'rejected' ? '#f5222d' : requestDetail.status === 'pending' ? '#faad14' : '#52c41a' }} />}</p>
                            <p><strong>Created At:</strong> {moment(requestDetail.created_at).format('DD/MM/YYYY HH:mm')}</p>
                            {/* Thêm các trường khác nếu cần */}
                            <Row style={{ marginTop: '16px' }}>
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
                        </Card>
                      
                    </>
                ) : (
                    <Card title="Request Details">
                        <p>Click on a request to see details.</p>
                    </Card>
                )}
            </div>
            <Modal title="Add New Request" visible={isModalVisible} onOk={handleOk} onCancel={() => setIsModalVisible(false)} width={600}>
                <Form form={form} layout="vertical">
                    <Form.Item label="Type" name="type" rules={[{ required: true, message: 'Please select a type!' }]}>
                        <Select placeholder="Select a type">
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
                    <Form.Item label="Date" name="date" rules={[{ required: true, message: 'Please select the date!' }]}>
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item label="Reason" name="note" rules={[{ required: true, message: 'Please input the reason!' }]}>
                        <Input.TextArea  editorStyle={{ border: '1px solid #ddd', minHeight: '200px' }} />
                    </Form.Item>
                    {/* <Form.Item label="Reason" name="reason">
                        <Editor editorStyle={{ border: '1px solid #ddd', minHeight: '200px' }} />
                    </Form.Item> */}
                    <Form.Item label="Attachment" name="attachment">
                        <Upload beforeUpload={() => false}>
                            <Button>Upload File</Button>
                        </Upload>
                    </Form.Item>

                </Form>
            </Modal>
        </div>
    );
};

export default RequestPage;
