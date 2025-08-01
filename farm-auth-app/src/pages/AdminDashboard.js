import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import InspectorManagement from './InspectorManagement';
import AdminLandManagement from './AdminLandManagement';
import AdminClaimManagement from './AdminClaimManagement';
import AdminSupport from './AdminSupport';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Timeline } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  InsuranceOutlined,
  AlertOutlined,
  BarChartOutlined,
  TeamOutlined,
  BellOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import {
  Layout,
  Menu,
  Card,
  Statistic,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  notification,
  Spin,
  Tag,
  Divider,
  Descriptions,
  Space,
  Popconfirm,
  message
} from 'antd';
import '../css/AdminDashboard.css';
import axios from 'axios';
import moment from 'moment';

const { Header, Sider, Content } = Layout;
const { Option } = Select;
const { TextArea } = Input;

// Base URLs for API
const API_BASE_URL = 'http://localhost/firebase-auth/api';
const FARMERS_URL = `${API_BASE_URL}/farmers/profile/farmer.php`;
const INSURANCE_URL = `${API_BASE_URL}/insurance/insurance_policies.php`;
const INSURANCE_APPLICATIONS_URL = `${API_BASE_URL}/insurance/insurance_applications.php`;
const INSPECTORS_URL = `${API_BASE_URL}/inspectors/inspectors.php`;

