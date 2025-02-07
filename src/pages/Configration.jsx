import React, { useState, useEffect } from 'react';
import { Tabs, Table, Button, Modal, Form, Input, Popconfirm, Select } from 'antd';
import { GetAllSubjectAPI, CreateSubjectAPI, UpdateSubjectAPI, DeleteSubjectAPI } from '../api/subjectApi';
import {  DeleteUserAPI, updateUserAPI, GetUserAPI } from '../api/adminUsers';
import {
    DeleteOutlined,
    MenuUnfoldOutlined,
    EditOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { path, role } from '../utils';

import { useNavigate } from 'react-router-dom'; 

const { TabPane } = Tabs;

const Configration = () => {
    const [dataSource, setDataSource] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [form] = Form.useForm();
    const [userDataSource, setUserDataSource] = useState([]);
    const [isUserModalVisible, setIsUserModalVisible] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [userForm] = Form.useForm();
    const navigate = useNavigate();
   const { user}= useAuth()
   useEffect(() => {
    if(user?.role!== role.RoleAdmin){
        navigate(path.ERROR)
    }
   },[user,navigate]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const respone = await GetAllSubjectAPI();
                const subjects = respone.data
                console.log('Fetched subjects:', subjects);
                // const responeUser = await GetAllSubjectAPI(localStorage.getItem('user').id);
                // setUserDataSource(responeUser);
                if (Array.isArray(subjects)) {
                    setDataSource(subjects);
                    
                } else {
                    console.error('Fetched data is not an array:', subjects);
                };

             
            } catch (error) {
                console.error('Failed to fetch subjects:', error);
            }
        };

        const fetchUsers = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user')); // Phân tích cú pháp chuỗi JSON
               
                const responseUser = await GetUserAPI(user.id); // Lấy id từ đối tượng user
                
                // Kiểm tra xem responseUser.data có phải là mảng không
                if (Array.isArray(responseUser.data.items)) {
                    setUserDataSource(responseUser.data.items);
                    console.log(responseUser.data.items)
                } else {
                    console.error('Fetched user data is not an array:', responseUser.data);
                }
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };

        fetchData();
        fetchUsers();
    }, []);

    const handleAdd = () => {
        setCurrentItem(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (id) => {
        const item = dataSource.find(item => item.id === id);
        setCurrentItem(item);
        form.setFieldsValue(item);
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            // Gọi API xóa
            await DeleteSubjectAPI([id]); // Thay thế bằng API xóa thực tế
            setDataSource(dataSource.filter(item => item.id !== id));
        } catch (error) {
            console.error('Failed to delete subject:', error);
        }
    };

    const handleOk = () => {
        form.validateFields().then(async values => {
            try {
                if (currentItem) {
                    // Cập nhật mục hiện tại
                    await UpdateSubjectAPI({ id: currentItem.id, name: values.name, description: values.description });
                    setDataSource(dataSource.map(item => (item.id === currentItem.id ? { ...item, ...values } : item)));
                } else {
                    // Thêm mới mục
                    const newData = await CreateSubjectAPI({ id: Date.now(), name: values.name, description: values.description });
                    setDataSource([...dataSource, newData.data]);
                }
                setIsModalVisible(false);
            } catch (error) {
                console.error('Failed to save subject:', error);
            }
        });
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const columns = [
        {
            title: 'Index',
            dataIndex: 'index',
            key: 'index',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <span>
                    <Button 
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record.id)}
                        style={{ marginRight: 8 }}
                    >
                        Edit
                    </Button>
                    <Popconfirm title="Are you sure to delete?" onConfirm={() => handleDelete(record.id)}>
                        <Button 
                            type="link" 
                            icon={<DeleteOutlined />}
                            style={{ color: '#ff4d4f' }}
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </span>
            ),
        },
    ];

    const handleAddUser = () => {
        setCurrentUser(null);
        userForm.resetFields();
        setIsUserModalVisible(true);
    };

    const handleEditUser = (id) => {
        const user = userDataSource.find(user => user.id === id);
        console.log(user)
        setCurrentUser(user);
        userForm.setFieldsValue(user);
        setIsUserModalVisible(true);
    };

    const handleUserOk = () => {
        userForm.validateFields().then(async values => {
            try {
                if (currentUser) {
                    // Cập nhật người dùng hiện tại
                    await updateUserAPI({ id: currentUser.id, name: values.name, email: values.email, role: values.role, subject_id: values.subject });
                    // Cập nhật lại userDataSource sau khi sửa thành công
                    const responseUser = await GetUserAPI(); // Lấy id từ đối tượng user
                
                // Kiểm tra xem responseUser.data có phải là mảng không
                if (Array.isArray(responseUser.data.items)) {
                    setUserDataSource(responseUser.data.items);
                    console.log(responseUser.data.items)
                } else {
                    console.error('Fetched user data is not an array:', responseUser.data);
                }
                    userForm.resetFields();
                } 
                // else {
                //     // Thêm mới người dùng
                //     const newUser = await createUserAPI({ name: values.name, email: values.email, role: values.role, subject_id: values.subject_id });
                //     setUserDataSource([...userDataSource, newUser.data]);
                // }
                setIsUserModalVisible(false);
                userForm.resetFields();
            } catch (error) {
                console.error('Failed to save user:', error);
            }
        }).catch(info => {
            console.log('Validation Failed:', info); // Nếu có lỗi validation, sẽ không thực hiện submit
        });
    };

    const handleUserCancel = () => {
        setIsUserModalVisible(false);
    };

    const userColumns = [
        {
            title: 'Index',
            dataIndex: 'index',
            key: 'index',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
        },
        {
            title: 'Subject',
            dataIndex: 'subject', // Giả sử subject là một đối tượng
            key: 'subject',
            render: (subject) => subject ? subject.name : 'N/A', // Lấy trường name từ subject
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <span>
                    <Button 
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEditUser(record.id)}
                        style={{ marginRight: 8 }}
                    >
                        Edit
                    </Button>
                    <Popconfirm title="Are you sure to delete?" onConfirm={() => handleDeleteUser(record.id)}>
                        <Button 
                            type="link" 
                            icon={<DeleteOutlined />}
                            style={{ color: '#ff4d4f' }}
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </span>
            ),
        },
    ];

    const handleDeleteUser = async (id) => {
        try {
            // Gọi API xóa người dùng
           
            await DeleteUserAPI({ids:[id]}); // Thay thế bằng API xóa thực tế
            setUserDataSource(userDataSource.filter(user => user.id !== id));
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    };

    return (
        <div style={{ 
            margin: 20, 
            paddingRight: 50, 
            paddingLeft: 50, 
            backgroundColor: '#ffffff', 
            borderRadius: 8, 
            //maxHeight: 'calc(100% - 84px)',
            overflowY: 'auto'
        }}>
            <Tabs defaultActiveKey="1">
                <TabPane tab="Subject" key="1">
                    <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16 }}>
                        Add Subject
                    </Button>
                    <Table 
                        dataSource={dataSource} 
                        columns={columns} 
                       
                        scroll={{ y: 600 }}
                    />
                    <Modal title={currentItem ? "Edit Subject" : "Add Subject"} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                        <Form form={form} layout="vertical">
                            <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input the name!' }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please input the description!' }]}>
                                <Input.TextArea />
                            </Form.Item>
                        </Form>
                    </Modal>
                </TabPane>
                <TabPane tab="Users" key="2">
                    {/* <Button type="primary" onClick={handleAddUser} style={{ marginBottom: 16 }}>
                        Add User
                    </Button> */}
                    <Table dataSource={userDataSource} columns={userColumns} />
                    <Modal title={currentUser ? "Edit User" : "Add User"} visible={isUserModalVisible} onOk={handleUserOk} onCancel={handleUserCancel}>
                        <Form form={userForm} layout="vertical">
                            <Form.Item 
                                name="name" 
                                label="Name" 
                                rules={[
                                    { required: true, message: 'Please input the username!' },
                                    { min: 3, message: 'Username must be at least 3 characters long!' }
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item 
                                name="email" 
                                label="Email" 
                                rules={[
                                    { required: true, message: 'Please input the email!' },
                                    { type: 'email', message: 'Please enter a valid email!' }
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item 
                                name="role" 
                                label="Role" 
                                rules={[
                                    { required: true, message: 'Please input the role!' },
                                    { min: 2, message: 'Role must be at least 2 characters long!' }
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item label="Select Subjects" name="subject" rules={[{ required: true, message: 'Please select at least one subject!' }]}>
                            <Select mode="default" placeholder="Select subject" showSearch>
                                {dataSource.map(subject => (
                                    <Select.Option key={subject.id} value={subject.id}>{subject.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        </Form>
                    </Modal>
                </TabPane>
            </Tabs>
        </div>
    );
};

export default Configration;