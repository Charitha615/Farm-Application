import React, { useState, useEffect } from 'react';
import { Layout,Select, Menu, Card, Table, Button, Modal, Form, Input, Upload, message, Progress, Tabs, Tag, Space } from 'antd';
import { 
  DashboardOutlined, 
  FileSearchOutlined, 
  FileAddOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  UploadOutlined,
  CameraOutlined,
  CommentOutlined
} from '@ant-design/icons';
import '../css/InspectorDashboard.css';

const { Header, Content, Sider } = Layout;
const { TabPane } = Tabs;
const { TextArea } = Input;

const FieldInspectorDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [assignments, setAssignments] = useState([]);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [reportForm] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Mock data - replace with API calls
  useEffect(() => {
    setAssignments([
      {
        id: 1,
        claimId: 'CL-2023-001',
        farmerName: 'John Doe',
        location: 'Western Province',
        claimDate: '2023-05-15',
        damageType: 'Flood',
        status: 'assigned',
        progress: 30
      },
      {
        id: 2,
        claimId: 'CL-2023-002',
        farmerName: 'Jane Smith',
        location: 'Central Province',
        claimDate: '2023-05-18',
        damageType: 'Drought',
        status: 'in-progress',
        progress: 65
      },
      {
        id: 3,
        claimId: 'CL-2023-003',
        farmerName: 'Robert Johnson',
        location: 'Southern Province',
        claimDate: '2023-05-20',
        damageType: 'Pest',
        status: 'completed',
        progress: 100
      }
    ]);
  }, []);

  const handleMenuClick = (e) => {
    setActiveTab(e.key);
  };

  const showReportModal = (assignment) => {
    setCurrentAssignment(assignment);
    setIsReportModalVisible(true);
  };

  const handleReportSubmit = (values) => {
    setUploading(true);
    // Here you would typically upload to your API
    console.log('Report submitted:', values);
    setTimeout(() => {
      setUploading(false);
      setIsReportModalVisible(false);
      message.success('Report submitted successfully!');
      // Update assignment status
      setAssignments(assignments.map(a => 
        a.id === currentAssignment.id ? {...a, status: 'completed', progress: 100} : a
      ));
    }, 1500);
  };

  const handleStatusChange = (assignmentId, status) => {
    // Update assignment status
    setAssignments(assignments.map(a => 
      a.id === assignmentId ? {...a, status} : a
    ));
    message.success(`Status updated to ${status}`);
  };

  const props = {
    onRemove: (file) => {
      setFileList(fileList.filter(f => f.uid !== file.uid));
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
  };

  const renderStatusTag = (status) => {
    switch(status) {
      case 'assigned':
        return <Tag color="orange">Assigned</Tag>;
      case 'in-progress':
        return <Tag color="blue">In Progress</Tag>;
      case 'completed':
        return <Tag color="green">Completed</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div className="logo">Field Inspector</div>
        <Menu 
          theme="dark" 
          mode="inline" 
          selectedKeys={[activeTab]}
          onClick={handleMenuClick}
        >
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
            Dashboard
          </Menu.Item>
          <Menu.Item key="assignments" icon={<FileSearchOutlined />}>
            Assignments
          </Menu.Item>
          <Menu.Item key="reports" icon={<FileAddOutlined />}>
            Inspection Reports
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Header style={{ padding: 0, background: '#fff' }}>
          <div className="header-content">
            <h2>Field Inspector Dashboard</h2>
            <Button type="text">Logout</Button>
          </div>
        </Header>

        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          {activeTab === 'dashboard' && (
            <div className="dashboard-overview">
              <div className="stats-grid">
                <Card>
                  <h3>Assigned Claims</h3>
                  <p className="stat-value">{assignments.filter(a => a.status === 'assigned').length}</p>
                </Card>
                <Card>
                  <h3>In Progress</h3>
                  <p className="stat-value">{assignments.filter(a => a.status === 'in-progress').length}</p>
                </Card>
                <Card>
                  <h3>Completed</h3>
                  <p className="stat-value">{assignments.filter(a => a.status === 'completed').length}</p>
                </Card>
                <Card>
                  <h3>Pending Review</h3>
                  <p className="stat-value">{assignments.filter(a => a.progress < 100).length}</p>
                </Card>
              </div>

              <Card title="Recent Assignments" style={{ marginTop: 24 }}>
                <Table 
                  columns={[
                    { title: 'Claim ID', dataIndex: 'claimId' },
                    { title: 'Farmer', dataIndex: 'farmerName' },
                    { title: 'Damage Type', dataIndex: 'damageType' },
                    { 
                      title: 'Status', 
                      dataIndex: 'status',
                      render: (status) => renderStatusTag(status)
                    },
                    { 
                      title: 'Progress', 
                      dataIndex: 'progress',
                      render: (progress) => (
                        <Progress percent={progress} size="small" />
                      )
                    },
                    {
                      title: 'Action',
                      render: (_, record) => (
                        <Space>
                          <Button 
                            type="link" 
                            onClick={() => showReportModal(record)}
                            disabled={record.status === 'completed'}
                          >
                            Submit Report
                          </Button>
                        </Space>
                      )
                    }
                  ]}
                  dataSource={assignments}
                  rowKey="id"
                  pagination={false}
                />
              </Card>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="assignments-section">
              <Tabs defaultActiveKey="all">
                <TabPane tab="All Assignments" key="all">
                  <Table 
                    columns={[
                      { title: 'Claim ID', dataIndex: 'claimId' },
                      { title: 'Farmer', dataIndex: 'farmerName' },
                      { title: 'Location', dataIndex: 'location' },
                      { title: 'Claim Date', dataIndex: 'claimDate' },
                      { title: 'Damage Type', dataIndex: 'damageType' },
                      { 
                        title: 'Status', 
                        dataIndex: 'status',
                        render: (status) => renderStatusTag(status)
                      },
                      {
                        title: 'Action',
                        render: (_, record) => (
                          <Space>
                            <Button 
                              type="primary" 
                              onClick={() => showReportModal(record)}
                              disabled={record.status === 'completed'}
                            >
                              {record.status === 'assigned' ? 'Start Inspection' : 'Continue'}
                            </Button>
                          </Space>
                        )
                      }
                    ]}
                    dataSource={assignments}
                    rowKey="id"
                  />
                </TabPane>
                <TabPane tab="Assigned" key="assigned">
                  <Table 
                    columns={[
                      { title: 'Claim ID', dataIndex: 'claimId' },
                      { title: 'Farmer', dataIndex: 'farmerName' },
                      { title: 'Location', dataIndex: 'location' },
                      { title: 'Damage Type', dataIndex: 'damageType' },
                      {
                        title: 'Action',
                        render: (_, record) => (
                          <Button 
                            type="primary" 
                            onClick={() => showReportModal(record)}
                          >
                            Start Inspection
                          </Button>
                        )
                      }
                    ]}
                    dataSource={assignments.filter(a => a.status === 'assigned')}
                    rowKey="id"
                  />
                </TabPane>
                <TabPane tab="In Progress" key="in-progress">
                  <Table 
                    columns={[
                      { title: 'Claim ID', dataIndex: 'claimId' },
                      { title: 'Farmer', dataIndex: 'farmerName' },
                      { title: 'Location', dataIndex: 'location' },
                      { title: 'Damage Type', dataIndex: 'damageType' },
                      { 
                        title: 'Progress', 
                        dataIndex: 'progress',
                        render: (progress) => (
                          <Progress percent={progress} size="small" />
                        )
                      },
                      {
                        title: 'Action',
                        render: (_, record) => (
                          <Button 
                            type="primary" 
                            onClick={() => showReportModal(record)}
                          >
                            Continue
                          </Button>
                        )
                      }
                    ]}
                    dataSource={assignments.filter(a => a.status === 'in-progress')}
                    rowKey="id"
                  />
                </TabPane>
                <TabPane tab="Completed" key="completed">
                  <Table 
                    columns={[
                      { title: 'Claim ID', dataIndex: 'claimId' },
                      { title: 'Farmer', dataIndex: 'farmerName' },
                      { title: 'Location', dataIndex: 'location' },
                      { title: 'Damage Type', dataIndex: 'damageType' },
                      { title: 'Claim Date', dataIndex: 'claimDate' }
                    ]}
                    dataSource={assignments.filter(a => a.status === 'completed')}
                    rowKey="id"
                  />
                </TabPane>
              </Tabs>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="reports-section">
              <Card title="Inspection Reports">
                <Table 
                  columns={[
                    { title: 'Claim ID', dataIndex: 'claimId' },
                    { title: 'Farmer', dataIndex: 'farmerName' },
                    { title: 'Inspection Date', dataIndex: 'claimDate' },
                    { title: 'Damage Type', dataIndex: 'damageType' },
                    { 
                      title: 'Status', 
                      dataIndex: 'status',
                      render: (status) => renderStatusTag(status)
                    },
                    {
                      title: 'Action',
                      render: (_, record) => (
                        <Space>
                          <Button 
                            type="link" 
                            onClick={() => showReportModal(record)}
                          >
                            View/Edit
                          </Button>
                        </Space>
                      )
                    }
                  ]}
                  dataSource={assignments.filter(a => a.status !== 'assigned')}
                  rowKey="id"
                />
              </Card>
            </div>
          )}

          {/* Inspection Report Modal */}
          <Modal
            title={`Inspection Report - ${currentAssignment?.claimId || ''}`}
            visible={isReportModalVisible}
            onCancel={() => setIsReportModalVisible(false)}
            footer={null}
            width={800}
          >
            <Form
              form={reportForm}
              layout="vertical"
              onFinish={handleReportSubmit}
              initialValues={{
                recommendation: 'approve'
              }}
            >
              <Form.Item
                label="Findings"
                name="findings"
                rules={[{ required: true, message: 'Please enter your findings' }]}
              >
                <TextArea rows={4} placeholder="Describe your findings during the inspection" />
              </Form.Item>

              <Form.Item
                label="Photo/Video Evidence"
              >
                <Upload {...props}>
                  <Button icon={<UploadOutlined />}>Select Files</Button>
                </Upload>
                <div style={{ marginTop: 8 }}>
                  <Button 
                    type="dashed" 
                    icon={<CameraOutlined />}
                    style={{ marginRight: 8 }}
                  >
                    Take Photo
                  </Button>
                  <small>Maximum 10 files (jpg, png, mp4)</small>
                </div>
              </Form.Item>

              <Form.Item
                label="Comments/Recommendations"
                name="comments"
                rules={[{ required: true, message: 'Please enter your comments' }]}
              >
                <TextArea rows={3} placeholder="Add any additional comments or recommendations" />
              </Form.Item>

              <Form.Item
                label="Recommendation"
                name="recommendation"
                rules={[{ required: true, message: 'Please select a recommendation' }]}
              >
                <Select>
                  <Select.Option value="approve">Recommend Approval</Select.Option>
                  <Select.Option value="reject">Recommend Rejection</Select.Option>
                  <Select.Option value="further-review">Requires Further Review</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={uploading}
                    icon={<CheckCircleOutlined />}
                  >
                    Submit Report
                  </Button>
                  <Button 
                    onClick={() => {
                      handleStatusChange(currentAssignment.id, 'in-progress');
                      setIsReportModalVisible(false);
                    }}
                    icon={<CloseCircleOutlined />}
                  >
                    Save as Draft
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default FieldInspectorDashboard;