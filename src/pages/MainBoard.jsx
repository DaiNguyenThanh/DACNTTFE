import React, { useState, useEffect ,useCallback} from 'react';
import { Button, Drawer, Input, Checkbox, Row, Col, Badge, Switch, Menu, Dropdown, Table, Avatar } from 'antd';
import {
  StarOutlined,
  EllipsisOutlined,
  FilterOutlined,
  UserOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import KanbanBoard from '../components/board/Board';
import { useWorkspace } from "../contexts/WorkspaceProvider";
import { GetAllTaskHistorys, GetTaskHistory } from '../api/taskHistoryApi';
import { useParams  } from 'react-router-dom';
import { GetWorkspaceDetailAPI } from '../api/workspaceApi';
import { debounce } from "lodash";

const MainBoard = () => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isHistoryDrawerVisible, setIsHistoryDrawerVisible] = useState(false);
  const { workspaceId,taskID } = useParams();
  const [workspace, setWorkspace] = useState(null);
  //const { selectedWorkspace,selectedWorkspaceName } = useWorkspace();
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
    status: false,
    dueNextWeek:false,
    dueNextMonth:false,
    keyword:""
  });
  
const handleSearch = useCallback(
  debounce((value) => {
    setFilters({ keyword: value });
  }, 300), // Đợi 300ms sau khi người dùng ngừng nhập
  []
);
  const showDrawer = () => {
    setIsDrawerVisible(true);
  };

  const closeDrawer = () => {
    setIsDrawerVisible(false);
  };

  const showHistoryDrawer = async (taskId) => {
    setIsHistoryDrawerVisible(true);
    try {
      const historyData = await GetTaskHistory(taskId);
      setTrackingHistory(historyData.data);
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
 

const columns = [
    {
        title: 'Time',
        dataIndex: 'created_at',
        key: 'created_at',
    },
    {
        title: 'User',
        dataIndex: 'user',
        key: 'user',
        render: (text, record) => (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                    src={record.userImage || undefined}
                    icon={!record.userImage && <UserOutlined />}
                    style={{ marginRight: 8 }}
                />
                {record.user ? record.user.name : text}
            </div>
        ) 
    },
    {
        title: 'Field Changed',
        dataIndex: 'field',
        key: 'field',
        render: (text) => {
            if (text === 'assignee_ids') {
                return 'Assigners';
            }
            if (text === 'collaborator_ids') {
              return 'Collaborators';
          }
            return text.charAt(0).toUpperCase() + text.slice(1);
        },
    },
    {
        title: 'Old Value',
        dataIndex: 'old',
        key: 'old',
        render: (text) => {
          if (Array.isArray(text)) {
              return text.map(item => item.name).join(', ');
              
          }
         
          return text?.name || text;
          
      },
    },
    {
        title: 'New Value',
        dataIndex: 'new',
        key: 'new',
        render: (text) => {
            if (Array.isArray(text)) {
                return text.map(item => item.name).join(', ');
                
            }
          
            return text?.name || text;
            
        },
    }
];

  useEffect(() => {
    const fetchWorkspaceDetails = async () => {
      try {
        const workspaceDetails = await GetWorkspaceDetailAPI(workspaceId);
        // Xử lý dữ liệu chi tiết workspace nếu cần
        setWorkspace(workspaceDetails.data);
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết workspace:", error);
      }
    };

    fetchWorkspaceDetails(); // Gọi hàm khi component được mount
  }, [workspaceId]); // Chạy lại khi workspaceId thay đổi
  const clearFilter =()=>{
    setFilters({
      assignedToMe: false,
      noDates: false,
      overdue: false,
      dueNextDay: false,
      markComplete: false,
      markNotComplete: false,
      low: false,
      medium: false,
      high: false,
      status: false,
      dueNextWeek:false,
      dueNextMonth:false,
      keyword:""
    })
  }
  return (
    <div >
      <Row justify="space-between" style={{ paddingRight: 16, paddingLeft: 16,paddingTop:16, backgroundColor: '#ffffff3d' }}>
        <Col style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <h3>{workspace?.name}</h3>
          <Button type="secondary" shape="circle" icon={<StarOutlined />} />
        </Col>
        <Col style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Row style={{ backgroundColor: '#2f80ed' }} >
            <Button type="primary" onClick={showDrawer} icon={<FilterOutlined />}>Filter</Button>
            <Badge count={Object.values(filters).filter(value => value === true).length} style={{
              backgroundColor: '#52c41a',
            }} /> 
            <Button type="primary" color='red' icon={<CloseCircleOutlined />}  onClick={clearFilter}>Clear All</Button>
          </Row>
        
         
        </Col>
      </Row>


      <KanbanBoard filters={filters} showHistoryDrawer={showHistoryDrawer} taskID={taskID}/>
      <Drawer
        title="Filter Options"
        placement="right"
        onClose={closeDrawer}
        visible={isDrawerVisible}
      >
        <div style={{ marginBottom: '20px' }}>
          <h4>Keywords</h4>
          <Input 
  onChange={(e) => handleSearch(e.target.value)} 
  placeholder="Search keyword" 
/>

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
              <Checkbox name="dueNextWeek" checked={filters.dueNextWeek} onChange={handleCheckboxChange}>Due in next week</Checkbox>
            </Col>
            <Col span={24}>
              <Checkbox name="dueNextMonth" checked={filters.dueNextMonth} onChange={handleCheckboxChange}>Due in next month</Checkbox>
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
              <Checkbox name="markComplete" checked={filters.markComplete} onChange={handleCheckboxChange}>Marked as completed</Checkbox>
            </Col>
            <Col span={24}>
              <Checkbox name="markNotComplete" checked={filters.markNotComplete} onChange={handleCheckboxChange}>Not marked as completed</Checkbox>
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