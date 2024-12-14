import React, { useState } from 'react';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    MailOutlined,
    CalendarOutlined,
    AppstoreOutlined,
    SettingOutlined,
    HomeOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, Divider, Avatar, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/imgaes/logoITTDTU.png';
import { NavLink } from 'react-router-dom';
import './LeftMenu.css'
import { path,role} from '../../utils';
const { Sider } = Layout;
const { Text } = Typography;

const LeftMenu = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [selectedKeys, setSelectedKeys] = useState(['1']);
    const [openKeys, setOpenKeys] = useState(['sub1']);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user')); // Lấy thông tin người dùng từ localStorage
    const userRole = user ? user.role : null; // Lấy role
    const menuItems = [
        {
            key: '1',
            icon: <HomeOutlined />,
            label: "Home",
            target: path.HOME
           
        },
        
        {
            key: '2',
            icon: <SettingOutlined />,
            label: "Dashboard",
            target: path.DASHBOARD,
            hidden: userRole !== role.RoleAdmin,
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
                    key: '4',
                    label: 'Workspace 1',
                    target: path.Task
                },
                {
                    key: '5',
                    label: 'Workspace 2',
                    target: path.Task
                },

            ],
        },

    ];

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
                    items={menuItems.filter(item=>!item.hidden)}
                />
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

