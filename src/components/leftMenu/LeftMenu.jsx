import React, { useState } from 'react';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    MailOutlined,
    CalendarOutlined,
    AppstoreOutlined,
    SettingOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, Divider, Avatar, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/imgaes/logoITTDTU.png';
import { NavLink } from 'react-router-dom';
import './LeftMenu.css'
import { path } from '../../utils';
const { Sider } = Layout;
const { Text } = Typography;

const menuItems = [
    {
        key: '1',
        icon: <MailOutlined />,
        label: "Trang chủ",
        target: path.HOME
    },
    {
        key: '2',
        icon: <CalendarOutlined />,
        label: 'Quản lý yêu câu',
        target: "/",
    },
    {
        key: 'sub1',
        label: 'Workspace',
        icon: <AppstoreOutlined />,
        target: path.Task,
        children: [
            {
                key: '3',
                label: 'Workspace 1',
                target: path.Task
            },
            {
                key: '4',
                label: 'Workspace 2',
                target: path.Task
            },

        ],
    },

];

const LeftMenu = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [selectedKeys, setSelectedKeys] = useState(['1']);
    const [openKeys, setOpenKeys] = useState(['sub1']);
    const navigate = useNavigate();

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
                    items={menuItems}
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

