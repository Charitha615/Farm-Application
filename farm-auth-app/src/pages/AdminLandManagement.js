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
  InputNumber
} from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

// Base URL for Lands API
const LANDS_API_URL = 'http://localhost/firebase-auth/api/farmers/lands/list.php';

const AdminLandManagement = () => {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedLand, setSelectedLand] = useState(null);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);

  // Fetch lands data
  useEffect(() => {
    const fetchLands = async () => {
      try {
        setLoading(true);
        const response = await axios.get(LANDS_API_URL);
        
        // Convert object to array with IDs if needed
        let landsData = [];
        if (response.data && typeof response.data === 'object') {
          landsData = Object.entries(response.data).map(([id, land]) => ({ 
            id, 
            ...land 
          }));
        } else if (Array.isArray(response.data)) {
          landsData = response.data;
        }
        
        setLands(landsData);
      } catch (error) {
        notification.error({ 
          message: 'Failed to fetch lands', 
          description: error.message 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLands();
  }, []);

  const handleSaveLand = async (values) => {
    try {
      setModalLoading(true);
      
      if (selectedLand) {
        // Update existing land
        await axios.put(LANDS_API_URL, {
          id: selectedLand.id,
          ...values
        });
        message.success('Land updated successfully');
      } else {
        // Create new land
        await axios.post(LANDS_API_URL, values);
        message.success('Land created successfully');
      }

      // Refresh lands list
      const response = await axios.get(LANDS_API_URL);
      let landsData = [];
      if (response.data && typeof response.data === 'object') {
        landsData = Object.entries(response.data).map(([id, land]) => ({ 
          id, 
          ...land 
        }));
      } else if (Array.isArray(response.data)) {
        landsData = response.data;
      }
      setLands(landsData);

      setIsModalVisible(false);
      setSelectedLand(null);
    } catch (error) {
      notification.error({
        message: `Failed to ${selectedLand ? 'update' : 'create'} land`,
        description: error.response?.data?.error || error.message
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteLand = async (id) => {
    try {
      await axios.delete(LANDS_API_URL, { 
        data: { id } 
      });
      message.success('Land deleted successfully');

      // Refresh lands list
      const response = await axios.get(LANDS_API_URL);
      let landsData = [];
      if (response.data && typeof response.data === 'object') {
        landsData = Object.entries(response.data).map(([id, land]) => ({ 
          id, 
          ...land 
        }));
      } else if (Array.isArray(response.data)) {
        landsData = response.data;
      }
      setLands(landsData);
    } catch (error) {
      notification.error({
        message: 'Failed to delete land',
        description: error.response?.data?.error || error.message
      });
    }
  };

  const LandModal = ({ visible, onCancel, land, onSave, loading }) => {
    const [form] = Form.useForm();

    useEffect(() => {
      if (land) {
        form.setFieldsValue({
          farmer_uid: land.farmer_uid,
          name: land.name,
          province: land.province,
          district: land.district,
          size: land.size,
          coordinates: land.coordinates,
          description: land.description,
          status: land.status || 'active'
        });
      } else {
        form.resetFields();
      }
    }, [land, form]);

    return (
      <Modal
        title={land ? "Edit Land" : "Add Land"}
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
            label="Farmer UID"
            name="farmer_uid"
            rules={[{ required: true, message: 'Please input farmer UID!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Land Name"
            name="name"
            rules={[{ required: true, message: 'Please input land name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Province"
            name="province"
            rules={[{ required: true, message: 'Please select province!' }]}
          >
            <Select>
              <Option value="Western">Western</Option>
              <Option value="Central">Central</Option>
              <Option value="Southern">Southern</Option>
              <Option value="Northern">Northern</Option>
              <Option value="Eastern">Eastern</Option>
              <Option value="North Western">North Western</Option>
              <Option value="North Central">North Central</Option>
              <Option value="Uva">Uva</Option>
              <Option value="Sabaragamuwa">Sabaragamuwa</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="District"
            name="district"
            rules={[{ required: true, message: 'Please input district!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Size (acres)"
            name="size"
            rules={[{ required: true, message: 'Please input size!' }]}
          >
            <InputNumber min={0.1} step={0.1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Coordinates"
            name="coordinates"
            rules={[{ required: true, message: 'Please input coordinates!' }]}
          >
            <Input 
              prefix={<EnvironmentOutlined />} 
              placeholder="6.9271,79.8612" 
            />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

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

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  const LandDetails = ({ land, visible, onClose }) => {
    return (
      <Modal
        title="Land Details"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={700}
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Farmer UID">{land.farmer_uid}</Descriptions.Item>
          <Descriptions.Item label="Name">{land.name}</Descriptions.Item>
          <Descriptions.Item label="Province">{land.province}</Descriptions.Item>
          <Descriptions.Item label="District">{land.district}</Descriptions.Item>
          <Descriptions.Item label="Size">{land.size} acres</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={land.status === 'active' ? 'green' : 
                        land.status === 'pending' ? 'orange' : 'red'}>
              {land.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Coordinates" span={2}>
            <EnvironmentOutlined /> {land.coordinates}
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>
            {land.description || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Created At" span={2}>
            {new Date(land.created_at).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    );
  };

  return (
    <div>
      <div className="section-header">
        <h2>Land Management</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Add Land
        </Button>
      </div>

      <Spin spinning={loading}>
        <Table
          columns={[
            { title: 'Name', dataIndex: 'name' },
            { title: 'Farmer UID', dataIndex: 'farmer_uid' },
            { title: 'Province', dataIndex: 'province' },
            { title: 'District', dataIndex: 'district' },
            { 
              title: 'Size (acres)', 
              dataIndex: 'size',
              render: size => `${size} acres`
            },
            { 
              title: 'Status', 
              dataIndex: 'status',
              render: status => (
                <Tag color={status === 'active' ? 'green' : 
                           status === 'pending' ? 'orange' : 'red'}>
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
                      setSelectedLand(record);
                      setIsDetailsVisible(true);
                    }}
                  />
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setSelectedLand(record);
                      setIsModalVisible(true);
                    }}
                  />
                  <Popconfirm
                    title="Are you sure to delete this land?"
                    onConfirm={() => handleDeleteLand(record.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="link" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              )
            }
          ]}
          dataSource={lands}
          rowKey="id"
        />
      </Spin>

      <LandModal
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedLand(null);
        }}
        land={selectedLand}
        onSave={handleSaveLand}
        loading={modalLoading}
      />

      {selectedLand && (
        <LandDetails
          land={selectedLand}
          visible={isDetailsVisible}
          onClose={() => setIsDetailsVisible(false)}
        />
      )}
    </div>
  );
};

export default AdminLandManagement;