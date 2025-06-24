import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Select, 
  Menu, 
  Card, 
  Table, 
  Button, 
  notification, 
  Modal, 
  Form, 
  Input, 
  Upload, 
  message, 
  Progress, 
  Tabs, 
  Tag, 
  Space,
  Spin,
  Descriptions,
  Divider
} from 'antd';
import { 
  DashboardOutlined, 
  FileSearchOutlined, 
  FileAddOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  UploadOutlined,
  CameraOutlined,
  CommentOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import axios from 'axios';
import '../css/InspectorDashboard.css';

const { Header, Content, Sider } = Layout;
const { TabPane } = Tabs;
const { TextArea } = Input;

// API endpoints
const ASSIGNMENTS_API_URL = 'http://localhost/firebase-auth/api/insurance/insurance_applications.php';

const FieldInspectorDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [assignments, setAssignments] = useState([]);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [reportForm] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch assignments from API
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        // In a real app, you would get the inspector_id from auth context or props
        const inspectorId = '-OTTJ0VSl5waPwL3cvkQ'; // Replace with actual inspector ID
        const response = await axios.get(`${ASSIGNMENTS_API_URL}?inspector_id=${inspectorId}`);
        
        // Convert object to array with IDs if needed
        let assignmentsData = [];
        if (response.data && typeof response.data === 'object') {
          assignmentsData = Object.entries(response.data).map(([id, assignment]) => ({ 
            id, 
            ...assignment,
            status: getStatusFromApiStatus(assignment.status),
            progress: getProgressFromStatus(assignment.status)
          }));
        } else if (Array.isArray(response.data)) {
          assignmentsData = response.data.map(assignment => ({
            ...assignment,
            status: getStatusFromApiStatus(assignment.status),
            progress: getProgressFromStatus(assignment.status)
          }));
        }
        
        setAssignments(assignmentsData);
      } catch (error) {
        notification.error({ 
          message: 'Failed to fetch assignments', 
          description: error.message 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  // Helper functions to map API status to UI status
  const getStatusFromApiStatus = (apiStatus) => {
    switch(apiStatus) {
      case 'pending':
        return 'assigned';
      case 'approved':
      case 'rejected':
        return 'completed';
      default:
        return 'assigned';
    }
  };

  const getProgressFromStatus = (status) => {
    switch(status) {
      case 'pending':
        return 30;
      case 'approved':
      case 'rejected':
        return 100;
      default:
        return 0;
    }
  };

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

  const downloadPdf = (assignment) => {
    // In a real app, this would call an API endpoint to generate/download PDF
    message.info(`Generating PDF for ${assignment.id}`);
    console.log('Downloading PDF for:', assignment);
    // Simulate PDF download
    setTimeout(() => {
      message.success(`PDF downloaded for ${assignment.id}`);
    }, 1000);
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
          <Spin spinning={loading}>
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
                      { title: 'Application ID', dataIndex: 'id' },
                      { 
                        title: 'Type', 
                        dataIndex: 'application_type',
                        render: type => (
                          <Tag color={type === 'new_claim' ? 'blue' : 'purple'}>
                            {type === 'new_claim' ? 'New Claim' : 'Renewal'}
                          </Tag>
                        )
                      },
                      { title: 'Claim Amount', dataIndex: 'claim_amount' },
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
                            {record.status === 'completed' && (
                              <Button 
                                type="link" 
                                icon={<DownloadOutlined />}
                                onClick={() => downloadPdf(record)}
                              >
                                PDF
                              </Button>
                            )}
                          </Space>
                        )
                      }
                    ]}
                    dataSource={assignments.slice(0, 5)} // Show only recent 5
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
                        { title: 'Application ID', dataIndex: 'id' },
                        { 
                          title: 'Type', 
                          dataIndex: 'application_type',
                          render: type => (
                            <Tag color={type === 'new_claim' ? 'blue' : 'purple'}>
                              {type === 'new_claim' ? 'New Claim' : 'Renewal'}
                            </Tag>
                          )
                        },
                        { title: 'Claim Amount', dataIndex: 'claim_amount' },
                        { title: 'Application Date', dataIndex: 'application_date' },
                        { title: 'Policy ID', dataIndex: 'policy_id' },
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
                              {record.status === 'completed' && (
                                <Button 
                                  icon={<DownloadOutlined />}
                                  onClick={() => downloadPdf(record)}
                                >
                                  PDF
                                </Button>
                              )}
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
                        { title: 'Application ID', dataIndex: 'id' },
                        { title: 'Claim Amount', dataIndex: 'claim_amount' },
                        { title: 'Application Date', dataIndex: 'application_date' },
                        { title: 'Policy ID', dataIndex: 'policy_id' },
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
                        { title: 'Application ID', dataIndex: 'id' },
                        { title: 'Claim Amount', dataIndex: 'claim_amount' },
                        { title: 'Application Date', dataIndex: 'application_date' },
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
                        { title: 'Application ID', dataIndex: 'id' },
                        { title: 'Claim Amount', dataIndex: 'claim_amount' },
                        { title: 'Application Date', dataIndex: 'application_date' },
                        { title: 'Policy ID', dataIndex: 'policy_id' },
                        { title: 'Status', dataIndex: 'status', render: renderStatusTag },
                        {
                          title: 'Action',
                          render: (_, record) => (
                            <Button 
                              icon={<DownloadOutlined />}
                              onClick={() => downloadPdf(record)}
                            >
                              Download PDF
                            </Button>
                          )
                        }
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
                      { title: 'Application ID', dataIndex: 'id' },
                      { title: 'Claim Amount', dataIndex: 'claim_amount' },
                      { title: 'Application Date', dataIndex: 'application_date' },
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
                            <Button 
                              type="link" 
                              icon={<DownloadOutlined />}
                              onClick={() => downloadPdf(record)}
                            >
                              PDF
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
              title={`Inspection Report - ${currentAssignment?.id || ''}`}
              visible={isReportModalVisible}
              onCancel={() => setIsReportModalVisible(false)}
              footer={null}
              width={800}
            >
              {currentAssignment && (
                <div>
                  <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="Application ID">{currentAssignment.id}</Descriptions.Item>
                    <Descriptions.Item label="Type">
                      <Tag color={currentAssignment.application_type === 'new_claim' ? 'blue' : 'purple'}>
                        {currentAssignment.application_type === 'new_claim' ? 'New Claim' : 'Renewal'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Claim Amount">{currentAssignment.claim_amount}</Descriptions.Item>
                    <Descriptions.Item label="Application Date">{currentAssignment.application_date}</Descriptions.Item>
                    <Descriptions.Item label="Policy ID">{currentAssignment.policy_id}</Descriptions.Item>
                    <Descriptions.Item label="Status">{renderStatusTag(currentAssignment.status)}</Descriptions.Item>
                  </Descriptions>

                  <Divider />

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
                </div>
              )}
            </Modal>
          </Spin>
        </Content>
      </Layout>
    </Layout>
  );
};

export default FieldInspectorDashboard;