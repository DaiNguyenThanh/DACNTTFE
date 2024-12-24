import React, { useState } from 'react';
import { Layout, Menu, Input, Badge, Avatar, Dropdown, Space } from 'antd';
import {
  BellOutlined,
  UserOutlined,
  SearchOutlined,
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import './TopNavigation.css';
import logo from '../../assets/imgaes/logoITTDTU.png';
import { NavLink } from 'react-router-dom';
import { path } from '../../utils';
const { Header } = Layout;
const { Search } = Input;

const TopNavigation = () => {
  const { user, logout } = useAuth();
  const [notifications] = useState([
    { id: 1, message: 'Thông báo 1', read: false },
    { id: 2, message: 'Thông báo 2', read: false },
    // Thêm các thông báo khác
  ]);


  // Menu cho Avatar
  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
       Profile
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Setting
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={logout}>
       Logout
      </Menu.Item>
    </Menu>
  );

  // Menu cho Notifications
  const notificationMenu = (
    <Menu style={{ width: 300 }}>
      <Menu.Item key="title" disabled>
        <div style={{ fontWeight: 'bold' }}>Thông báo</div>
      </Menu.Item>
      <Menu.Divider />
      {notifications.map(notification => (
        <Menu.Item key={notification.id}>
          <div className="notification-item">
            <span>{notification.message}</span>
            {!notification.read && (
              <Badge status="processing" style={{ marginLeft: 8 }} />
            )}
          </div>
        </Menu.Item>
      ))}
      <Menu.Divider />
      <Menu.Item key="view-all">
        <a href="/notifications">Xem tất cả thông báo</a>
      </Menu.Item>
    </Menu>
  );

  return (
    <Header className="header">
      <div className="header-left">
    
        <Search
          placeholder="Tìm kiếm..."
          allowClear
          onSearch={value => console.log(value)}
          style={{ width: 250, marginRight: 20 }}
        />

      </div>
      <div className="header-right">
        <Space size={20}>
          <Dropdown
            overlay={notificationMenu}
            trigger={['click']}
            placement="bottomRight"
          >
            <Badge count={notifications.filter(n => !n.read).length}>
              <BellOutlined className="header-icon" />
            </Badge>
          </Dropdown>

          <Dropdown
            overlay={userMenu}
            trigger={['click']}
            placement="bottomRight"
          >
            <Space>
              <Avatar
                src={user?.avatar}
                icon={<UserOutlined />}
                style={{ cursor: 'pointer' }}
              />
              <span className="user-name">{user?.name}</span>
            </Space>
          </Dropdown>
        </Space>
      </div>
    </Header>
  );
};

export default TopNavigation;