// Dashboard Overview Component
const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalPolicies: 0,
    activeClaims: 0,
    registeredFarmers: 0,
    availableInspectors: 0
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    policiesByMonth: [],
    claimsByMonth: []
  });

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all stats in parallel
        const [policiesRes, farmersRes, inspectorsRes, claimsRes] = await Promise.all([
          axios.get(INSURANCE_URL),
          axios.get(`${FARMERS_URL}?public=all_farmers`),
          axios.get(`${INSPECTORS_URL}?public=all_inspectors`),
          axios.get(`${API_BASE_URL}/farmers/claims/claims.php`)
        ]);

        // Process policy data for chart
        const policiesByMonth = processDataByMonth(policiesRes.data);
        const claimsByMonth = processDataByMonth(claimsRes.data);

        setStats({
          totalPolicies: policiesRes.data ? Object.keys(policiesRes.data).length : 0,
          activeClaims: claimsRes.data ? Object.values(claimsRes.data).filter(c => c.status === 'active').length : 0,
          registeredFarmers: farmersRes.data ? Object.keys(farmersRes.data).length : 0,
          availableInspectors: inspectorsRes.data ? Object.values(inspectorsRes.data).filter(i => i.status === 'active').length : 0
        });

        setChartData({
          policiesByMonth,
          claimsByMonth
        });
      } catch (error) {
        notification.error({ message: 'Failed to fetch dashboard data', description: error.message });
      } finally {
        setLoading(false);
      }
    };

    // Helper function to process data by month
    const processDataByMonth = (data) => {
      if (!data) return [];

      const monthlyCounts = Array(12).fill(0);

      Object.values(data).forEach(item => {
        const date = item.created_at ? new Date(item.created_at) : new Date();
        const month = date.getMonth();
        monthlyCounts[month]++;
      });

      return monthlyCounts.map((count, index) => ({
        name: new Date(0, index).toLocaleString('default', { month: 'short' }),
        count
      }));
    };

    fetchDashboardData();
  }, []);

  return (
    <div>
      <h2>Dashboard Overview</h2>
      <Spin spinning={loading}>
        <div className="stats-grid">
          <Card>
            <Statistic
              title="Total Policies"
              value={stats.totalPolicies}
              prefix={<FileTextOutlined />}
            />
            <div style={{ marginTop: 16 }}>
              <small>Last 30 days: +12%</small>
            </div>
          </Card>
          <Card>
            <Statistic
              title="Active Claims"
              value={stats.activeClaims}
              prefix={<AlertOutlined />}
            />
            <div style={{ marginTop: 16 }}>
              <small>Pending review: {Math.floor(stats.activeClaims * 0.3)}</small>
            </div>
          </Card>
          <Card>
            <Statistic
              title="Registered Farmers"
              value={stats.registeredFarmers}
              prefix={<UserOutlined />}
            />
            <div style={{ marginTop: 16 }}>
              <small>Active: {Math.floor(stats.registeredFarmers * 0.85)}</small>
            </div>
          </Card>
          <Card>
            <Statistic
              title="Available Inspectors"
              value={stats.availableInspectors}
              prefix={<TeamOutlined />}
            />
            <div style={{ marginTop: 16 }}>
              <small>On assignment: {Math.floor(stats.availableInspectors * 0.4)}</small>
            </div>
          </Card>
        </div>

        <Divider orientation="left">Monthly Statistics</Divider>

        <div className="chart-container">
          <Card title="Insurance Policies by Month" style={{ marginBottom: 24 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.policiesByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#1890ff" name="Policies" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Insurance Claims by Month">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.claimsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="count" fill="#ff4d4f" stroke="#ff4d4f" name="Claims" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Divider orientation="left">Recent Activity</Divider>

        <Card>
          <Timeline mode="alternate">
            <Timeline.Item color="green">New policy created for farmer ID: F10025</Timeline.Item>
            <Timeline.Item color="blue">Claim submitted for policy ID: P20230045</Timeline.Item>
            <Timeline.Item color="red">System maintenance scheduled for tomorrow</Timeline.Item>
            <Timeline.Item color="gray">New inspector registered: John Smith</Timeline.Item>
          </Timeline>
        </Card>
      </Spin>
    </div>
  );
};

// Farmer Management Component
const FarmerManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch farmers data
  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${FARMERS_URL}?public=all_farmers`);
        // Convert object to array if needed
        const farmersData = Array.isArray(response.data) ? response.data : Object.values(response.data);
        setFarmers(farmersData);
      } catch (error) {
        notification.error({ message: 'Failed to fetch farmers', description: error.message });
      } finally {
        setLoading(false);
      }
    };

    fetchFarmers();
  }, []);

  const handleSaveFarmer = async (values) => {
    try {
      setModalLoading(true);
      if (selectedFarmer) {
        // Update existing farmer
        await axios.put(FARMERS_URL, {
          ...values,
          uid: selectedFarmer.uid
        });
        notification.success({ message: 'Farmer updated successfully' });
      } else {
        // Register new farmer - Note: This endpoint might need to be adjusted based on your API
        await axios.post(`${API_BASE_URL}/farmers/register.php`, {
          ...values,
          password: 'defaultPassword123',
          language: 'en'
        });
        notification.success({ message: 'Farmer registered successfully' });
      }

      // Refresh farmers list
      const response = await axios.get(`${FARMERS_URL}?public=all_farmers`);
      const farmersData = Array.isArray(response.data) ? response.data : Object.values(response.data);
      setFarmers(farmersData);

      setIsModalVisible(false);
      setSelectedFarmer(null);
    } catch (error) {
      notification.error({
        message: `Failed to ${selectedFarmer ? 'update' : 'register'} farmer`,
        description: error.response?.data?.message || error.message
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleStatusChange = async (uid, newStatus) => {
    try {
      await axios.put(FARMERS_URL, {
        uid,
        status: newStatus
      });
      notification.success({ message: `Farmer status updated to ${newStatus}` });

      // Refresh farmers list
      const response = await axios.get(`${FARMERS_URL}?public=all_farmers`);
      const farmersData = Array.isArray(response.data) ? response.data : Object.values(response.data);
      setFarmers(farmersData);
    } catch (error) {
      notification.error({
        message: 'Failed to update farmer status',
        description: error.response?.data?.message || error.message
      });
    }
  };

  const FarmerModal = ({ visible, onCancel, farmer, onSave, loading }) => {
    const [form] = Form.useForm();

    useEffect(() => {
      if (farmer) {
        form.setFieldsValue({
          full_name: farmer.full_name,
          nic: farmer.nic,
          email: farmer.email,
          phone: farmer.phone,
          address: farmer.address,
          status: farmer.status
        });
      } else {
        form.resetFields();
      }
    }, [farmer, form]);

    return (
      <Modal
        title={farmer ? "Edit Farmer" : "Add Farmer"}
        open={visible}
        onCancel={onCancel}
        footer={null}
        forceRender
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onSave}
        >
          <Form.Item
            label="Full Name"
            name="full_name"
            rules={[{ required: true, message: 'Please input full name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="NIC"
            name="nic"
            rules={[{ required: true, message: 'Please input NIC!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Please input email!' }]}
          >
            <Input type="email" />
          </Form.Item>
          <Form.Item
            label="Phone"
            name="phone"
            rules={[{ required: true, message: 'Please input phone number!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Address"
            name="address"
            rules={[{ required: true, message: 'Please input address!' }]}
          >
            <Input.TextArea />
          </Form.Item>
          {farmer && (
            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: 'Please select status!' }]}
            >
              <Select>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
                <Option value="pending">Pending</Option>
              </Select>
            </Form.Item>
          )}
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  return (
    <div>
      <div className="section-header">
        <h2>Farmer Management</h2>
        <Button type="primary" onClick={() => setIsModalVisible(true)}>
          Add Farmer
        </Button>
      </div>
      <Spin spinning={loading}>
        <Table
          columns={[
            { title: 'Name', dataIndex: 'full_name' },
            { title: 'NIC', dataIndex: 'nic' },
            { title: 'Email', dataIndex: 'email' },
            { title: 'Phone', dataIndex: 'phone' },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (status, record) => (
                <Select
                  value={status}
                  onChange={(value) => handleStatusChange(record.uid, value)}
                  style={{ width: 120 }}
                >
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                  <Option value="pending">Pending</Option>
                </Select>
              )
            },
            {
              title: 'Action',
              render: (_, record) => (
                <Button
                  type="link"
                  onClick={() => {
                    setSelectedFarmer(record);
                    setIsModalVisible(true);
                  }}
                >
                  Edit
                </Button>
              )
            }
          ]}
          dataSource={farmers}
          rowKey="uid"
        />
      </Spin>
      <FarmerModal
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedFarmer(null);
        }}
        farmer={selectedFarmer}
        onSave={handleSaveFarmer}
        loading={modalLoading}
      />
    </div>
  );
};

// Insurance Modal Component
const InsuranceModal = ({ visible, onCancel, insurance, onSave, loading, farmers }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (insurance) {
      form.setFieldsValue({
        farmer_id: insurance.farmer_id,
        crop_type: insurance.crop_type,
        land_size: insurance.land_size,
        location: insurance.location,
        expected_yield: insurance.expected_yield,
        season: insurance.season,
        coverage_type: insurance.coverage_type,
        start_date: insurance.start_date ? moment(insurance.start_date) : null,
        end_date: insurance.end_date ? moment(insurance.end_date) : null,
      });
    } else {
      form.resetFields();
    }
  }, [insurance, form]);

  return (
    <Modal
      title={insurance ? "Edit Insurance" : "Add Insurance"}
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
          label="Farmer"
          name="farmer_id"
          rules={[{ required: true, message: 'Please select farmer!' }]}
        >
          <Select showSearch optionFilterProp="children">
            {farmers.map(farmer => (
              <Option key={farmer.uid} value={farmer.uid}>
                {farmer.full_name} (NIC: {farmer.nic})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Crop Type"
          name="crop_type"
          rules={[{ required: true, message: 'Please select crop type!' }]}
        >
          <Select>
            <Option value="basmati">Basmati Rice</Option>
            <Option value="jasmine">Jasmine Rice</Option>
            <Option value="brown">Brown Rice</Option>
            <Option value="white">White Rice</Option>
            <Option value="arborio">Arborio Rice (Risotto)</Option>
            <Option value="sticky">Sticky Rice</Option>
            <Option value="black">Black Rice (Forbidden Rice)</Option>
            <Option value="red">Red Rice</Option>
            <Option value="wild">Wild Rice</Option>
            <Option value="sushi">Sushi Rice</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Land Size (acres)"
          name="land_size"
          rules={[{ required: true, message: 'Please input land size!' }]}
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item
          label="Location"
          name="location"
          rules={[{ required: true, message: 'Please input location!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Expected Yield (kg)"
          name="expected_yield"
          rules={[{ required: true, message: 'Please input expected yield!' }]}
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item
          label="Season"
          name="season"
          rules={[{ required: true, message: 'Please select season!' }]}
        >
          <Select>
            <Option value="yala">Yala</Option>
            <Option value="maha">Maha</Option>
            <Option value="off-season">Off Season</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Coverage Type"
          name="coverage_type"
          rules={[{ required: true, message: 'Please select coverage type!' }]}
        >
          <Select>
            <Option value="full">Full Coverage</Option>
            <Option value="partial">Partial Coverage</Option>
            <Option value="catastrophic">Catastrophic Only</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Start Date"
          name="start_date"
          rules={[{ required: true, message: 'Please select start date!' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="End Date"
          name="end_date"
          rules={[{ required: true, message: 'Please select end date!' }]}
        >
          <DatePicker style={{ width: '100%' }} />
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

// Insurance Application Modal Component
const ApplicationModal = ({ visible, onCancel, application, onSave, loading, inspectors }) => {
  const [form] = Form.useForm();
  const [action, setAction] = useState('');

  useEffect(() => {
    if (application) {
      form.setFieldsValue({
        status: application.status,
        notes: application.notes || '',
        inspector_id: application.inspector_id || ''
      });
    } else {
      form.resetFields();
    }
  }, [application, form]);

  const handleAction = (act) => {
    setAction(act);
    form.setFieldsValue({ status: act });
  };

  const handleSubmit = (values) => {
    onSave({ ...values, action });
  };

  return (
    <Modal
      title="Process Insurance Application"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button
            type={action === 'approved' ? 'primary' : 'default'}
            icon={<CheckOutlined />}
            onClick={() => handleAction('approved')}
          >
            Approve
          </Button>
          <Button
            type={action === 'rejected' ? 'primary' : 'default'}
            danger
            icon={<CloseOutlined />}
            onClick={() => handleAction('rejected')}
          >
            Reject
          </Button>
        </Space>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        {action === 'approved' && (
          <Form.Item
            label="Assign Inspector"
            name="inspector_id"
            rules={[{ required: true, message: 'Please select inspector!' }]}
          >
            <Select>
              {inspectors.map(inspector => (
                <Option key={inspector.uid} value={inspector.uid}>
                  {inspector.full_name} ({inspector.specialization})
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item
          label="Notes"
          name="notes"
          rules={[{ required: true, message: 'Please enter notes!' }]}
        >
          <TextArea rows={4} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// Insurance Details Component
const InsuranceDetails = ({ insurance, visible, onClose, applications, onProcessApplication }) => {
  return (
    <Modal
      title="Insurance Details"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Farmer ID">{insurance.farmer_id}</Descriptions.Item>
        <Descriptions.Item label="Crop Type">{insurance.crop_type}</Descriptions.Item>
        <Descriptions.Item label="Land Size">{insurance.land_size} acres</Descriptions.Item>
        <Descriptions.Item label="Location">{insurance.location}</Descriptions.Item>
        <Descriptions.Item label="Expected Yield">{insurance.expected_yield} kg</Descriptions.Item>
        <Descriptions.Item label="Season">{insurance.season}</Descriptions.Item>
        <Descriptions.Item label="Coverage Type">{insurance.coverage_type}</Descriptions.Item>
        <Descriptions.Item label="Start Date">{insurance.start_date}</Descriptions.Item>
        <Descriptions.Item label="End Date">{insurance.end_date}</Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={insurance.status === 'active' ? 'green' : insurance.status === 'pending' ? 'orange' : 'red'}>
            {insurance.status}
          </Tag>
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">Applications</Divider>

      <Table
        columns={[
          { title: 'Date', dataIndex: 'application_date' },
          { title: 'Type', dataIndex: 'application_type' },
          {
            title: 'Status',
            dataIndex: 'status',
            render: status => (
              <Tag color={status === 'approved' ? 'green' : status === 'pending' ? 'orange' : 'red'}>
                {status}
              </Tag>
            )
          },
          { title: 'Amount', dataIndex: 'claim_amount' },
          {
            title: 'Action',
            render: (_, record) => (
              record.status === 'pending' ? (
                <Button
                  type="link"
                  onClick={() => onProcessApplication(record)}
                >
                  Process
                </Button>
              ) : (
                <span>Processed</span>
              )
            )
          }
        ]}
        dataSource={applications}
        rowKey="id"
        pagination={false}
      />
    </Modal>
  );
};

// Insurance Management Component
const InsuranceManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [isApplicationModalVisible, setIsApplicationModalVisible] = useState(false);
  const [selectedInsurance, setSelectedInsurance] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [insurances, setInsurances] = useState([]);
  const [applications, setApplications] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [inspectors, setInspectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [appModalLoading, setAppModalLoading] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch insurances
        const insurancesRes = await axios.get(INSURANCE_URL);
        // Convert object to array if needed
        const insurancesData = insurancesRes.data && typeof insurancesRes.data === 'object'
          ? Object.entries(insurancesRes.data).map(([key, value]) => ({ id: key, ...value }))
          : [];
        setInsurances(insurancesData);

        // Fetch farmers
        const farmersRes = await axios.get(`${FARMERS_URL}?public=all_farmers`);
        const farmersData = Array.isArray(farmersRes.data) ? farmersRes.data : Object.values(farmersRes.data);
        setFarmers(farmersData);

        // Fetch inspectors
        const inspectorsRes = await axios.get(INSPECTORS_URL);
        const inspectorsData = inspectorsRes.data && typeof inspectorsRes.data === 'object'
          ? Object.entries(inspectorsRes.data).map(([key, value]) => ({
            uid: key,
            full_name: value.name,
            specialization: value.specialization.join(', '),
            email: value.email,
            phone: value.phone,
            status: value.status,
            license_number: value.license_number,
            address: value.address
          }))
          : [];
        setInspectors(inspectorsData);

      } catch (error) {
        notification.error({ message: 'Failed to fetch data', description: error.message });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch applications when insurance is selected
  useEffect(() => {
    if (selectedInsurance) {
      const fetchApplications = async () => {
        try {
          const res = await axios.get(`${INSURANCE_APPLICATIONS_URL}?policy_id=${selectedInsurance.id}`);

          // Transform the data to include the ID
          const appsData = Object.entries(res.data).map(([id, application]) => ({
            id,
            ...application
          }));

          console.log("Transformed appsData:", appsData);
          setApplications(appsData);
        } catch (error) {
          notification.error({ message: 'Failed to fetch applications', description: error.message });
        }
      };

      fetchApplications();
    }
  }, [selectedInsurance]);

  const handleSaveInsurance = async (values) => {
    try {
      setModalLoading(true);

      if (selectedInsurance) {
        // Update existing insurance
        await axios.put(INSURANCE_URL, {
          id: selectedInsurance.id,
          ...values
        });
        notification.success({ message: 'Insurance updated successfully' });
      } else {
        // Create new insurance
        await axios.post(INSURANCE_URL, values);
        notification.success({ message: 'Insurance created successfully' });
      }

      // Refresh insurances list
      const response = await axios.get(INSURANCE_URL);
      const insurancesData = response.data && typeof response.data === 'object'
        ? Object.entries(response.data).map(([key, value]) => ({ id: key, ...value }))
        : [];
      setInsurances(insurancesData);

      setIsModalVisible(false);
      setSelectedInsurance(null);
    } catch (error) {
      notification.error({
        message: `Failed to ${selectedInsurance ? 'update' : 'create'} insurance`,
        description: error.response?.data?.message || error.message
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteInsurance = async (id) => {
    try {
      await axios.delete(`${INSURANCE_URL}?id=${id}`);
      notification.success({ message: 'Insurance deleted successfully' });

      // Refresh insurances list
      const response = await axios.get(INSURANCE_URL);
      const insurancesData = response.data && typeof response.data === 'object'
        ? Object.entries(response.data).map(([key, value]) => ({ id: key, ...value }))
        : [];
      setInsurances(insurancesData);
    } catch (error) {
      notification.error({
        message: 'Failed to delete insurance',
        description: error.response?.data?.message || error.message
      });
    }
  };

  const handleProcessApplication = async (values) => {
    try {
      setAppModalLoading(true);

      console.log("selectedApplication", selectedApplication.id);
      console.log("values", values);

      await axios.put(`${INSURANCE_APPLICATIONS_URL}?id=${selectedApplication.id}`, {
        status: values.action,
        notes: values.notes,
        inspector_id: values.inspector_id || null
      });

      notification.success({ message: `Application ${values.status} successfully` });

      // Refresh applications list
      const res = await axios.get(`${INSURANCE_APPLICATIONS_URL}?policy_id=${selectedInsurance.id}`);
      const appsData = Array.isArray(res.data) ? res.data : Object.values(res.data);
      setApplications(appsData);

      setIsApplicationModalVisible(false);
      setSelectedApplication(null);
    } catch (error) {
      notification.error({
        message: 'Failed to process application',
        description: error.response?.data?.message || error.message
      });
    } finally {
      setAppModalLoading(false);
    }
  };

  const getFarmerName = (farmerId) => {
    const farmer = farmers.find(f => f.uid === farmerId);
    return farmer ? farmer.full_name : 'Unknown';
  };

  return (
    <div>
      <div className="section-header">
        <h2>Insurance Applications</h2>
        <Button type="primary" onClick={() => setIsModalVisible(true)}>
          Add Insurance
        </Button>
      </div>

      <Spin spinning={loading}>
        <Table
          columns={[
            {
              title: 'Farmer',
              dataIndex: 'farmer_id',
              render: farmerId => getFarmerName(farmerId)
            },
            { title: 'Crop Type', dataIndex: 'crop_type' },
            { title: 'Land Size', dataIndex: 'land_size', render: size => `${size} acres` },
            { title: 'Location', dataIndex: 'location' },
            {
              title: 'Status',
              dataIndex: 'status',
              render: status => (
                <Tag color={status === 'active' ? 'green' : status === 'pending' ? 'orange' : 'red'}>
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
                      setIsDetailsVisible(true);
                    }}
                  />
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setSelectedInsurance(record);
                      setIsModalVisible(true);
                    }}
                  />
                  <Popconfirm
                    title="Are you sure to delete this insurance?"
                    onConfirm={() => handleDeleteInsurance(record.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="link" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              )
            }
          ]}
          dataSource={insurances}
          rowKey="id"
        />
      </Spin>

      <InsuranceModal
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedInsurance(null);
        }}
        insurance={selectedInsurance}
        onSave={handleSaveInsurance}
        loading={modalLoading}
        farmers={farmers}
      />

      {selectedInsurance && (
        <InsuranceDetails
          insurance={selectedInsurance}
          visible={isDetailsVisible}
          onClose={() => setIsDetailsVisible(false)}
          applications={applications}
          onProcessApplication={(app) => {
            setSelectedApplication(app);
            setIsApplicationModalVisible(true);
          }}
        />
      )}

      <ApplicationModal
        visible={isApplicationModalVisible}
        onCancel={() => {
          setIsApplicationModalVisible(false);
          setSelectedApplication(null);
        }}
        application={selectedApplication}
        onSave={handleProcessApplication}
        loading={appModalLoading}
        inspectors={inspectors}
      />
    </div>
  );
};

// Main Admin Dashboard Component
const AdminDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: 'farmers', icon: <UserOutlined />, label: 'Farmer Management' },
    { key: 'adminland', icon: <TeamOutlined />, label: 'Land Management' },
    { key: 'insurance', icon: <InsuranceOutlined />, label: 'Insurance Applications' },
    { key: 'claims', icon: <AlertOutlined />, label: 'Claim Management' },
    { key: 'inspectors', icon: <TeamOutlined />, label: 'Inspector Management' },
    { key: 'notifications', icon: <BellOutlined />, label: 'Notifications' },
    { key: 'contact', icon: <BellOutlined />, label: 'Contact' },
    // { key: 'reports', icon: <BarChartOutlined />, label: 'Reports' }
  ];

  const handleMenuClick = ({ key }) => {
    navigate(`/admin/dashboard/${key}`);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div className="logo">AgriInsure Admin</div>
        <Menu
          theme="dark"
          mode="inline"
          items={menuItems}
          defaultSelectedKeys={['dashboard']}
          onClick={handleMenuClick}
        />
      </Sider>

      <Layout>
        <Header style={{ padding: 0, background: '#fff' }}>
          <div className="header-content">
            <h2>Admin Dashboard</h2>
            <Button type="text">Logout</Button>
          </div>
        </Header>

        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <Routes>
            <Route index element={<DashboardOverview />} />
            <Route path="dashboard" element={<DashboardOverview />} />
            <Route path="farmers" element={<FarmerManagement />} />
            <Route path="insurance" element={<InsuranceManagement />} />
            <Route path="inspectors" element={<InspectorManagement />} />
            <Route path="adminland" element={<AdminLandManagement />} />
            <Route path="claims" element={<AdminClaimManagement />} />
            <Route path="contact" element={<AdminSupport />} />
            {/* Add other routes as needed */}
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;