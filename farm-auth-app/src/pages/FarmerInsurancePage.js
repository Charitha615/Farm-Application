import React, { useState, useEffect } from 'react';
import { 
  Tabs, 
  Table, 
  Tag, 
  Spin, 
  Descriptions, 
  Card, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Space,
  Divider,
  notification
} from 'antd';
import { 
  FileTextOutlined, 
  EyeOutlined, 
  CheckOutlined,
  PlusOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const API_BASE_URL = 'http://localhost/firebase-auth/api';
const INSURANCE_URL = `${API_BASE_URL}/insurance/insurance_policies.php`;
const INSURANCE_APPLICATIONS_URL = `${API_BASE_URL}/insurance/insurance_applications.php`;
const FARMER_APPLICATIONS_URL = `${API_BASE_URL}/insurance/farmer_applications.php`;

const FarmerInsurancePage = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [user, setUser] = useState(null);
  const [insurances, setInsurances] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedInsurance, setSelectedInsurance] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);
  const [loadingInsurances, setLoadingInsurances] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [applying, setApplying] = useState(false);

  // Get user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        notification.error({ message: 'Failed to parse user data' });
      }
    }
  }, []);

  // Fetch data based on active tab
  useEffect(() => {
    if (!user?.uid) return;

    if (activeTab === '1') {
      fetchAvailableInsurances();
    } else {
      fetchFarmerApplications();
    }
  }, [activeTab, user]);

  const fetchAvailableInsurances = async () => {
    try {
      setLoadingInsurances(true);
      const response = await axios.get(INSURANCE_URL);
      const insurancesData = response.data && typeof response.data === 'object' 
        ? Object.entries(response.data).map(([key, value]) => ({ id: key, ...value }))
        : [];
      setInsurances(insurancesData);
    } catch (error) {
      notification.error({ message: 'Failed to fetch insurance policies' });
    } finally {
      setLoadingInsurances(false);
    }
  };

  const fetchFarmerApplications = async () => {
    try {
      setLoadingApplications(true);
      const response = await axios.get(`${FARMER_APPLICATIONS_URL}?farmer_id=${user.uid}`);
      const appsData = response.data && typeof response.data === 'object' 
        ? Object.entries(response.data).map(([key, value]) => ({ 
            id: key, 
            ...value,
            application_date: moment(value.application_date).format('YYYY-MM-DD HH:mm'),
            updated_at: moment(value.updated_at).format('YYYY-MM-DD HH:mm')
          }))
        : [];
      setApplications(appsData);
    } catch (error) {
      notification.error({ message: 'Failed to fetch your applications' });
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleApply = (insurance) => {
    setSelectedInsurance(insurance);
    setIsApplyModalVisible(true);
  };

  const handleSubmitApplication = async (values) => {
    if (!user || !selectedInsurance) return;

    try {
      setApplying(true);
      const applicationData = {
        policy_id: selectedInsurance.id,
        farmer_id: user.uid,
        application_type: values.application_type,
        claim_amount: values.claim_amount,
        notes: values.notes || ''
      };

      await axios.post(INSURANCE_APPLICATIONS_URL, applicationData);
      
      notification.success({ 
        message: 'Application submitted successfully',
        description: 'Your insurance application has been submitted for review.'
      });
      
      setIsApplyModalVisible(false);
      setSelectedInsurance(null);
      fetchFarmerApplications(); // Refresh applications list
      setActiveTab('2'); // Switch to applications tab
    } catch (error) {
      notification.error({
        message: 'Failed to submit application',
        description: error.response?.data?.message || error.message
      });
    } finally {
      setApplying(false);
    }
  };

  // Insurance Policies Columns
  const insuranceColumns = [
    { title: 'Crop Type', dataIndex: 'crop_type' },
    { title: 'Coverage Type', dataIndex: 'coverage_type' },
    { title: 'Season', dataIndex: 'season' },
    { title: 'Location', dataIndex: 'location' },
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
            onClick={() => {
              setSelectedInsurance(record);
              setIsDetailsModalVisible(true);
            }}
          >
            Details
          </Button>
          <Button
            type="primary"
            onClick={() => handleApply(record)}
          >
            Apply
          </Button>
        </Space>
      )
    }
  ];

  // Application Columns
  const applicationColumns = [
    {
      title: 'Application ID',
      dataIndex: 'id',
      render: (id) => <span className="truncate-id">{id}</span>,
    },
    {
      title: 'Type',
      dataIndex: 'application_type',
      render: (type) => (
        <Tag color={type === 'new_claim' ? 'blue' : type === 'renewal' ? 'green' : 'orange'}>
          {type.replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: 'Policy ID',
      dataIndex: 'policy_id',
      render: (id) => <span className="truncate-id">{id}</span>,
    },
    {
      title: 'Date',
      dataIndex: 'application_date',
    },
    {
      title: 'Amount (LKR)',
      dataIndex: 'claim_amount',
      render: (amount) => amount ? parseInt(amount).toLocaleString() : 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={status === 'approved' ? 'green' : status === 'rejected' ? 'red' : 'orange'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedApplication(record);
            setIsDetailsModalVisible(true);
          }}
        >
          Details
        </Button>
      ),
    },
  ];

  // Insurance Details Modal
  const InsuranceDetailsModal = ({ insurance, visible, onClose }) => {
    if (!insurance) return null;

    return (
      <Modal
        title={`Insurance Details - ${insurance.crop_type}`}
        open={visible}
        onCancel={onClose}
        footer={null}
        width={700}
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Policy ID">{insurance.id}</Descriptions.Item>
          <Descriptions.Item label="Crop Type">{insurance.crop_type}</Descriptions.Item>
          <Descriptions.Item label="Land Size">{insurance.land_size} acres</Descriptions.Item>
          <Descriptions.Item label="Location">{insurance.location}</Descriptions.Item>
          <Descriptions.Item label="Expected Yield">{insurance.expected_yield} kg</Descriptions.Item>
          <Descriptions.Item label="Season">{insurance.season}</Descriptions.Item>
          <Descriptions.Item label="Coverage Type">{insurance.coverage_type}</Descriptions.Item>
          <Descriptions.Item label="Start Date">{insurance.start_date}</Descriptions.Item>
          <Descriptions.Item label="End Date">{insurance.end_date}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={insurance.status === 'active' ? 'green' : 'red'}>
              {insurance.status}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <div style={{ textAlign: 'center' }}>
          <Button 
            type="primary" 
            size="large"
            onClick={() => {
              onClose();
              handleApply(insurance);
            }}
            icon={<PlusOutlined />}
          >
            Apply for This Insurance
          </Button>
        </div>
      </Modal>
    );
  };

  // Application Details Modal
  const ApplicationDetailsModal = ({ application, visible, onClose }) => {
    if (!application) return null;

    return (
      <Modal
        title={`Application Details - ${application.id}`}
        open={visible}
        onCancel={onClose}
        footer={null}
        width={700}
      >
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Application ID">{application.id}</Descriptions.Item>
          <Descriptions.Item label="Policy ID">{application.policy_id}</Descriptions.Item>
          <Descriptions.Item label="Type">
            <Tag color={application.application_type === 'new_claim' ? 'blue' : 'green'}>
              {application.application_type.replace('_', ' ')}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={application.status === 'approved' ? 'green' : application.status === 'rejected' ? 'red' : 'orange'}>
              {application.status.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Submitted Date">{application.application_date}</Descriptions.Item>
          <Descriptions.Item label="Last Updated">{application.updated_at}</Descriptions.Item>
          <Descriptions.Item label="Claim Amount">
            {application.claim_amount ? `LKR ${parseInt(application.claim_amount).toLocaleString()}` : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Notes">
            {application.notes || 'No additional notes'}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    );
  };

  // Application Form Modal
  const ApplyInsuranceModal = ({ visible, onCancel, onApply, loading }) => {
    const [form] = Form.useForm();

    return (
      <Modal
        title={`Apply for Insurance - ${selectedInsurance?.crop_type}`}
        open={visible}
        onCancel={onCancel}
        footer={null}
        width={600}
      >
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Policy ID">{selectedInsurance?.id}</Descriptions.Item>
          <Descriptions.Item label="Crop Type">{selectedInsurance?.crop_type}</Descriptions.Item>
          <Descriptions.Item label="Coverage Type">{selectedInsurance?.coverage_type}</Descriptions.Item>
          <Descriptions.Item label="Season">{selectedInsurance?.season}</Descriptions.Item>
          <Descriptions.Item label="Farmer">{user?.full_name}</Descriptions.Item>
        </Descriptions>

        <Divider />

        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => onApply(values)}
        >
          <Form.Item
            label="Application Type"
            name="application_type"
            rules={[{ required: true, message: 'Please select application type!' }]}
          >
            <Select>
              <Option value="new_claim">New Claim</Option>
              <Option value="renewal">Policy Renewal</Option>
              <Option value="coverage_change">Coverage Change</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Claim Amount (LKR)"
            name="claim_amount"
            rules={[{ required: true, message: 'Please input claim amount!' }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            label="Notes"
            name="notes"
          >
            <TextArea rows={4} placeholder="Additional information about your application..." />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<CheckOutlined />}
            >
              Submit Application
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  return (
    <div className="farmer-insurance-page">
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Available Insurance" key="1">
            <Spin spinning={loadingInsurances}>
              <Table
                columns={insuranceColumns}
                dataSource={insurances}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </Spin>
          </TabPane>
          <TabPane tab="My Applications" key="2">
            <Spin spinning={loadingApplications}>
              <Table
                columns={applicationColumns}
                dataSource={applications}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </Spin>
          </TabPane>
        </Tabs>
      </Card>

      {/* Modals */}
      {selectedInsurance && (
        <InsuranceDetailsModal
          insurance={selectedInsurance}
          visible={isDetailsModalVisible && activeTab === '1'}
          onClose={() => setIsDetailsModalVisible(false)}
        />
      )}

      {selectedApplication && (
        <ApplicationDetailsModal
          application={selectedApplication}
          visible={isDetailsModalVisible && activeTab === '2'}
          onClose={() => setIsDetailsModalVisible(false)}
        />
      )}

      <ApplyInsuranceModal
        visible={isApplyModalVisible}
        onCancel={() => {
          setIsApplyModalVisible(false);
          setSelectedInsurance(null);
        }}
        onApply={handleSubmitApplication}
        loading={applying}
      />
    </div>
  );
};

export default FarmerInsurancePage;