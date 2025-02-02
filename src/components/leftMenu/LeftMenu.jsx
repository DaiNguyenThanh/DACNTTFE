import React, { useState, useEffect } from 'react';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    MailOutlined,
    CalendarOutlined,
    AppstoreOutlined,
    SettingOutlined,
    PlusCircleOutlined,
    ScheduleOutlined,
    ProjectOutlined,
    PlusOutlined,
    EllipsisOutlined,
    UpOutlined,
    DownOutlined,
    DeleteOutlined,
    EditOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, Divider, Avatar, Typography, Modal, Form, Input, Select, Dropdown, Popconfirm, Radio, message, Checkbox, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/imgaes/logoITTDTU.png';
import { NavLink } from 'react-router-dom';
import './LeftMenu.css'
import { path, role } from '../../utils';
import { Color } from 'antd/es/color-picker';
import { GetUserAPI } from '../../api/adminUsers';
import { GetAllSubjectAPI } from '../../api/subjectApi';
import { CreateWorkSpace, DeleteWorkSpace, GetWorkspaceDetailAPI } from '../../api/workspaceApi';
import { GetAllWorkSpaces } from '../../api/workspaceApi'; // Import API để lấy danh sách workspace
import { useWorkspace } from '../../contexts/WorkspaceProvider'; // Nhập useWorkspace
import styled from 'styled-components'; // Đảm bảo bạn đã import styled-components
import { useAuth } from '../../contexts/AuthContext';

const { Sider } = Layout;
const { Text } = Typography;


const WorkspaceContainer = styled.div`
    display: flex;
    align-items: center; // Căn giữa theo chiều dọc
    justify-content: space-between; // Căn giữa theo chiều ngang
    width: 100%; // Đảm bảo chiếm toàn bộ chiều rộng
    overflow: hidden; // Ẩn phần tràn
`;

const WorkspaceName = styled.span`
    flex-grow: 1; // Cho phép tên workspace chiếm không gian còn lại
    margin-right:; // Khoảng cách giữa tên workspace và nút dropdown
    overflow: hidden; // Ẩn phần tràn
    white-space: nowrap; // Không cho xuống dòng
    text-overflow: ellipsis; // Hiển thị dấu "..." khi tràn
    max-width: 200px; // Đặt chiều rộng tối đa cho tên workspace
`;

