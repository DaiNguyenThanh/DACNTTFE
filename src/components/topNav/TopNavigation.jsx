import React, { useState, useEffect } from 'react';
import { Layout, Menu, Input, Badge, Avatar, Dropdown, Space, Modal, Form, Button, Upload, Card, Tabs, Descriptions, Tooltip, message } from 'antd';
import {
  BellOutlined,
  UserOutlined,
  SearchOutlined,
  LogoutOutlined,
  SettingOutlined,
  UploadOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import './TopNavigation.css';
import logo from '../../assets/imgaes/logoITTDTU.png';
import { NavLink } from 'react-router-dom';
import { path } from '../../utils';
import { GetUnreadCount, GetAllNotifications, ReadNotification } from '../../api/notificationAPI';
import { CreateFile } from '../../api/fileAPI';
import { patchUserAPI } from '../../api/adminUsers';
import { ChangePassword } from '../../api/authApi';
const { Header } = Layout;
const { Search } = Input;
const { TabPane } = Tabs;

const TopNavigation = () => {
  const { user, logout, reload } = useAuth();
  const [notifications] = useState([
    { id: 1, message: 'Thông báo 1', read: false },
    { id: 2, message: 'Thông báo 2', read: false },
    // Thêm các thông báo khác
  ]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [allNotifications, setAllNotifications] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);


  const [userJob, setUserJob] = useState(user?.job || '');
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userName, setUserName] = useState(user?.name || '');
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
      // Lọc chỉ lấy các thông báo đã đọc
      const readNotifications = response.data.filter(notification => notification.read === true);
      setAllNotifications(readNotifications);
      if (response.message === "Success") {
        setUnreadCount(null);
        await ReadNotification();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const showModal = () => {
    setIsEditing(false)
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleEditProfile = async () => {
    try {

      await patchUserAPI({ id: user.id, field: { key: "name", value: userName } });
      // Gọi lại thông tin người dùng từ useAuth
      setIsEditing(false)
      await reload(); // Giả sử user.reload() là phương thức để gọi lại thông tin người dùng

    } catch (error) {
      console.error('Error uploading avatar:', error.message);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const response = await CreateFile({ file, from: 'avatar' });
        console.log('Avatar uploaded:', response);
        if (response.message === "Success") {
          await patchUserAPI({ id: user.id, field: { key: "avatar_id", value: response.data.id } });
          // Gọi lại thông tin người dùng từ useAuth
          await reload(); // Giả sử user.reload() là phương thức để gọi lại thông tin người dùng
        }
      } catch (error) {
        console.error('Error uploading avatar:', error.message);
      }
    }
  };

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasUpperCase && hasSpecialChar && hasNumber;
  };

  const handleChangePassword = async (values) => {
    if (!validatePassword(values.new_password)) {
        // message.error('Password must contain at least one uppercase letter, one special character, and one number.');
        return;
    }
    try {
        await ChangePassword({ new_password: values.new_password, old_password: values.old_password });
        await reload();
        message.success('Password changed successfully');
    } catch (error) {
        message.error('Error changing password: ' + error.message);
    }
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
      {/* <Menu.Divider /> */}
      {/* <Menu.Item key="view-all">
        <a href="/notifications">See all notifications</a>
      </Menu.Item> */}
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
      <Modal title="Edit Profile" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} footer={null}>
        <div style={{ maxWidth: 800, margin: "auto", padding: "20px" }}>
          {/* Profile Card */}
          <Card style={{ textAlign: "center", marginBottom: 20 }}>
            <Tooltip title="Upload Avatar">
              <Avatar
                size={100}
                src={user?.avatar}
                icon={!user?.avatar && <UserOutlined />}
                onClick={() => document.getElementById('avatarUploadInput').click()}
                className="avatar-upload"
              />
            </Tooltip>
            <input
              id="avatarUploadInput"
              type="file"
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleAvatarUpload}
            />
            <div style={{ marginTop: 10, fontSize: 22, textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
              {isEditing ? (
                <Input
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  style={{ width: '70%', display: 'inline-block', textAlign: 'center' }}
                />
              ) : (
                user?.name
              )}
              {isEditing ? (
                <>
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={handleEditProfile}
                    style={{ marginLeft: 10, marginTop: 0 }}
                  />
                  <Button
                    type="default"
                    icon={<CloseOutlined />}
                    onClick={() => setIsEditing(false)}
                    style={{ marginLeft: 10, marginTop: 0 }}
                  />
                </>
              ) : (
                <Button
                  type="default"
                  icon={<EditOutlined />}
                  onClick={() => setIsEditing(true)}
                  style={{ marginLeft: 10 }}
                />
              )}
            </div>
          </Card>

          {/* Profile Details */}
          <Card>
            <Tabs defaultActiveKey="1">
              <TabPane tab="Overview" key="1">
                <Descriptions bordered column={1}>
                  {/* <Descriptions.Item label="Full Name">John Doe</Descriptions.Item> */}
                  <Descriptions.Item label="Email">{user?.email}</Descriptions.Item>
                  <Descriptions.Item label="Position">{user?.role}</Descriptions.Item>
                  <Descriptions.Item label="Subject">{user?.subject?.name}</Descriptions.Item>
                </Descriptions>
              </TabPane>
              <TabPane tab="Change Password" key="2">
                <Form layout="vertical" onFinish={handleChangePassword}>
                  <Form.Item label="Old Password" name="old_password" required>
                    <Input.Password
                      
                      value={oldPassword}
                      onChange={e => setOldPassword(e.target.value)}
                      placeholder="Enter old password"
                    />
                  </Form.Item>
                  <Form.Item label="New Password" required
                    name="new_password"
                    rules={[
                      { required: true, message: 'Please enter your password!' },
                      { min: 6, message: 'Password must be at least 6 characters!' },
                      {
                        pattern: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])/,
                        message: 'Password must contain at least one uppercase letter, one number, and one special character!'
                      }
                    ]}
                  >
                    <Input.Password
                      name="new_password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </Form.Item>
                  <Form.Item label="Confirm New Password" required
                   name="confirm_password"
                    dependencies={['new_password']}
                    rules={[
                      { required: true, message: 'Please confirm your password!' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('new_password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Passwords do not match!'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                     
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Change Password
                    </Button>
                  </Form.Item>
                </Form>
              </TabPane>
              {/* <TabPane tab="Activity" key="3">
                <p>Recent activity logs go here...</p>
              </TabPane> */}
            </Tabs>
          </Card>
        </div>
      </Modal>
    </Header>
  );
};

export default TopNavigation;