import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Modal, Spin, message, Input, Divider, Form } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;
const { confirm } = Modal;

const AdminSupport = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [replyLoading, setReplyLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost/firebase-auth/api/support/get_all_messages.php');
            setMessages(response.data);
        } catch (error) {
            message.error('Failed to fetch messages');
        } finally {
            setLoading(false);
        }
    };

    const showMessageDetails = (message) => {
        setSelectedMessage(message);
        setIsModalVisible(true);
    };

    const handleResolve = async (id) => {
        confirm({
            title: 'Mark this message as resolved?',
            icon: <ExclamationCircleOutlined />,
            okText: 'Yes',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await axios.put('http://localhost/firebase-auth/api/support/update_status.php', {
                        id,
                        status: 'resolved'
                    });
                    message.success('Message marked as resolved');
                    fetchMessages();
                } catch (error) {
                    message.error('Failed to update message status');
                }
            }
        });
    };

    const handleReply = async (values) => {
        try {
            setReplyLoading(true);
            // Here you would typically send an email or notification to the farmer
            await axios.post('http://localhost/firebase-auth/api/support/send_reply.php', {
                messageId: selectedMessage.id,
                reply: values.reply,
                farmerEmail: selectedMessage.email // Assuming email is stored with message
            });
            message.success('Reply sent successfully');
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error('Failed to send reply');
        } finally {
            setReplyLoading(false);
        }
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => new Date(date).toLocaleString()
        },
        {
            title: 'Farmer',
            dataIndex: 'farmer_name',
            key: 'farmer_name',
            render: (_, record) => `${record.farmer_name} (${record.farmer_id})`
        },
        {
            title: 'Message',
            dataIndex: 'message',
            key: 'message',
            render: (text) => <span className="message-preview">{text.length > 50 ? `${text.substring(0, 50)}...` : text}</span>
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
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="action-buttons">
                    <Button onClick={() => showMessageDetails(record)}>View</Button>
                    {record.status === 'pending' && (
                        <Button
                            type="primary"
                            onClick={() => handleResolve(record.id)}
                        >
                            Resolve
                        </Button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="admin-support">
            <h1>Farmer Support Messages</h1>
            <Spin spinning={loading}>
                <Table
                    columns={columns}
                    dataSource={messages}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Spin>

            <Modal
                title={`Message from ${selectedMessage?.farmer_name}`}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
            >
                {selectedMessage && (
                    <div className="message-details">
                        <div className="message-content">
                            <p><strong>Date:</strong> {new Date(selectedMessage.created_at).toLocaleString()}</p>
                            <p><strong>Status:</strong> <Tag color={selectedMessage.status === 'pending' ? 'orange' : 'green'}>
                                {selectedMessage.status.toUpperCase()}
                            </Tag></p>
                            <div className="message-text">
                                <h4>Message:</h4>
                                <p>{selectedMessage.message}</p>
                            </div>
                        </div>

                        <Divider />

                        <Form
                            form={form}
                            onFinish={handleReply}
                        >
                            <Form.Item
                                name="reply"
                                label="Your Reply"
                                rules={[{ required: true, message: 'Please enter your reply' }]}
                            >
                                <TextArea rows={4} placeholder="Enter your reply to the farmer..." />
                            </Form.Item>
                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={replyLoading}
                                >
                                    Send Reply
                                </Button>
                                {selectedMessage.status === 'pending' && (
                                    <Button
                                        style={{ marginLeft: 8 }}
                                        onClick={() => handleResolve(selectedMessage.id)}
                                    >
                                        Mark as Resolved
                                    </Button>
                                )}
                            </Form.Item>
                        </Form>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminSupport;