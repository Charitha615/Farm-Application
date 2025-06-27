import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Spin,
  DatePicker,
  Descriptions,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  message,
  notification
} from 'antd';
import {
  EyeOutlined,
  PlusOutlined,
  UploadOutlined,
  CloudOutlined,
  FilePdfOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

const CLAIMS_URL = 'http://localhost/firebase-auth/api/farmers/claims/claims.php';
const POLICIES_URL = 'http://localhost/firebase-auth/api/insurance/insurance_policies.php';
const LANDS_URL = 'http://localhost/firebase-auth/api/farmers/lands/list.php';
const UPLOAD_URL = 'http://localhost/firebase-auth/api/upload.php';

const DamageClaimPage = () => {
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [lands, setLands] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [isFileModalVisible, setIsFileModalVisible] = useState(false);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [loadingPolicies, setLoadingPolicies] = useState(false);
  const [loadingLands, setLoadingLands] = useState(false);
  const [filing, setFiling] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const authToken = localStorage.getItem('token');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setToken(authToken);
        fetchPolicies(parsedUser.uid, authToken);
        fetchLands(parsedUser.uid, authToken);
        fetchClaims(parsedUser.uid, authToken);
      } catch (error) {
        notification.error({ message: 'Failed to parse user data' });
      }
    }
  }, []);

  const fetchClaims = async (farmerId, authToken) => {
    try {
      setLoadingClaims(true);
      const response = await axios.get(`${CLAIMS_URL}?farmer_id=${farmerId}`);
      const claimsData = response.data && typeof response.data === 'object'
        ? Object.entries(response.data).map(([key, value]) => ({
          id: key,
          ...value,
          damage_date: moment(value.damage_date).format('YYYY-MM-DD'),
          created_at: moment(value.created_at).format('YYYY-MM-DD HH:mm'),
          updated_at: moment(value.updated_at).format('YYYY-MM-DD HH:mm')
        }))
        : [];
      setClaims(claimsData);
    } catch (error) {
      notification.error({
        message: 'Failed to fetch your claims',
        description: error.response?.data?.error || error.message
      });
    } finally {
      setLoadingClaims(false);
    }
  };

  const fetchPolicies = async (farmerId, authToken) => {
    try {
      setLoadingPolicies(true);
      const response = await axios.get(`${POLICIES_URL}`);
      const policiesData = response.data && typeof response.data === 'object'
        ? Object.entries(response.data).map(([key, value]) => ({
          id: key,
          ...value,
          end_date: moment(value.end_date).format('YYYY-MM-DD'),
          start_date: moment(value.start_date).format('YYYY-MM-DD')
        }))
        : [];
      setPolicies(policiesData);
    } catch (error) {
      notification.error({
        message: 'Failed to fetch your policies',
        description: error.response?.data?.error || error.message
      });
    } finally {
      setLoadingPolicies(false);
    }
  };

  const fetchLands = async (farmerId, authToken) => {
    try {
      setLoadingLands(true);
      const response = await axios.get(`${LANDS_URL}?farmer_uid=${farmerId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const landsData = response.data && typeof response.data === 'object'
        ? Object.entries(response.data).map(([key, value]) => ({
          id: key,
          ...value,
          created_at: moment(value.created_at).format('YYYY-MM-DD HH:mm')
        }))
        : [];
      setLands(landsData);
    } catch (error) {
      notification.error({
        message: 'Failed to fetch your lands',
        description: error.response?.data?.error || error.message
      });
    } finally {
      setLoadingLands(false);
    }
  };

  const handleFileClaim = async (values) => {
    if (!user || !token) return;

    try {
      setFiling(true);

      const evidenceFiles = await uploadFiles(values.evidence_files?.fileList || []);
      const weatherData = values.weather_data ? await uploadFiles([values.weather_data]) : null;

      const claimData = {
        policy_id: values.policy_id,
        land_id: values.land_id,
        farmer_id: user.uid,
        damage_type: values.damage_type,
        damage_date: values.damage_date.format('YYYY-MM-DD'),
        description: values.description,
        evidence_files: evidenceFiles,
        weather_data: weatherData?.[0] || null
      };

      await axios.post(CLAIMS_URL, claimData);

      notification.success({
        message: 'Claim filed successfully',
        description: 'Your damage claim has been submitted for review.'
      });

      setIsFileModalVisible(false);
      fetchClaims(user.uid, token);
    } catch (error) {
      notification.error({
        message: 'Failed to file claim',
        description: error.response?.data?.error || error.message
      });
    } finally {
      setFiling(false);
    }
  };

  const uploadFiles = async (files) => {
    if (!files.length) return [];

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files[]', file.originFileObj);
    });

    try {
      const response = await axios.post(UPLOAD_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: false
      });
      return response.data.filePaths || [];
    } catch (error) {
      notification.error({
        message: 'Failed to upload files',
        description: error.response?.data?.error || error.message
      });
      return [];
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: true,
    maxCount: 10,
    beforeUpload: (file) => {
      const isImageOrVideo = file.type.startsWith('image/') || file.type.startsWith('video/');
      if (!isImageOrVideo) {
        message.error('You can only upload image or video files!');
        return Upload.LIST_IGNORE;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('File must be smaller than 10MB!');
        return Upload.LIST_IGNORE;
      }
      return false;
    },
    onChange: ({ file, fileList }) => {
      if (file.status === 'error') {
        message.error(`${file.name} file upload failed.`);
      }
    },
    customRequest: ({ file, onSuccess, onError }) => {
      const formData = new FormData();
      formData.append('files[]', file);

      axios.post(UPLOAD_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: false
      })
        .then((response) => {
          onSuccess(response.data, file);
        })
        .catch((error) => {
          onError(error);
        });
    }
  };

  const generatePdfReport = (claim) => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text('Damage Claim Report', 105, 20, { align: 'center' });

    // Add claim information table using autoTable
    autoTable(doc, {
      startY: 30,
      head: [['Field', 'Value']],
      body: [
        ['Claim ID', claim.id],
        ['Policy ID', claim.policy_id],
        ['Land ID', claim.land_id],
        ['Damage Type', claim.damage_type.toUpperCase()],
        ['Damage Date', claim.damage_date],
        ['Status', claim.status.replace('_', ' ').toUpperCase()],
        ['Submitted Date', claim.created_at],
        ['Last Updated', claim.updated_at]
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [22, 160, 133],
        textColor: 255
      },
      styles: {
        cellPadding: 3,
        fontSize: 10
      }
    });

    // Add description section
    doc.setFontSize(14);
    doc.text('Damage Description', 14, doc.lastAutoTable.finalY + 15);

    doc.setFontSize(10);
    doc.setTextColor(80);
    const description = claim.description || 'No description provided';
    doc.text(description, 14, doc.lastAutoTable.finalY + 20, {
      maxWidth: 180
    });

    // Add evidence files section
    doc.setFontSize(14);
    doc.text('Evidence Files', 14, doc.lastAutoTable.finalY + 30 + (description.length > 100 ? 10 : 0));

    if (claim.evidence_files?.length > 0) {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 35 + (description.length > 100 ? 10 : 0),
        head: [['File Name']],
        body: claim.evidence_files.map(file => [file.split('/').pop()]),
        theme: 'grid',
        headStyles: {
          fillColor: [22, 160, 133],
          textColor: 255
        },
        styles: {
          cellPadding: 3,
          fontSize: 10
        }
      });
    } else {
      doc.setFontSize(10);
      doc.text('No evidence files provided', 20, doc.lastAutoTable.finalY + 35 + (description.length > 100 ? 10 : 0));
    }

    // Add footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('This is an auto-generated report. For official use only.', 105, 285, { align: 'center' });

    // Save the PDF
    doc.save(`damage_claim_report_${claim.id}.pdf`);
  };
  
  const claimColumns = [
    {
      title: 'Claim ID',
      dataIndex: 'id',
      render: (id) => <span className="truncate-id">{id}</span>,
    },
    {
      title: 'Policy ID',
      dataIndex: 'policy_id',
      render: (id) => <span className="truncate-id">{id}</span>,
    },
    {
      title: 'Damage Type',
      dataIndex: 'damage_type',
      render: (type) => (
        <Tag color={
          type === 'flood' ? 'blue' :
            type === 'drought' ? 'orange' :
              type === 'pest' ? 'red' :
                type === 'storm' ? 'purple' :
                  type === 'fire' ? 'volcano' :
                    'gray'
        }>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'damage_date',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={
          status === 'approved' ? 'green' :
            status === 'rejected' ? 'red' :
              status === 'under_review' ? 'orange' :
                'gray'
        }>
          {status.replace('_', ' ').toUpperCase()}
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
            setSelectedClaim(record);
            setIsDetailsModalVisible(true);
          }}
        >
          Details
        </Button>
      ),
    },
  ];

  const ClaimDetailsModal = ({ claim, visible, onClose }) => {
    if (!claim) return null;

    return (
      <Modal
        title={`Claim Details - ${claim.id}`}
        open={visible}
        onCancel={onClose}
        footer={[
          <Button key="close" onClick={onClose}>
            Close
          </Button>,
          <Button
            key="pdf"
            type="primary"
            icon={<FilePdfOutlined />}
            onClick={() => generatePdfReport(claim)}
            style={{ marginLeft: 8 }}
          >
            Generate PDF
          </Button>
        ]}
        width={700}
      >
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Claim ID">{claim.id}</Descriptions.Item>
          <Descriptions.Item label="Policy ID">{claim.policy_id}</Descriptions.Item>
          <Descriptions.Item label="Land ID">{claim.land_id}</Descriptions.Item>
          <Descriptions.Item label="Damage Type">
            <Tag color={
              claim.damage_type === 'flood' ? 'blue' :
                claim.damage_type === 'drought' ? 'orange' :
                  claim.damage_type === 'pest' ? 'red' :
                    'gray'
            }>
              {claim.damage_type.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Damage Date">{claim.damage_date}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={
              claim.status === 'approved' ? 'green' :
                claim.status === 'rejected' ? 'red' :
                  claim.status === 'under_review' ? 'orange' :
                    'gray'
            }>
              {claim.status.replace('_', ' ').toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Submitted Date">{claim.created_at}</Descriptions.Item>
          <Descriptions.Item label="Last Updated">{claim.updated_at}</Descriptions.Item>
          <Descriptions.Item label="Description">
            {claim.description || 'No description provided'}
          </Descriptions.Item>
          <Descriptions.Item label="Evidence Files">
            {claim.evidence_files?.length > 0 ? (
              <div>
                {claim.evidence_files.map((file, index) => (
                  <div key={index} style={{ marginBottom: 8 }}>
                    <a
                      href={`http://localhost/firebase-auth${file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {file.split('/').pop()}
                    </a>
                  </div>
                ))}
              </div>
            ) : 'No files uploaded'}
          </Descriptions.Item>
          <Descriptions.Item label="Weather Data">
            {claim.weather_data ? (
              <a
                href={`http://localhost/firebase-auth${claim.weather_data}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Weather Data
              </a>
            ) : 'No weather data provided'}
          </Descriptions.Item>
          <Descriptions.Item label="Inspection Report">
            {claim.inspection_report ? (
              <a
                href={`http://localhost/firebase-auth${claim.inspection_report}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Report
              </a>
            ) : 'No report available'}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    );
  };

  const FileClaimModal = ({ visible, onCancel, onFile, loading, policies, lands }) => {
    const [form] = Form.useForm();

    return (
      <Modal
        title="File New Damage Claim"
        open={visible}
        onCancel={() => {
          form.resetFields();
          onCancel();
        }}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            onFile(values);
            form.resetFields();
          }}
        >
          <Form.Item
            label="Insurance Policy"
            name="policy_id"
            rules={[{ required: true, message: 'Please select a policy!' }]}
          >
            <Select
              placeholder="Select your insurance policy"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {policies.map(policy => (
                <Option key={policy.id} value={policy.id}>
                  {policy.crop_type} - {policy.coverage_type} (Expires: {policy.end_date})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Affected Land"
            name="land_id"
            rules={[{ required: true, message: 'Please select the affected land!' }]}
          >
            <Select
              placeholder="Select the land where damage occurred"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {lands.map(land => (
                <Option key={land.id} value={land.id}>
                  {land.name} - {land.size} acres ({land.district})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Type of Damage"
            name="damage_type"
            rules={[{ required: true, message: 'Please select damage type!' }]}
          >
            <Select placeholder="Select the type of damage">
              <Option value="flood">Flood</Option>
              <Option value="drought">Drought</Option>
              <Option value="pest">Pest/Disease</Option>
              <Option value="storm">Storm/Hail</Option>
              <Option value="fire">Fire</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Date of Damage"
            name="damage_date"
            rules={[{ required: true, message: 'Please select damage date!' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              disabledDate={(current) => current && current > moment().endOf('day')}
            />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please describe the damage!' }]}
          >
            <TextArea rows={4} placeholder="Describe the damage in detail..." />
          </Form.Item>

          <Form.Item
            label="Evidence (Photos/Videos)"
            name="evidence_files"
            extra="Upload images or videos showing the damage (Max 10 files, 10MB each)"
            rules={[{ required: true, message: 'Please upload evidence!' }]}
          >
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">Click or drag files to this area to upload</p>
              <p className="ant-upload-hint">
                Support for images (JPG, PNG, etc.) and videos (MP4, MOV, etc.)
              </p>
            </Dragger>
          </Form.Item>

          <Form.Item
            label="Weather Data (Optional)"
            name="weather_data"
            extra="Screenshots of weather forecasts or historical data"
          >
            <Upload {...uploadProps} maxCount={1}>
              <Button icon={<CloudOutlined />}>Upload Weather Data</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<UploadOutlined />}
              block
              size="large"
            >
              Submit Claim
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  return (
    <div className="damage-claim-page">
      <Card
        title="Damage Claims"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsFileModalVisible(true)}
            disabled={loadingPolicies || loadingLands}
          >
            File New Claim
          </Button>
        }
      >
        <Spin spinning={loadingClaims || loadingPolicies || loadingLands}>
          <Table
            columns={claimColumns}
            dataSource={claims}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            locale={{
              emptyText: loadingClaims ? 'Loading claims...' :
                loadingPolicies ? 'Loading policies...' :
                  loadingLands ? 'Loading lands...' :
                    'No claims found'
            }}
          />
        </Spin>
      </Card>

      <ClaimDetailsModal
        claim={selectedClaim}
        visible={isDetailsModalVisible}
        onClose={() => setIsDetailsModalVisible(false)}
      />

      <FileClaimModal
        visible={isFileModalVisible}
        onCancel={() => setIsFileModalVisible(false)}
        onFile={handleFileClaim}
        loading={filing}
        policies={policies}
        lands={lands}
      />
    </div>
  );
};

export default DamageClaimPage;