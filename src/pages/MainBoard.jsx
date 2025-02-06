import React, { useState, useEffect } from 'react';
import { Button, Drawer, Input, Checkbox, Row, Col, Badge, Switch, Menu, Dropdown, Table, Avatar } from 'antd';
import {
  StarOutlined,
  EllipsisOutlined,
  FilterOutlined,
  UserOutlined
} from '@ant-design/icons';
import KanbanBoard from '../components/board/Board';
import { useWorkspace } from "../contexts/WorkspaceProvider";
import { GetAllTaskHistorys, GetTaskHistory } from '../api/taskHistoryApi';

const MainBoard = () => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isHistoryDrawerVisible, setIsHistoryDrawerVisible] = useState(false);
  const { selectedWorkspace } = useWorkspace();
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [filters, setFilters] = useState({
    noMember: false,
    assignedToMe: false,
    noDates: false,
    overdue: false,
    dueNextDay: false,
    markComplete: false,
    markNotComplete: false,
    low: false,
    medium: false,
    high: false,
    status: false
  });
  
  const showDrawer = () => {
    setIsDrawerVisible(true);
  };

  const closeDrawer = () => {
    setIsDrawerVisible(false);
  };

  const showHistoryDrawer = async (taskId) => {
    setIsHistoryDrawerVisible(true);
    try {
      const historyData = await GetAllTaskHistorys(taskId);
      setTrackingHistory(historyData);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu lịch sử:", error);
    }
  };

  const closeHistoryDrawer = () => {
    setIsHistoryDrawerVisible(false);
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: checked,
    }));
  };
  const optionsMenu = (
    <Menu>
        <Menu.Item key="title" disabled>
            <div style={{ fontWeight: 'bold' }}>More</div>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="history-tracking" onClick={showHistoryDrawer}>
            History 
        </Menu.Item>
        <Menu.Item key="another-option">
            Another Option
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="settings">
            <a href="/settings">Cài đặt</a>
        </Menu.Item>
    </Menu>
);

const columns = [
    {
        title: 'Time',
        dataIndex: 'time',
        key: 'time',
    },
    {
        title: 'User',
        dataIndex: 'userName',
        key: 'userName',
        render: (text, record) => (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                    src={record.userImage || undefined}
                    icon={!record.userImage && <UserOutlined />}
                    style={{ marginRight: 8 }}
                />
                {text}
            </div>
        ) 
    },
    {
        title: 'Field Changed',
        dataIndex: 'fieldChanged',
        key: 'fieldChanged',
    },
    {
        title: 'Old Value',
        dataIndex: 'oldValue',
        key: 'oldValue',
    },
    {
        title: 'New Value',
        dataIndex: 'newValue',
        key: 'newValue',
    }
];

  return (
    <div >
      <Row justify="space-between" style={{ paddingRight: 16, paddingLeft: 16, backgroundColor: '#ffffff3d' }}>
        <Col style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <h3>{selectedWorkspace}</h3>
          <Button type="secondary" shape="circle" icon={<StarOutlined />} />
        </Col>
        <Col style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Row style={{ backgroundColor: '#2f80ed' }} >
            <Button type="primary" onClick={showDrawer} icon={<FilterOutlined />}>Filter</Button>
            <Badge count={1} style={{
              backgroundColor: '#52c41a',
            }} /> 
            <Button type="primary">Clear All</Button>
          </Row>
          <Dropdown trigger={['click']} overlay={optionsMenu}>
    <Button type='default' color='default' variant='text' icon={<EllipsisOutlined />}>
        
    </Button>
</Dropdown>
         
        </Col>
      </Row>


      <KanbanBoard filters={filters} showHistoryDrawer={showHistoryDrawer}/>
      <Drawer
        title="Filter Options"
        placement="right"
        onClose={closeDrawer}
        visible={isDrawerVisible}
      >
        <div style={{ marginBottom: '20px' }}>
          <h4>Keywords</h4>
          <Input placeholder="Search keyword" />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <h4>Members</h4>
          <Row>
            <Col span={24}>
              <Checkbox name="noMember" checked={filters.noMember} onChange={handleCheckboxChange}>No member</Checkbox>
            </Col>
            <Col span={24}>
              <Checkbox name="assignedToMe" checked={filters.assignedToMe} onChange={handleCheckboxChange}>Assigned to me</Checkbox>
            </Col>
          </Row>
        </div>
        <div>
          <h4>Due date</h4>
          <Row>
            <Col span={24}>
              <Checkbox name="noDates" checked={filters.noDates} onChange={handleCheckboxChange}>No dates</Checkbox>
            </Col>
            <Col span={24}>
              <Checkbox name="overdue" checked={filters.overdue} onChange={handleCheckboxChange}>Overdue</Checkbox>
            </Col>
            <Col span={24}>
              <Checkbox name="dueNextDay" checked={filters.dueNextDay} onChange={handleCheckboxChange}>Due in next day</Checkbox>
            </Col>
            <Col span={24}>
              <Checkbox name="dueNextDay" checked={filters.dueNextDay} onChange={handleCheckboxChange}>Due in next week</Checkbox>
            </Col>
            <Col span={24}>
              <Checkbox name="dueNextDay" checked={filters.dueNextDay} onChange={handleCheckboxChange}>Due in next month</Checkbox>
            </Col>
          </Row>
        </div>
        <div>
          <h4>Priority</h4>
          <Row>
            <Col span={24}>
              <Checkbox name="low" checked={filters.low} onChange={handleCheckboxChange}>Low</Checkbox>
            </Col>
            <Col span={24}>
              <Checkbox name="medium" checked={filters.medium} onChange={handleCheckboxChange}>Medium</Checkbox>
            </Col>
            <Col span={24}>
              <Checkbox name="high" checked={filters.high} onChange={handleCheckboxChange}>High</Checkbox>
            </Col>
          </Row>
        </div>
        <div>
          <h4>Marked</h4>
          <Row>
            <Col span={24}>
              <Checkbox name="Complete" checked={filters.markComplete} onChange={handleCheckboxChange}>Marked as completed</Checkbox>
            </Col>
            <Col span={24}>
              <Checkbox name="NotComplete" checked={filters.markNotComplete} onChange={handleCheckboxChange}>Not marked as completed</Checkbox>
            </Col>

          </Row>
        </div>
      </Drawer>
      <Drawer
        title="History"
        placement="right"
        onClose={closeHistoryDrawer}
        visible={isHistoryDrawerVisible}
        width={800}
      >
        <Table columns={columns} dataSource={trackingHistory} pagination={false} />
      </Drawer>
    </div>
  );
};

export default MainBoard;