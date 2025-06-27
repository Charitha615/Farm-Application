import React, { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  Tag, 
  Spin, 
  Badge, 
  Tabs, 
  Button, 
  Space,
  Avatar,
  Divider,
  notification
} from 'antd';
import { 
  BellOutlined, 
  WarningOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  CloudOutlined,
  BugOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { TabPane } = Tabs;

const ALERTS_URL = 'http://localhost/firebase-auth/api/farmers/claims/alerts.php';
const NOTIFICATIONS_URL = 'http://localhost/firebase-auth/api/farmers/claims/notifications.php';

const RiskAlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState('alerts');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        fetchAlerts(parsedUser.uid);
        fetchNotifications(parsedUser.uid);
      } catch (error) {
        notification.error({ message: 'Failed to parse user data' });
      }
    }
  }, []);

  const fetchAlerts = async (farmerId) => {
    try {
      setLoadingAlerts(true);
      const response = await axios.get(`${ALERTS_URL}?farmer_id=${farmerId}`);
      const alertsData = response.data && typeof response.data === 'object' 
        ? Object.entries(response.data).map(([key, value]) => ({ 
            id: key, 
            ...value,
            timestamp: moment(value.timestamp).format('YYYY-MM-DD HH:mm'),
            is_read: value.is_read === '1'
          }))
        : [];
      setAlerts(alertsData);
    } catch (error) {
      notification.error({ message: 'Failed to fetch alerts' });
    } finally {
      setLoadingAlerts(false);
    }
  };

  const fetchNotifications = async (farmerId) => {
    try {
      setLoadingNotifications(true);
      const response = await axios.get(`${NOTIFICATIONS_URL}?user_id=${farmerId}`);
      const notificationsData = response.data && typeof response.data === 'object' 
        ? Object.entries(response.data).map(([key, value]) => ({ 
            id: key, 
            ...value,
            timestamp: moment(value.timestamp).format('YYYY-MM-DD HH:mm'),
            is_read: value.is_read === '1'
          }))
        : [];
      setNotifications(notificationsData);
    } catch (error) {
      notification.error({ message: 'Failed to fetch notifications' });
    } finally {
      setLoadingNotifications(false);
    }
  };

  const markAsRead = async (type, id) => {
    try {
      const endpoint = type === 'alert' ? ALERTS_URL : NOTIFICATIONS_URL;
      await axios.put(`${endpoint}?id=${id}`, { is_read: true });
      
      if (type === 'alert') {
        setAlerts(alerts.map(alert => 
          alert.id === id ? { ...alert, is_read: true } : alert
        ));
      } else {
        setNotifications(notifications.map(notification => 
          notification.id === id ? { ...notification, is_read: true } : notification
        ));
      }
      
      notification.success({ message: 'Marked as read' });
    } catch (error) {
      notification.error({ message: 'Failed to update status' });
    }
  };

  const markAllAsRead = async (type) => {
    try {
      const endpoint = type === 'alert' ? ALERTS_URL : NOTIFICATIONS_URL;
      await axios.put(`${endpoint}?user_id=${user.uid}`, { mark_all_read: true });
      
      if (type === 'alert') {
        setAlerts(alerts.map(alert => ({ ...alert, is_read: true })));
      } else {
        setNotifications(notifications.map(notification => ({ ...notification, is_read: true })));
      }
      
      notification.success({ message: 'All marked as read' });
    } catch (error) {
      notification.error({ message: 'Failed to update status' });
    }
  };

  const getAlertIcon = (alertType) => {
    switch (alertType) {
      case 'weather':
        return <CloudOutlined style={{ color: '#1890ff' }} />;
      case 'pest':
        return <BugOutlined style={{ color: '#f5222d' }} />;
      case 'policy':
        return <FileTextOutlined style={{ color: '#52c41a' }} />;
      default:
        return <WarningOutlined style={{ color: '#faad14' }} />;
    }
  };

  const getAlertColor = (alertType) => {
    switch (alertType) {
      case 'weather':
        return 'blue';
      case 'pest':
        return 'red';
      case 'policy':
        return 'green';
      default:
        return 'orange';
    }
  };

  return (
    <div className="risk-alerts-page">
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                <WarningOutlined />
                Risk Alerts
                {alerts.filter(a => !a.is_read).length > 0 && (
                  <Badge
                    count={alerts.filter(a => !a.is_read).length}
                    style={{ marginLeft: 8 }}
                  />
                )}
              </span>
            }
            key="alerts"
          >
            <Spin spinning={loadingAlerts}>
              <div style={{ textAlign: 'right', marginBottom: 16 }}>
                <Button
                  type="link"
                  onClick={() => markAllAsRead('alert')}
                  disabled={alerts.filter(a => !a.is_read).length === 0}
                >
                  Mark all as read
                </Button>
              </div>
              
              <List
                itemLayout="horizontal"
                dataSource={alerts}
                renderItem={alert => (
                  <List.Item
                    style={{ 
                      background: alert.is_read ? '#fff' : '#f6ffed',
                      padding: '12px 16px',
                      borderBottom: '1px solid #f0f0f0'
                    }}
                    actions={[
                      !alert.is_read && (
                        <Button
                          type="link"
                          size="small"
                          onClick={() => markAsRead('alert', alert.id)}
                        >
                          Mark as read
                        </Button>
                      )
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge dot={!alert.is_read}>
                          <Avatar icon={getAlertIcon(alert.alert_type)} />
                        </Badge>
                      }
                      title={
                        <Space>
                          <Tag color={getAlertColor(alert.alert_type)}>
                            {alert.alert_type.toUpperCase()}
                          </Tag>
                          {alert.title}
                        </Space>
                      }
                      description={
                        <>
                          <div>{alert.message}</div>
                          <div style={{ marginTop: 4 }}>
                            <small style={{ color: '#999' }}>
                              {alert.timestamp}
                              {alert.location && (
                                <>
                                  {' • '}
                                  <EnvironmentOutlined /> {alert.location}
                                </>
                              )}
                            </small>
                          </div>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            </Spin>
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <BellOutlined />
                Notifications
                {notifications.filter(n => !n.is_read).length > 0 && (
                  <Badge
                    count={notifications.filter(n => !n.is_read).length}
                    style={{ marginLeft: 8 }}
                  />
                )}
              </span>
            }
            key="notifications"
          >
            <Spin spinning={loadingNotifications}>
              <div style={{ textAlign: 'right', marginBottom: 16 }}>
                <Button
                  type="link"
                  onClick={() => markAllAsRead('notification')}
                  disabled={notifications.filter(n => !n.is_read).length === 0}
                >
                  Mark all as read
                </Button>
              </div>
              
              <List
                itemLayout="horizontal"
                dataSource={notifications}
                renderItem={notification => (
                  <List.Item
                    style={{ 
                      background: notification.is_read ? '#fff' : '#f6ffed',
                      padding: '12px 16px',
                      borderBottom: '1px solid #f0f0f0'
                    }}
                    actions={[
                      !notification.is_read && (
                        <Button
                          type="link"
                          size="small"
                          onClick={() => markAsRead('notification', notification.id)}
                        >
                          Mark as read
                        </Button>
                      )
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge dot={!notification.is_read}>
                          <Avatar 
                            icon={
                              notification.type === 'claim' ? <FileTextOutlined /> :
                              notification.type === 'policy' ? <CheckCircleOutlined /> :
                              <BellOutlined />
                            }
                          />
                        </Badge>
                      }
                      title={
                        <Space>
                          <Tag color={
                            notification.type === 'claim' ? 'blue' :
                            notification.type === 'policy' ? 'green' :
                            'orange'
                          }>
                            {notification.type.toUpperCase()}
                          </Tag>
                          {notification.title}
                        </Space>
                      }
                      description={
                        <>
                          <div>{notification.message}</div>
                          <div style={{ marginTop: 4 }}>
                            <small style={{ color: '#999' }}>
                              {notification.timestamp}
                            </small>
                          </div>
                          {notification.action_url && (
                            <div style={{ marginTop: 8 }}>
                              <Button
                                type="link"
                                size="small"
                                href={notification.action_url}
                              >
                                View Details
                              </Button>
                            </div>
                          )}
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            </Spin>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default RiskAlertsPage;