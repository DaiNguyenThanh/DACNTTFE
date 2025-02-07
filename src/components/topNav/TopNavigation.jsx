import React, { useState, useEffect } from 'react';
import { Layout, Menu, Input, Badge, Avatar, Dropdown, Space, Modal, Form, Button, Upload, Card, Tabs, Descriptions } from 'antd';
import {
  BellOutlined,
  UserOutlined,
  SearchOutlined,
  LogoutOutlined,
  SettingOutlined,
  UploadOutlined,
  EditOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import './TopNavigation.css';
import logo from '../../assets/imgaes/logoITTDTU.png';
import { NavLink } from 'react-router-dom';
import { path } from '../../utils';
import { GetUnreadCount, GetAllNotifications } from '../../api/notificationAPI';
const { Header } = Layout;
const { Search } = Input;
const { TabPane } = Tabs;

const TopNavigation = () => {
  const { user, logout } = useAuth();
  const [notifications] = useState([
    { id: 1, message: 'Thông báo 1', read: false },
    { id: 2, message: 'Thông báo 2', read: false },
    // Thêm các thông báo khác
  ]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [allNotifications, setAllNotifications] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await GetUnreadCount();
        setUnreadCount(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUnreadCount();
  }, []);

  const handleBellClick = async () => {
    try {
      const response = await GetAllNotifications();
      setAllNotifications(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Menu cho Avatar
  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={showModal}>
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
        <div style={{ fontWeight: 'bold' }}>Notification</div>
      </Menu.Item>
      <Menu.Divider />
      {allNotifications.length === 0 ? (
        <Menu.Item key="no-notifications" disabled>
          <div style={{ textAlign: 'center' }}>No notifications</div>
        </Menu.Item>
      ) : (
        allNotifications.map(notification => (
          <Menu.Item key={notification.id}>
            <div className="notification-item">
              <strong>{notification.heading}</strong>
              <p>{notification.content}</p>
              {notification.read ? null : <Badge status="processing" style={{ marginLeft: 8 }} />}
            </div>
          </Menu.Item>
        ))
      )}
      <Menu.Divider />
      <Menu.Item key="view-all">
        <a href="/notifications">See all notifications</a>
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
            onClick={handleBellClick}
          >
            <Badge count={unreadCount}>
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
      <Modal title="Edit Profile" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <div style={{ maxWidth: 800, margin: "auto", padding: "20px" }}>
          {/* Profile Card */}
          <Card style={{ textAlign: "center", marginBottom: 20 }}>
            <Avatar size={100} icon={<UserOutlined />} />
            <h2 style={{ marginTop: 10 }}>John Doe</h2>
            <p>Software Engineer at XYZ Company</p>
            <Button type="primary" icon={<EditOutlined />}>
              Edit Profile
            </Button>
          </Card>

          {/* Profile Details */}
          <Card>
            <Tabs defaultActiveKey="1">
              <TabPane tab="Overview" key="1">
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Full Name">John Doe</Descriptions.Item>
                  <Descriptions.Item label="Email">john.doe@example.com</Descriptions.Item>
                  <Descriptions.Item label="Phone">+1 (123) 456-7890</Descriptions.Item>
                  <Descriptions.Item label="Location">New York, USA</Descriptions.Item>
                </Descriptions>
              </TabPane>
              <TabPane tab="Settings" key="2">
                <p>Settings content goes here...</p>
              </TabPane>
              <TabPane tab="Activity" key="3">
                <p>Recent activity logs go here...</p>
              </TabPane>
            </Tabs>
          </Card>
        </div>
      </Modal>
    </Header>
  );
};

export default TopNavigation;