const LeftMenu = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [selectedKeys, setSelectedKeys] = useState(['1']);
    const [openKeys, setOpenKeys] = useState(['sub1']);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [users, setUsers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [workspaceform] = Form.useForm();
    const navigate = useNavigate();
    const [workspaceList,setworkspaceList]=useState([])
    const [todoStates, setTodoStates] = useState(['']); // State để lưu danh sách các giá trị nhập vào
    const { setSelectedWorkspace } = useWorkspace(); // Sử dụng useWorkspace để lấy setSelectedWorkspace
    const [isEditModalVisible, setIsEditModalVisible] = useState(false); // Thêm state cho modal chỉnh sửa
    const [editingWorkspace, setEditingWorkspace] = useState(null); // Thêm state để lưu workspace đang chỉnh sửa
    const user = JSON.parse(localStorage.getItem('user')); // Lấy thông tin người dùng từ localStorage
    // Lấy thông tin người dùng từ localStorage
    
    const userRole = user ? user.role : null;
    useEffect(() => {
        const fetchWorkspaces = async () => {
            try {
                const response = await GetAllWorkSpaces(); // Gọi API để lấy danh sách workspace
                if (response.error_code==0) { // Kiểm tra phản hồi
                    setworkspaceList(response.data); // Giả sử response.data chứa danh sách workspace
                } else {
                    console.error(response.message); // Xử lý thông báo lỗi nếu cần
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách workspace:", error);
            }
        };

        fetchWorkspaces(); // Gọi hàm fetchWorkspaces khi component được mount
    }, []); 
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await GetUserAPI();
                console.log(response.data.items)
                setUsers(response.data.items);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách người dùng:", error);
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const response = await GetAllSubjectAPI();
                setSubjects(response.data);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách môn học:", error);
            }
        };

        fetchSubjects();
    }, []);

    const showModal = () => {
        workspaceform.resetFields()
        setTodoStates([''])
        setIsModalVisible(true);
    };

    const handleMenuClick = async (e) => {
        setSelectedKeys([e.key]);
        // Làm phẳng menu items thành mảng 1 chiều
        const flattenMenuItems = (items) => {
            return items.flatMap(item => [
                item,
                ...(item.children ? flattenMenuItems(item.children) : [])
            ]);
        };

        const menuItem = flattenMenuItems(menuItems).find(item => item.key === e.key);

        if (menuItem?.target) {
            // Kiểm tra xem workspace có trong danh sách workspace hay không
            const isWorkspaceItem = workspaceList.some(workspace => workspace.id === menuItem.key);
            
            if (isWorkspaceItem) {
                setSelectedWorkspace(menuItem.key); // Cập nhật selectedWorkspace
            }
            // await fetchWorkspaceDetail(menuItem.key); // Gọi API để lấy chi tiết workspace
            navigate(menuItem.target);
        }
    };

    const fetchWorkspaceDetail = async (workspaceId) => {
        try {
            const response = await GetWorkspaceDetailAPI(workspaceId); // Gọi API để lấy chi tiết workspace
            console.log(response.data); // Xử lý dữ liệu chi tiết workspace
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết workspace:", error);
        }
    };

    const onOpenChange = (keys) => {
        setOpenKeys(keys);
    };

    const handleOk = async () => {
        try {
            // Lấy form instance và validate các field
            const values = await workspaceform.validateFields(); 
            
            const { workspaceName, users, subjects } = values; // Lấy giá trị từ form
            console.log(workspaceName);
    
            // Gửi request tạo workspace
            const response = await CreateWorkSpace({
                name: workspaceName,
                user_ids: users,
                subject_ids: subjects,
                stages: todoStates,
            });

            if (response.error_code == 0) {
                message.success('Workspace created successfully!'); // Hiển thị thông báo thành công
                
                // Thêm workspace mới vào workspaceList
                setworkspaceList(prevList => [
                    ...prevList,
                    { id: response.data.id, name: workspaceName } // Giả sử response.data.id chứa ID của workspace mới
                ]);

                setIsModalVisible(false); // Đóng modal
                // Có thể thêm logic để cập nhật danh sách workspace nếu cần
            } else {
                message.error(response.message || 'An error occurred'); // Hiển thị thông báo lỗi
            }
        } catch (error) {
            console.error("Error creating workspace:", error);
            message.error('Failed to create workspace.'); // Hiển thị thông báo lỗi
        }
    };
    

    const handleCancel = () => {
        setIsModalVisible(false);
    };
    const filterMenuItems = (items) => {
        return items
            .filter(item => !item.hidden) // Lọc các mục chính
            .map(item => {
                // Kiểm tra và xử lý children nếu có
                if (item.children) {
                    return {
                        ...item,
                        children: filterMenuItems(item.children) // Lọc children đệ quy
                    };
                }
                return item; // Trả lại mục nếu không có children
            });
    };
    const handleDeleteWorkspace = async (workspaceId) => {
        try {
            // Gọi API để xóa workspace
            const response = await DeleteWorkSpace([workspaceId]); // Giả sử bạn đã định nghĩa hàm DeleteWorkSpace trong api/workspaceApi
            if (response.error_code === 0) {
                message.success('Workspace deleted successfully!'); // Hiển thị thông báo thành công
                // Cập nhật lại danh sách workspace sau khi xóa
                setworkspaceList(prevList => {
                    const updatedList = prevList.filter(workspace => workspace.id !== workspaceId);
                    // Nếu danh sách workspace còn lại không rỗng, điều hướng về workspace đầu tiên
                    if (updatedList.length > 0) {
                        navigate(`/workspace/${updatedList[0].id}`); // Điều hướng về workspace đầu tiên
                    } else {
                        navigate('/'); // Nếu không còn workspace nào, điều hướng về trang chính
                    }
                    return updatedList;
                });
            } else {
                message.error(response.message || 'An error occurred while deleting the workspace.'); // Hiển thị thông báo lỗi
            }
        } catch (error) {
            console.error("Error deleting workspace:", error);
            message.error('Failed to delete workspace.'); // Hiển thị thông báo lỗi
        }
    };
    const menuItems = [
        {
            key: '1',
            icon: <MailOutlined />,
            label: "Home",
            target: path.HOME
        },
        {
            key: '2',
            icon: <MailOutlined />,
            label: "Dashboard",
            target: path.DASHBOARD,
            hidden: userRole !== role.RoleAdmin
        },
        {
            key: '3',
            icon: <CalendarOutlined />,
            label: 'Request',
            target: path.REQUEST,
        },
        {
            key: 'sub1',
            label: 'Workspace',
            icon: <AppstoreOutlined />,
            target: path.WORKSPACE,
            children: [
                {
                    key: 'addWorkspace',
                    //icon:<PlusCircleOutlined />,
                    label: '+ New workspace',
                    onClick: showModal,
                    style: { color: "#686868", fontSize: "11px" },
                    hidden:userRole !== role.RoleAdmin
                },
               
                ...workspaceList.map(workspace => ({
                    key: workspace.id, // Giả sử mỗi workspace có thuộc tính id
                    label: (
                        <WorkspaceContainer>
                            <WorkspaceName>{workspace.name}</WorkspaceName>
                            <Dropdown
                                overlay={
                                    <Menu>
                                        <Menu.Item icon={<EditOutlined style={{ color: '#1890ff' }} />} onClick={() => showEditModal(workspace)}>
                                            
                                            <Button type="link" >Edit</Button>
                                        </Menu.Item>
                                        <Menu.Item icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}>
                                            <Popconfirm title="Are you sure to delete?" onConfirm={() => handleDeleteWorkspace(workspace.id)}>
                                                <Button type="link" danger>Delete</Button>
                                            </Popconfirm>
                                        </Menu.Item>
                                    </Menu>
                                }
                                overlayStyle={{ zIndex: 9999 }}
                            >
                                <Button type="text">...</Button>
                            </Dropdown>
                        </WorkspaceContainer>
                    ),
                    target: path.WORKSPACE + `/`+workspace.id
                }))

            ],
        },
        {
            key: '9',
            icon: <SettingOutlined />,
            label: "Configration",
            target: path.CONFIGRRATION,
            hidden:userRole !== role.RoleAdmin
        },
    ];

    const handleAddInput = () => {
        setTodoStates([...todoStates, '']); // Thêm một trường nhập liệu mới
    };

    const handleInputChange = (index, value) => {

        const newTodoStates = [...todoStates];
        newTodoStates[index] = value; // Cập nhật giá trị của trường nhập liệu tương ứng
        setTodoStates(newTodoStates);
        
    };

    const handleRemoveInput = (index) => {
        const newTodoStates = todoStates.filter((_, i) => i !== index); // Lọc ra các trường không phải là trường cần xóa
        setTodoStates(newTodoStates); // Cập nhật state với danh sách mới
    };

    const handleMoveDown = (index) => {
        if (index < todoStates.length - 1) {
            const newTodoStates = [...todoStates];
            [newTodoStates[index], newTodoStates[index + 1]] = [newTodoStates[index + 1], newTodoStates[index]];
            setTodoStates(newTodoStates);
        }
    };

    const handleMoveUp = (index) => {
        if (index > 0) {
            const newTodoStates = [...todoStates];
            // Hoán đổi vị trí của phần tử hiện tại với phần tử phía trên
            [newTodoStates[index], newTodoStates[index - 1]] = [newTodoStates[index - 1], newTodoStates[index]];
            setTodoStates(newTodoStates); // Cập nhật state với danh sách mới
        }
    };

    const showEditModal = (workspace) => {
        setEditingWorkspace(workspace); // Lưu workspace đang chỉnh sửa
        setIsEditModalVisible(true); // Hiển thị modal chỉnh sửa
    };

    const handleEditOk = async () => {
        try {
            // Lấy form instance và validate các field
            const values = await workspaceform.validateFields(); 
            
            const { workspaceName, users, subjects } = values; // Lấy giá trị từ form
            console.log(workspaceName);
    
            // Gửi request tạo workspace
            const response = await CreateWorkSpace({
                name: workspaceName,
                user_ids: users,
                subject_ids: subjects,
                stages: todoStates,
            });

            if (response.error_code == 0) {
                message.success('Workspace created successfully!'); // Hiển thị thông báo thành công
                
                // Thêm workspace mới vào workspaceList
                setworkspaceList(prevList => [
                    ...prevList,
                    { id: response.data.id, name: workspaceName } // Giả sử response.data.id chứa ID của workspace mới
                ]);

                setIsEditModalVisible(false); // Đóng modal
                // Có thể thêm logic để cập nhật danh sách workspace nếu cần
            } else {
                message.error(response.message || 'An error occurred'); // Hiển thị thông báo lỗi
            }
        } catch (error) {
            console.error("Error creating workspace:", error);
            message.error('Failed to create workspace.'); // Hiển thị thông báo lỗi
        }
    };

    return (
        <div className="left-menu">
            <NavLink className="logo" to={path.HOME}>
                <img src={logo} alt="Logo" width={200} height={150} />
            </NavLink>
            <Sider trigger={null} collapsible collapsed={collapsed} theme="light">

                <Menu
                    mode="inline"
                    selectedKeys={selectedKeys}
                    openKeys={openKeys}
                    onOpenChange={onOpenChange}
                    onClick={handleMenuClick}
                    items={filterMenuItems(menuItems)}

                />
                <Modal title="Add Workspace" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} >
                    <Form onFinish={handleOk} form={workspaceform} layout='vertical'>
                        <Form.Item label="Workspace Name" name="workspaceName" rules={[{ required: true, message: 'Please input the workspace name!' }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Select Users" name="users" rules={[{ required: true, message: 'Please select at least one user!' }]}>
                            <Select mode="multiple" placeholder="Select users" showSearch>
                                {users.map(user => (
                                    <Select.Option key={user.id} value={user.id}>{user.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item label="Select Subjects" name="subjects" rules={[{ required: true, message: 'Please select at least one subject!' }]}>
                            <Select mode="multiple" placeholder="Select subject" showSearch>
                                {subjects.map(subject => (
                                    <Select.Option key={subject.id} value={subject.id}>{subject.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item label="Create Stages">
                            {todoStates.map((state, index) => (
                                <Row key={index} gutter={[16, 8]} style={{ marginBottom: 4 }}>
                                    <Col span={20}>
                                        <Input
                                            value={state}
                                            onChange={(e) => handleInputChange(index, e.target.value)}
                                            placeholder={`Stage ${index + 1}`}
                                        />
                                    </Col>
                                    <Col span={4}>
                                        <Dropdown
                                            overlay={
                                                <Menu>
                                                        <Menu.Item onClick={() => handleRemoveInput(index)}>
                                                        <DeleteOutlined /> Remove
                                                    </Menu.Item>
                                                    {index > 0 && (
                                                        <Menu.Item onClick={() => handleMoveUp(index)}>
                                                            <UpOutlined /> Move Up
                                                        </Menu.Item>
                                                    )}
                                                
                                                    <Menu.Item onClick={() => handleMoveDown(index)}>
                                                        <DownOutlined /> Move Down
                                                    </Menu.Item>
                                                </Menu>
                                            }
                                            trigger={['click']}
                                        >
                                            <a onClick={(e) => e.preventDefault()}>
                                                <EllipsisOutlined />
                                            </a>
                                        </Dropdown>
                                    </Col>
                                </Row>
                            ))}
                            <Button type="dashed" onClick={handleAddInput} style={{ marginTop: 8 }} icon={<PlusOutlined />}>
                                New
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
                <Modal title="Edit Workspace" visible={isEditModalVisible} onOk={handleEditOk} onCancel={() => setIsEditModalVisible(false)}>
                    <Form onFinish={handleEditOk} form={workspaceform} layout='vertical'>
                        <Form.Item label="Workspace Name" name="workspaceName" rules={[{ required: true, message: 'Please input the workspace name!' }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Select Users" name="users" rules={[{ required: true, message: 'Please select at least one user!' }]}>
                            <Select mode="multiple" placeholder="Select users" showSearch>
                                {users.map(user => (
                                    <Select.Option key={user.id} value={user.id}>{user.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item label="Select Subjects" name="subjects" rules={[{ required: true, message: 'Please select at least one subject!' }]}>
                            <Select mode="multiple" placeholder="Select subject" showSearch>
                                {subjects.map(subject => (
                                    <Select.Option key={subject.id} value={subject.id}>{subject.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item label="Create Stages">
                            {todoStates.map((state, index) => (
                                <Row key={index} gutter={[16, 8]} style={{ marginBottom: 4 }}>
                                    <Col span={20}>
                                        <Input
                                            value={state}
                                            onChange={(e) => handleInputChange(index, e.target.value)}
                                            placeholder={`Stage ${index + 1}`}
                                        />
                                    </Col>
                                    <Col span={4}>
                                        <Dropdown
                                            overlay={
                                                <Menu>
                                                    <Menu.Item onClick={() => handleRemoveInput(index)}>Remove</Menu.Item>
                                                    <Menu.Item onClick={() => handleMoveDown(index)}>Move Down</Menu.Item>
                                                </Menu>
                                            }
                                            trigger={['click']}
                                        >
                                            <a onClick={(e) => e.preventDefault()}>
                                                <EllipsisOutlined />
                                            </a>
                                        </Dropdown>
                                    </Col>
                                </Row>
                            ))}
                            <Button type="dashed" onClick={handleAddInput} style={{ marginTop: 8 }} icon={<PlusOutlined />}>
                                New
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
                {/* <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setCollapsed(!collapsed)}
                    className="sticky top-60 left-64 z-10 text-xl w-15 rounded-full bg-white shadow-sm"
                /> */}
            </Sider>
        </div>

    );
};

export default LeftMenu;

