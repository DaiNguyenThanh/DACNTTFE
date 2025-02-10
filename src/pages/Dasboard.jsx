import React, { useState, useEffect } from 'react';
import { GetReport, CreateChart, GetAllCharts,UpdateChart,DeleteCharts } from '../api/reportAPI'
import { GetAllStages } from '../api/StageApi'
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Row, Col, Button, Select, Typography, Modal, Card, Dropdown, Menu, Tabs, message } from 'antd';
import {
    BarChartOutlined,
    PieChartOutlined,
    PlusOutlined,
    EllipsisOutlined,
    NumberOutlined
} from '@ant-design/icons';
import { useWorkspace } from '../contexts/WorkspaceProvider'; // Import hook useWorkspace
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const { Text } = Typography;

const Dashboard = () => {
    const [listStage, setListStage] = useState([])
    const [chartType, setChartType] = useState('bar');
    const [selectedField, setSelectedField] = useState();
    const [isModalVisible, setIsModalVisible] = useState(false);

    const [extra_group_field, setextra_group_field] = useState("status")
    const [group_field, setGroupField] = useState("priority")
    const [sub_group_field, setSubGroupField] = useState("by_day")
    const [stage_ids, setSstage_ids] = useState([])
    const [ChartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: "",
                data: [],
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
                borderWidth: 1,
            }

        ],
    })
    const { workspaces } = useWorkspace();
    const [newChartData, setnewChartData] = useState({})
    const [workspace_ids, setworkspace_ids] = useState([""])
    const [isFirstRender, setIsFirstRender] = useState(true);
    const [allCharts, setAllCharts] = useState([]);
    const [editingChart, setEditingChart] = useState(null);

    useEffect(() => {
        console.log(workspaces);
        if (workspaces.length > 0) {
            setworkspace_ids([workspaces[0].id]); // Đặt phần tử đầu tiên làm giá trị mặc định
        }

    }, [workspaces]);
    useEffect(() => {
        const fetchStage = async () => {
            const response = await GetAllStages();
            setListStage(response.data); // Cập nhật listStage
            console.log(listStage)
        };
        fetchStage();
    }, [workspace_ids]);

    useEffect(() => {
        if (isFirstRender) {
            setIsFirstRender(false);
            return;
        }
        fetchChart();
    }, [extra_group_field, group_field, stage_ids, sub_group_field, chartType, workspace_ids]);
    const fetchAllChartsAndReport = async () => {
        try {
            const allChartsResponse = await GetAllCharts();
            console.log('All charts fetched successfully:', allChartsResponse);

            const reportDataPromises = allChartsResponse.data.map(async (chart) => {
                const reportResponse = await GetReport(
                    chart.extra_group_field,
                    chart.group_field,
                    chart.stage_ids,
                    chart.sub_group_field,
                    chart.type,
                    chart.workspace_ids
                );
                return {
                    ...chart,
                    reportData: reportResponse.data,
                    type: chart.type
                };
            });

            const allChartsWithReports = await Promise.all(reportDataPromises);
            setAllCharts(allChartsWithReports);
            console.log('All reports fetched successfully:', allChartsWithReports);
        } catch (error) {
            console.error('Error fetching charts or report:', error.message);
        }
    };
    useEffect(() => {
       

        fetchAllChartsAndReport();
    }, []);

    const options = {
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
            },
            x: {
                barThickness: 5, // Chiều rộng cột cố định
                maxBarThickness: 10, // Chiều rộng cột tối đa
            }
        }
    };
    useEffect(() => {
        const drawChart = () => {
            if (chartType == '' || chartType == null)
                setChartType("bar")
            if (chartType === 'pie') {
                const baseColors = [
                    'rgba(75, 192, 192, 1)',  // Màu xanh nhạt
                    'rgba(54, 162, 235, 1)',  // Màu xanh trung bình
                    'rgba(153, 102, 255, 1)', // Màu xanh đậm
                    'rgba(201, 203, 207, 1)', // Màu xám nhạt
                    'rgba(255, 159, 64, 1)',  // Màu cam
                ];

                setChartData({
                    labels: Array.isArray(newChartData.data) ? newChartData.data.map(item => item.name) : [],
                    datasets: [
                        {
                            label: newChartData.group_field,
                            data: Array.isArray(newChartData.data) ? newChartData.data.map(item => item.count) : [],
                            backgroundColor: baseColors.slice(0, newChartData.data.length), // Màu nền
                            hoverBackgroundColor: baseColors.slice(0, newChartData.data.length).map(color => color.replace('1)', '0.8)')), // Màu khi hover
                            borderColor: 'rgba(0,0,0,1)', // Màu viền cho các phần
                            borderWidth: 1,
                        }
                    ],
                });
            }
            if (chartType === 'bar' && Array.isArray(newChartData.data)) {
                const baseColors = [
                    'rgba(75, 192, 192, 1)',  // Màu xanh nhạt
                    'rgba(75, 192, 220, 1)',  // Màu xanh trung bình
                    'rgba(75, 192, 255, 1)',  // Màu xanh đậm
                ];

                if (Array.isArray(newChartData.data[0].extends)) {
                    const DatasetCollection = newChartData.data.reduce((acc, item) => {
                        if (Array.isArray(item.extends)) {
                            item.extends.forEach((ext, index) => {
                                if (!acc[ext.name]) {
                                    acc[ext.name] = {
                                        label: ext.name,
                                        data: [],
                                        backgroundColor: baseColors[index % baseColors.length],
                                        hoverBackgroundColor: baseColors[index % baseColors.length],
                                        borderColor: 'rgba(0,0,0,1)',
                                        borderWidth: 1,
                                    };
                                }
                                acc[ext.name].data.push(ext.count);
                            });
                        }
                        return acc;
                    }, {});
                    setChartData({
                        labels: newChartData.data.map(item => item.name),
                        datasets: Object.values(DatasetCollection),
                    });
                }
                else {
                    const baseColors = [
                        'rgba(75, 192, 192, 1)',  // Màu xanh nhạt
                        'rgba(54, 162, 235, 1)',  // Màu xanh trung bình
                        'rgba(153, 102, 255, 1)', // Màu xanh đậm
                        'rgba(201, 203, 207, 1)', // Màu xám nhạt
                        'rgba(255, 159, 64, 1)',  // Màu cam
                    ];
                    setChartData({
                        labels: Array.isArray(newChartData.data) ? newChartData.data.map(item => item.name) : [],
                        datasets: [
                            {
                                label: newChartData.group_field,
                                data: Array.isArray(newChartData.data) ? newChartData.data.map(item => item.count) : [],
                                backgroundColor: baseColors.slice(0, newChartData.data.length), // Màu nền mới
                                hoverBackgroundColor: baseColors.slice(0, newChartData.data.length).map(color => color.replace('1)', '0.8)')), // Màu khi hover mới
                                borderColor: 'rgba(0,0,0,1)', // Màu viền cho các phần
                                borderWidth: 1,
                                width: "40px"
                            }
                        ],
                    });
                }
            }


        };
        drawChart();
    }, [newChartData]);
    const fetchChart = async () => {
        try{
        if(group_field==="created_at"||group_field==="deadline"){
            const response = await GetReport(extra_group_field, group_field, stage_ids,sub_group_field, chartType, workspace_ids)
             setnewChartData(response.data)
        }else{
            const response = await GetReport(extra_group_field, group_field, stage_ids,null, chartType, workspace_ids)
            setnewChartData(response.data)
        }
    }catch(e){
        message.error("Get report failed, please try again")
    }
    }

    
    const showModal = () => {

        fetchChart()
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        try {
            if (editingChart) {
                await UpdateChart(
                    editingChart.id,
                    'blue',
                    extra_group_field,
                    group_field,
                    'Updated Chart',
                    stage_ids,
                    sub_group_field,
                    chartType,
                    workspace_ids
                );
                message.success('Cập nhật biểu đồ thành công');
            } else {
                await CreateChart(
                    'blue',
                    extra_group_field,
                    group_field,
                    'New Chart',
                    stage_ids,
                    sub_group_field,
                    chartType,
                    workspace_ids
                );
                message.success('Tạo biểu đồ thành công');
            }
            setIsModalVisible(false);
            setEditingChart(null);
            fetchAllChartsAndReport();
        } catch (error) {
            message.error(editingChart ? 'Cập nhật biểu đồ thất bại' : 'Tạo biểu đồ thất bại');
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };
    const handleChangeGroup = (value) => {
      
        setGroupField(value);

    }
    const handleChangeExtraGroup = (value) => {
      
        setextra_group_field(value);

    }
    const handleChangeTypeChart = (value) => {
        if (chartType === "pie") {
            setextra_group_field("")
        }
        if (chartType === "number") {
            setextra_group_field("")
        }
        setChartType(value)


    }

    const processChartData = (chart) => {
        console.log(chart)
        if (chart.type === 'pie') {

            const baseColors = [
                'rgba(75, 192, 192, 1)',  // Màu xanh nhạt
                'rgba(54, 162, 235, 1)',  // Màu xanh trung bình
                'rgba(153, 102, 255, 1)', // Màu xanh đậm
                'rgba(201, 203, 207, 1)', // Màu xám nhạt
                'rgba(255, 159, 64, 1)',  // Màu cam
            ];

            return {
                ...chart,
                data: {
                    labels: Array.isArray(chart.reportData.data) ? chart.reportData.data.map(item => item.name) : [],
                    datasets: [
                        {
                            label: chart.reportData.group_field,
                            data: Array.isArray(chart.reportData.data) ? chart.reportData.data.map(item => item.count) : [],

                            backgroundColor: baseColors.slice(0, chart.reportData.data.length),
                            hoverBackgroundColor: baseColors.slice(0, chart.reportData.data.length).map(color => color.replace('1)', '0.8)')),
                            borderColor: 'rgba(0,0,0,1)',
                            borderWidth: 1,
                        }
                    ],
                }
            };
        }

        if (chart.type === 'bar' && Array.isArray(chart.reportData.data)) {

            const baseColors = [
                'rgba(75, 192, 192, 1)',  // Màu xanh nhạt
                'rgba(75, 192, 220, 1)',  // Màu xanh trung bình
                'rgba(75, 192, 255, 1)',  // Màu xanh đậm
            ];

            if (Array.isArray(chart.reportData.data[0].extends)) {
                const DatasetCollection = chart.reportData.data.reduce((acc, item) => {
                    if (Array.isArray(item.extends)) {
                        item.extends.forEach((ext, index) => {
                            if (!acc[ext.name]) {
                                acc[ext.name] = {
                                    label: ext.name,
                                    data: [ext.count],
                                    backgroundColor: baseColors[index % baseColors.length],
                                    hoverBackgroundColor: baseColors[index % baseColors.length],
                                    borderColor: 'rgba(0,0,0,1)',
                                    borderWidth: 1,
                                };
                            }
                            acc[ext.name].data.push(ext.count);
                        });
                    }
                    return acc;
                }, {});
                return {
                    ...chart,
                    data: {
                        labels: chart.reportData.data.map(item => item.name),
                        datasets: Object.values(DatasetCollection),
                    }
                };
            } else {

                return {
                    ...chart,
                    data: {
                        labels: Array.isArray(chart.reportData.data) ? chart.reportData.data.map(item => item.name) : [],
                        datasets: [
                            {
                                label: chart.group_field,
                                data: Array.isArray(chart.reportData.data) ? chart.reportData.data.map(item => item.count) : [],
                                backgroundColor: baseColors.slice(0, chart.reportData.data.length),
                                hoverBackgroundColor: baseColors.slice(0, chart.reportData.data.length).map(color => color.replace('1)', '0.8)')),
                                borderColor: 'rgba(0,0,0,1)',
                                borderWidth: 1,
                            }
                        ],
                    }
                };
            }
        }

        return chart;
    };

    const handleEdit = (chart) => {
        setEditingChart(chart);
        setIsModalVisible(true);
    };

    const handleDelete = (chart) => {
        Modal.confirm({
            title: 'Confirm Deletion',
            content: 'Are you sure you want to delete this chart?',
            onOk: async () => {
                try {
                    await DeleteCharts([chart.id]);
                    message.success('Chart deleted successfully');
                    fetchAllChartsAndReport();
                } catch (error) {
                    message.error('Failed to delete chart');
                }
            },
        });
    };

    const handleChangeWorkspace = (value) => {
        setworkspace_ids(value); // Cập nhật workspace_ids
    };

    const handleChangeStage = (value) => {
        setSstage_ids(value); // Cập nhật stage_ids
    };

    return (
        <div style={{ margin: 16 }}>
            <Button type="primary" onClick={showModal} style={{ marginBottom: 8 }}>
                New Chart
            </Button>
            <div className="" >
                <Row style={{ marginTop: 16, marginBottom: 16, flexWrap: 'nowrap' }} gutter={[16, 16]} justify={'start'}>
                    {allCharts
                        .filter(chart => chart.type === 'number')
                        .map((chart, index) => (
                            <Col key={index} span={6}>
                                <Card>
                                    <Typography.Title level={4} style={{ marginTop: 8 }}>Total {chart.reportData.group_field}</Typography.Title>
                                    <Typography.Title type='success' level={3} style={{ marginTop: 8 }}>{chart.reportData.total}</Typography.Title>
                                    <Typography.Title type='secondary' level={5}>Amount {chart.reportData.group_field}</Typography.Title>
                                </Card>
                            </Col>
                        ))}
                </Row>
                <Row gutter={[16, 16]} justify={'start'} style={{flexWrap:'nowrap',overflowX:'scroll'}}>
                    {allCharts.filter(chart => chart.type !== 'number').map((chart, index) => {
                        const processedChart = processChartData(chart);

                        const menu = (
                            <Menu>
                                <Menu.Item key="edit">
                                    <Button type="link" onClick={() => handleEdit(chart)}>Edit</Button>
                                </Menu.Item>
                                <Menu.Item key="delete">
                                    <Button type="link" onClick={() => handleDelete(chart)}>Delete</Button>
                                </Menu.Item>
                            </Menu>
                        );

                        return (
                            <Col key={index} span={8}>
                                <div style={{ height: '400px', minWidth: '500px', backgroundColor: 'white', padding: 16, position: 'relative' }}>
                                    <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
                                        <Button shape="circle" icon={<EllipsisOutlined />} style={{ position: 'absolute', top: 8, right: 8 }} />
                                    </Dropdown>
                                    {processedChart.type === 'bar' && <Bar data={processedChart.data} options={options} />}
                                    {processedChart.type === 'pie' && <Pie data={processedChart.data} options={options} />}
                                    {/* Thêm các loại biểu đồ khác nếu cần */}
                                </div>
                            </Col>
                        );
                    })}
                </Row>

            </div>
            <Modal
                title={editingChart ? "Edit Chart" : "New Chart"}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={() => { setIsModalVisible(false); setEditingChart(null); }}
                width={1200}
            >
                <Row gutter={24}>
                    <Col span={16}>
                        <div style={{ height: '400px', minWidth: '600px' }}>
                            {chartType === 'bar' && <Bar data={ChartData} options={options} />}
                            {chartType === 'pie' && <Pie data={ChartData} options={options} />}
                            {chartType !== 'bar' && chartType !== 'pie' && <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Text type='success' style={{ fontSize: '38px' }}>{newChartData.total}</Text></div>}
                        </div>
                    </Col>
                    <Col span={8}>
                        <Tabs defaultActiveKey="bar" onChange={handleChangeTypeChart}>
                            <Tabs.TabPane tab={<span><BarChartOutlined /> Bar Chart</span>} key="bar" />
                            <Tabs.TabPane tab={<span><PieChartOutlined /> Pie Chart</span>} key="pie" />
                            <Tabs.TabPane tab={<span><NumberOutlined /> Number Chart</span>} key="number" />
                        </Tabs>
                        <div>
                            <div>
                                <Text type="secondary">
                                    Object
                                </Text>
                            </div>
                            <Select style={{ width: '100%', marginBottom: 16 }} onChange={(value) => { handleChangeGroup(value); setSelectedField(value); }} value={group_field}>
                                <Select.Option value="workspace_id">WorkSpace</Select.Option>
                                <Select.Option value="status">Status</Select.Option>
                                <Select.Option value="priority">Priority</Select.Option>
                                <Select.Option value="deadline">Deadline</Select.Option>
                                <Select.Option value="created_at">Created At</Select.Option>
                            </Select>
                            <div>
                                {chartType !== 'pie' && chartType !== 'number' && (
                                    <div>
                                        <div>
                                            <Text type="secondary">
                                                Group Object
                                            </Text>
                                        </div>
                                        <Select style={{ width: '100%', marginBottom: 16 }} onChange={(value) => { handleChangeExtraGroup(value) }} value={extra_group_field}>
    {["workspace_id", "status", "priority", "deadline", "created_at"].filter(option => option !== group_field).map(option => (
        <Select.Option key={option} value={option}>
            {option === "workspace_id" ? "Workspace" : option === "created_at" ? "Created At" : option.charAt(0).toUpperCase() + option.slice(1)}
        </Select.Option>
    ))}
</Select>
                                        {(group_field === "created_at" ||group_field === "deadline")  && (
                                            <Select style={{ width: '100%', marginBottom: 16 }} onChange={(value) => { setSubGroupField(value); fetchChart() }} value={sub_group_field}>
                                                <Select.Option value="by_day">By Day</Select.Option>
                                                <Select.Option value="by_week">By Week</Select.Option>
                                                <Select.Option value="by_month">By Month</Select.Option>
                                                <Select.Option value="by_year">By Year</Select.Option>
                                                <Select.Option value="by_quarter">By Quarter</Select.Option>
                                            </Select>
                                        )}
                                    </div>
                                )}
                            </div>


                            <div>
                                <div>
                                    <Text type="secondary">
                                        Filter
                                    </Text>
                                </div>
                                <Card style={{}}>
                                    <div>
                                        <Text type="secondary" strong>
                                            Workspace
                                        </Text>
                                    </div>
                                    <Select mode="multiple" style={{ width: '100%', marginBottom: 16 }} onChange={handleChangeWorkspace} >
                                        {workspaces?.map(workspace => (
                                            <Select.Option key={workspace.id} value={workspace.id}>{workspace.name}</Select.Option>
                                        ))}
                                    </Select>
                                    <div>
                                        <Text type="secondary" strong>
                                            Stage 
                                        </Text>
                                    </div>
                                    <Select mode="multiple" style={{ width: '100%', marginBottom: 16 }} onChange={handleChangeStage} >
                                        {listStage?.map(stage => (
                                            <Select.Option key={stage.id} value={stage.id}>{stage.name}</Select.Option>
                                        ))}
                                       
                                    </Select>

                                    {/* <Button variant='outlined' icon={<PlusOutlined />}>New</Button> */}
                                </Card>
                            </div>


                        </div>
                    </Col>
                </Row>
            </Modal>

        </div>
    );
};

export default Dashboard;
