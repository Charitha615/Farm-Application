import React, { useState, useEffect } from 'react';
import { Button, Form, Input, message, Table, Tag, Modal, Spin } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;
const { confirm } = Modal;

const FarmerSupport = () => {
  const [form] = Form.useForm();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost/firebase-auth/api/support/get_messages.php');
      setMessages(response.data);
    } catch (error) {
      message.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      await axios.post('http://localhost/firebase-auth/api/support/send_message.php', values);
      message.success('Message sent successfully!');
      form.resetFields();
      fetchMessages();
    } catch (error) {
      message.error('Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteMessage = async (id) => {
    confirm({
      title: 'Are you sure you want to delete this message?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await axios.delete('http://localhost/firebase-auth/api/support/delete_message.php', {
            data: { id }
          });
          message.success('Message deleted successfully');
          fetchMessages();
        } catch (error) {
          message.error('Failed to delete message');
        }
      }
    });
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString()
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'pending' ? 'orange' : 'green'}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button 
          danger 
          onClick={() => deleteMessage(record.id)}
          disabled={record.status === 'resolved'}
        >
          Delete
        </Button>
      )
    }
  ];

  return (
    <div className="support-page">
      <div className="support-container">
        <div className="support-form">
          <h2>Contact Support</h2>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="message"
              label="Your Message"
              rules={[
                { required: true, message: 'Please enter your message' },
                { min: 10, message: 'Message must be at least 10 characters' }
              ]}
            >
              <TextArea rows={6} placeholder="Describe your issue or question..." />
            </Form.Item>
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitting}
              >
                Send Message
              </Button>
            </Form.Item>
          </Form>
        </div>

        <div className="support-history">
          <h2>Your Support History</h2>
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={messages}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </Spin>
        </div>
      </div>
    </div>
  );
};

export default FarmerSupport;