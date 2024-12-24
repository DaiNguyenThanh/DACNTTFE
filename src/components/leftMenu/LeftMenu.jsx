import React, { useState } from 'react';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    MailOutlined,
    CalendarOutlined,
    AppstoreOutlined,
    SettingOutlined,
    PlusCircleOutlined,
    ScheduleOutlined,
    ProjectOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, Divider, Avatar, Typography, Modal, Form, Input, Select, Dropdown, Popconfirm, Radio } from 'antd';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/imgaes/logoITTDTU.png';
import { NavLink } from 'react-router-dom';
import './LeftMenu.css'
import { path, role } from '../../utils';
import { Color } from 'antd/es/color-picker';
const { Sider } = Layout;
const { Text } = Typography;
const user = JSON.parse(localStorage.getItem('user')); // Lấy thông tin người dùng từ localStorage
const userRole = user ? user.role : null;
const LeftMenu = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [selectedKeys, setSelectedKeys] = useState(['1']);
    const [openKeys, setOpenKeys] = useState(['sub1']);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const navigate = useNavigate();

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleMenuClick = (e) => {
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
            navigate(menuItem.target);
        }

    };

    const onOpenChange = (keys) => {
        setOpenKeys(keys);
    };

    const handleOk = () => {
        setIsModalVisible(false);
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
    const handleDeleteWorkspace = () => {
        // Xử lý logic xóa workspace ở đây
        console.log("Xóa workspace");
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
            target: path.HOME,
            hidden: userRole !== role.RoleAdmin
        },
        {
            key: '3',
            icon: <CalendarOutlined />,
            label: 'Request',
            target: "/",
        },
        {
            key: 'sub1',
            label: 'Workspace',
            icon: <AppstoreOutlined />,
            target: path.Task,
            children: [
                {
                    key: 'addWorkspace',
                    //icon:<PlusCircleOutlined />,
                    label: '+ New workspace',
                    onClick: showModal,
                    style: { color: "#686868", fontSize: "11px" },
                    hidden:userRole !== role.RoleAdmin
                },
                {
                    //  icon: <ProjectOutlined />,
                    key: '4',
                    label: (
                        <div >
                            Workspace 1

                            <Dropdown overlay={
                                <Menu>
                                    <Popconfirm title="Are you sure to delete?" onConfirm={() => handleDeleteWorkspace()}>
                                        <Button type="link" >Delete</Button>
                                    </Popconfirm>

                                </Menu>
                            } overlayStyle={{ zIndex: 9999 }}>
                                <Button type="text">...</Button>
                            </Dropdown>  </div>),
                    target: path.Task
                },
                {
                   
                    key: '5',
                    label: (
                        <div >
                            Workspace 2

                            <Dropdown overlay={
                                <Menu>
                                    <Popconfirm title="Are you sure to delete?" onConfirm={() => handleDeleteWorkspace()}>
                                        <Button type="link" >Delete</Button>
                                    </Popconfirm>

                                </Menu>
                            } overlayStyle={{ zIndex: 9999 }}>
                                <Button type="text">...</Button>
                            </Dropdown>  </div>),
                    target: path.Task
                }

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
                <Modal title="Add Workspace" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                    <Form>
                        <Form.Item label="Workspace Name" name="workspaceName" rules={[{ required: true, message: 'Please input the workspace name!' }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Select Users" name="users" rules={[{ required: true, message: 'Please select at least one user!' }]}>
                            <Select mode="multiple" placeholder="Select users" showSearch>
                                <Select.Option value="user1">User 1</Select.Option>
                                <Select.Option value="user2">User 2</Select.Option>
                                <Select.Option value="user3">User 3</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label="Select Todo List State" name="todoState" rules={[{ required: true, message: 'Please select a state!' }]}>
                            <Radio.Group>
                                <Radio value="pending">Pending</Radio>
                                <Radio value="inProgress">In Progress</Radio>
                                <Radio value="completed">Completed</Radio>
                            </Radio.Group>
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

