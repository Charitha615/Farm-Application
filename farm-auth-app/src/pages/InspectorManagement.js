import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  notification, 
  Spin, 
  Tag, 
  Space, 
  Popconfirm,
  message,
  Descriptions,
  Divider,
  Tabs,
  Card
} from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { TabPane } = Tabs;

// Base URL for Inspectors API
const INSPECTORS_API_URL = 'http://localhost/firebase-auth/api/inspectors/inspectors.php';
const INSURANCE_APPLICATIONS_API_URL = 'http://localhost/firebase-auth/api/insurance/insurance_applications.php';

const InspectorManagement = () => {
  const [inspectors, setInspectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedInspector, setSelectedInspector] = useState(null);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [insuranceApplications, setInsuranceApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);

  // Fetch inspectors data
  useEffect(() => {
    const fetchInspectors = async () => {
      try {
        setLoading(true);
        const response = await axios.get(INSPECTORS_API_URL);
        
        // Convert object to array with IDs if needed
        let inspectorsData = [];
        if (response.data && typeof response.data === 'object') {
          inspectorsData = Object.entries(response.data).map(([id, inspector]) => ({ 
            id, 
            ...inspector 
          }));
        } else if (Array.isArray(response.data)) {
          inspectorsData = response.data;
        }
        
        setInspectors(inspectorsData);
      } catch (error) {
        notification.error({ 
          message: 'Failed to fetch inspectors', 
          description: error.message 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInspectors();
  }, []);

  const fetchInsuranceApplications = async (inspectorId) => {
    try {
      setApplicationsLoading(true);
      const response = await axios.get(`${INSURANCE_APPLICATIONS_API_URL}?inspector_id=${inspectorId}`);
      
      let applicationsData = [];
      if (response.data && typeof response.data === 'object') {
        applicationsData = Object.entries(response.data).map(([id, application]) => ({ 
          id, 
          ...application 
        }));
      } else if (Array.isArray(response.data)) {
        applicationsData = response.data;
      }
      
      setInsuranceApplications(applicationsData);
    } catch (error) {
      notification.error({ 
        message: 'Failed to fetch insurance applications', 
        description: error.message 
      });
    } finally {
      setApplicationsLoading(false);
    }
  };

  const handleShowDetails = (inspector) => {
    setSelectedInspector(inspector);
    setIsDetailsVisible(true);
    fetchInsuranceApplications(inspector.id);
  };

  const handleSaveInspector = async (values) => {
    try {
      setModalLoading(true);
      
      if (selectedInspector) {
        // Update existing inspector
        await axios.put(INSPECTORS_API_URL, {
          id: selectedInspector.id,
          ...values
        });
        message.success('Inspector updated successfully');
      } else {
        // Create new inspector
        await axios.post(INSPECTORS_API_URL, values);
        message.success('Inspector created successfully');
      }

      // Refresh inspectors list
      const response = await axios.get(INSPECTORS_API_URL);
      let inspectorsData = [];
      if (response.data && typeof response.data === 'object') {
        inspectorsData = Object.entries(response.data).map(([id, inspector]) => ({ 
          id, 
          ...inspector 
        }));
      } else if (Array.isArray(response.data)) {
        inspectorsData = response.data;
      }
      setInspectors(inspectorsData);

      setIsModalVisible(false);
      setSelectedInspector(null);
    } catch (error) {
      notification.error({
        message: `Failed to ${selectedInspector ? 'update' : 'create'} inspector`,
        description: error.response?.data?.error || error.message
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteInspector = async (id) => {
    try {
      await axios.delete(INSPECTORS_API_URL, { 
        data: { id } 
      });
      message.success('Inspector deleted successfully');

      // Refresh inspectors list
      const response = await axios.get(INSPECTORS_API_URL);
      let inspectorsData = [];
      if (response.data && typeof response.data === 'object') {
        inspectorsData = Object.entries(response.data).map(([id, inspector]) => ({ 
          id, 
          ...inspector 
        }));
      } else if (Array.isArray(response.data)) {
        inspectorsData = response.data;
      }
      setInspectors(inspectorsData);
    } catch (error) {
      notification.error({
        message: 'Failed to delete inspector',
        description: error.response?.data?.error || error.message
      });
    }
  };

  const InspectorModal = ({ visible, onCancel, inspector, onSave, loading }) => {
    const [form] = Form.useForm();

    useEffect(() => {
      if (inspector) {
        form.setFieldsValue({
          name: inspector.name,
          email: inspector.email,
          phone: inspector.phone,
          license_number: inspector.license_number,
          specialization: inspector.specialization,
          status: inspector.status || 'active',
          address: inspector.address ? {
            street: inspector.address.street,
            city: inspector.address.city,
            state: inspector.address.state,
            zip: inspector.address.zip,
            country: inspector.address.country
          } : null
        });
      } else {
        form.resetFields();
      }
    }, [inspector, form]);

    return (
      <Modal
        title={inspector ? "Edit Inspector" : "Add Inspector"}
        open={visible}
        onCancel={onCancel}
        footer={null}
        width={700}
        forceRender
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onSave}
        >
          <Form.Item
            label="Full Name"
            name="name"
            rules={[{ required: true, message: 'Please input full name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please input email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Phone"
            name="phone"
            rules={[{ required: true, message: 'Please input phone number!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="License Number"
            name="license_number"
            rules={[{ required: true, message: 'Please input license number!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Specialization"
            name="specialization"
            rules={[{ required: true, message: 'Please select at least one specialization!' }]}
          >
            <Select mode="multiple">
              <Option value="construction">Construction</Option>
              <Option value="electrical">Electrical</Option>
              <Option value="agriculture">Agriculture</Option>
              <Option value="mechanical">Mechanical</Option>
              <Option value="environmental">Environmental</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: 'Please select status!' }]}
          >
            <Select>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>

          <Divider orientation="left">Address</Divider>

          <Form.Item
            label="Street"
            name={['address', 'street']}
            rules={[{ required: true, message: 'Please input street address!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="City"
            name={['address', 'city']}
            rules={[{ required: true, message: 'Please input city!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="State"
            name={['address', 'state']}
            rules={[{ required: true, message: 'Please input state!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="ZIP Code"
            name={['address', 'zip']}
            rules={[{ required: true, message: 'Please input ZIP code!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Country"
            name={['address', 'country']}
            rules={[{ required: true, message: 'Please input country!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'approved':
        return <Tag icon={<CheckCircleOutlined />} color="success">Approved</Tag>;
      case 'pending':
        return <Tag icon={<ClockCircleOutlined />} color="processing">Pending</Tag>;
      case 'rejected':
        return <Tag icon={<CloseCircleOutlined />} color="error">Rejected</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const InspectorDetails = ({ inspector, visible, onClose }) => {
    return (
      <Modal
        title={`Inspector Details - ${inspector.name}`}
        open={visible}
        onCancel={onClose}
        footer={null}
        width={900}
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="Basic Information" key="1">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Name">{inspector.name}</Descriptions.Item>
              <Descriptions.Item label="Email">{inspector.email}</Descriptions.Item>
              <Descriptions.Item label="Phone">{inspector.phone}</Descriptions.Item>
              <Descriptions.Item label="License Number">{inspector.license_number}</Descriptions.Item>
              <Descriptions.Item label="Specialization">
                {Array.isArray(inspector.specialization) ? (
                  inspector.specialization.map(spec => (
                    <Tag key={spec}>{spec}</Tag>
                  ))
                ) : (
                  <Tag>{inspector.specialization}</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={inspector.status === 'active' ? 'green' : 'red'}>
                  {inspector.status}
                </Tag>
              </Descriptions.Item>
              
              {inspector.address && (
                <>
                  <Descriptions.Item label="Street" span={2}>
                    {inspector.address.street}
                  </Descriptions.Item>
                  <Descriptions.Item label="City">{inspector.address.city}</Descriptions.Item>
                  <Descriptions.Item label="State">{inspector.address.state}</Descriptions.Item>
                  <Descriptions.Item label="ZIP Code">{inspector.address.zip}</Descriptions.Item>
                  <Descriptions.Item label="Country">{inspector.address.country}</Descriptions.Item>
                </>
              )}
            </Descriptions>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <FileTextOutlined />
                Insurance Applications ({insuranceApplications.length})
              </span>
            } 
            key="2"
          >
            <Spin spinning={applicationsLoading}>
              <Card title="Assigned Insurance Applications" bordered={false}>
                <Table
                  columns={[
                    { title: 'Application Date', dataIndex: 'application_date' },
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
                      render: status => getStatusTag(status)
                    },
                    { title: 'Policy ID', dataIndex: 'policy_id' },
                    { title: 'Updated At', dataIndex: 'updated_at' }
                  ]}
                  dataSource={insuranceApplications}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                />
              </Card>
            </Spin>
          </TabPane>
        </Tabs>
      </Modal>
    );
  };

  return (
    <div>
      <div className="section-header">
        <h2>Inspector Management</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Add Inspector
        </Button>
      </div>

      <Spin spinning={loading}>
        <Table
          columns={[
            { title: 'Name', dataIndex: 'name' },
            { title: 'Email', dataIndex: 'email' },
            { title: 'Phone', dataIndex: 'phone' },
            { 
              title: 'Specialization', 
              dataIndex: 'specialization',
              render: specialization => (
                Array.isArray(specialization) ? (
                  <span>
                    {specialization.map(spec => (
                      <Tag key={spec}>{spec}</Tag>
                    ))}
                  </span>
                ) : (
                  <Tag>{specialization}</Tag>
                )
              )
            },
            { 
              title: 'Status', 
              dataIndex: 'status',
              render: status => (
                <Tag color={status === 'active' ? 'green' : 'red'}>
                  {status}
                </Tag>
              )
            },
            {
              title: 'Action',
              render: (_, record) => (
                <Space size="middle">
                  <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => handleShowDetails(record)}
                  />
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setSelectedInspector(record);
                      setIsModalVisible(true);
                    }}
                  />
                  <Popconfirm
                    title="Are you sure to delete this inspector?"
                    onConfirm={() => handleDeleteInspector(record.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="link" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              )
            }
          ]}
          dataSource={inspectors}
          rowKey="id"
        />
      </Spin>

      <InspectorModal
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedInspector(null);
        }}
        inspector={selectedInspector}
        onSave={handleSaveInspector}
        loading={modalLoading}
      />

      {selectedInspector && (
        <InspectorDetails
          inspector={selectedInspector}
          visible={isDetailsVisible}
          onClose={() => setIsDetailsVisible(false)}
        />
      )}
    </div>
  );
};

export default InspectorManagement;