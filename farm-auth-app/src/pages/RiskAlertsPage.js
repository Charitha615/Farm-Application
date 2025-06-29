import React, { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  Tag, 
  Spin, 
  Badge, 
  Button,
  Space,
  Avatar,
  notification as antdNotification,
  Alert,
  Tabs
} from 'antd';
import { 
  BellOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  WarningOutlined,
  ThunderboltOutlined,
  CloudOutlined,
  FireOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { TabPane } = Tabs;

// API endpoints
const NOTIFICATIONS_URL = 'http://localhost/firebase-auth/api/notifications/notification.php';
const WEATHER_ALERTS_URL = 'https://api.weather.gov/alerts/active';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('app');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        fetchNotifications(parsedUser.uid);
      } catch (error) {
        antdNotification.error({ message: 'Failed to parse user data' });
      }
    }

    // Fetch weather alerts
    fetchWeatherAlerts();
  }, []);

  const fetchNotifications = async (userId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${NOTIFICATIONS_URL}?user_id=${userId}`);
      
      // Convert Firebase object to array and format data
      const notificationsData = response.data && typeof response.data === 'object' 
        ? Object.entries(response.data).map(([id, notification]) => ({ 
            id,
            ...notification,
            created_at: moment(notification.created_at).format('YYYY-MM-DD HH:mm'),
            is_read: notification.is_read || false
          }))
        : [];
      
      // Sort by date (newest first)
      notificationsData.sort((a, b) => moment(b.created_at).valueOf() - moment(a.created_at).valueOf());
      
      setNotifications(notificationsData);
    } catch (error) {
      antdNotification.error({ message: 'Failed to fetch notifications' });
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherAlerts = async () => {
    try {
      setWeatherLoading(true);
      const response = await axios.get(WEATHER_ALERTS_URL, {
        headers: {
          'User-Agent': 'YourAppName (your@email.com)', // Required by NWS API
          'Accept': 'application/geo+json'
        }
      });
      
      // Process weather alerts
      const alerts = response.data.features.map(alert => ({
        id: alert.id,
        title: alert.properties.headline,
        message: alert.properties.description,
        severity: alert.properties.severity,
        type: alert.properties.event,
        area: alert.properties.areaDesc,
        effective: moment(alert.properties.effective).format('YYYY-MM-DD HH:mm'),
        expires: moment(alert.properties.expires).format('YYYY-MM-DD HH:mm'),
        is_read: false,
        source: 'weather'
      }));
      
      setWeatherAlerts(alerts);
    } catch (error) {
      antdNotification.error({ 
        message: 'Failed to fetch weather alerts',
        description: error.message
      });
    } finally {
      setWeatherLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.post(`${NOTIFICATIONS_URL}?id=${notificationId}`);
      
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
      
      antdNotification.success({ message: 'Marked as read' });
    } catch (error) {
      antdNotification.error({ message: 'Failed to update notification status' });
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      // Find all unread notifications
      const unreadIds = notifications
        .filter(n => !n.is_read)
        .map(n => n.id);
      
      // Mark each as read
      await Promise.all(unreadIds.map(id => 
        axios.post(`${NOTIFICATIONS_URL}?id=${id}`)
      ));
      
      // Update local state
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      
      antdNotification.success({ message: 'All notifications marked as read' });
    } catch (error) {
      antdNotification.error({ message: 'Failed to mark all as read' });
    }
  };

  const getNotificationIcon = (relatedEntity) => {
    switch (relatedEntity) {
      case 'claim':
        return <FileTextOutlined style={{ color: '#1890ff' }} />;
      case 'policy':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      default:
        return <BellOutlined style={{ color: '#faad14' }} />;
    }
  };

  const getWeatherAlertIcon = (alertType) => {
    const lowerType = alertType.toLowerCase();
    if (lowerType.includes('thunderstorm')) return <ThunderboltOutlined style={{ color: '#ffec3d' }} />;
    if (lowerType.includes('flood')) return <CloudOutlined style={{ color: '#13c2c2' }} />;
    if (lowerType.includes('fire')) return <FireOutlined style={{ color: '#ff4d4f' }} />;
    if (lowerType.includes('tornado')) return <WarningOutlined style={{ color: '#f5222d' }} />;
    return <WarningOutlined style={{ color: '#faad14' }} />;
  };

  const getNotificationTag = (relatedEntity) => {
    switch (relatedEntity) {
      case 'claim':
        return { text: 'CLAIM', color: 'blue' };
      case 'policy':
        return { text: 'POLICY', color: 'green' };
      default:
        return { text: 'SYSTEM', color: 'orange' };
    }
  };

  const getWeatherAlertTag = (severity) => {
    switch (severity.toLowerCase()) {
      case 'extreme':
        return { text: 'EXTREME', color: 'red' };
      case 'severe':
        return { text: 'SEVERE', color: 'volcano' };
      case 'moderate':
        return { text: 'MODERATE', color: 'orange' };
      case 'minor':
        return { text: 'MINOR', color: 'gold' };
      default:
        return { text: 'UNKNOWN', color: 'gray' };
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const weatherAlertCount = weatherAlerts.length;

  return (
    <div className="notifications-page" style={{ padding: '24px' }}>
      <Card
        title={
          <Space>
            <BellOutlined />
            Notifications
            {activeTab === 'app' && unreadCount > 0 && (
              <Badge count={unreadCount} style={{ marginLeft: 8 }} />
            )}
            {activeTab === 'weather' && weatherAlertCount > 0 && (
              <Badge count={weatherAlertCount} style={{ marginLeft: 8 }} />
            )}
          </Space>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane 
            tab={
              <span>
                <BellOutlined />
                App Notifications
                {unreadCount > 0 && <Badge count={unreadCount} style={{ marginLeft: 8 }} />}
              </span>
            } 
            key="app"
          >
            <Spin spinning={loading}>
              <List
                itemLayout="horizontal"
                dataSource={notifications}
                renderItem={item => (
                  <List.Item
                    style={{ 
                      background: item.is_read ? '#fff' : '#f6ffed',
                      padding: '12px 16px',
                      borderBottom: '1px solid #f0f0f0',
                      cursor: 'pointer'
                    }}
                    onClick={() => !item.is_read && markAsRead(item.id)}
                    actions={[
                      !item.is_read && (
                        <Button
                          type="link"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(item.id);
                          }}
                        >
                          Mark as read
                        </Button>
                      )
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge dot={!item.is_read}>
                          <Avatar icon={getNotificationIcon(item.related_entity)} />
                        </Badge>
                      }
                      title={
                        <Space>
                          <Tag color={getNotificationTag(item.related_entity).color}>
                            {getNotificationTag(item.related_entity).text}
                          </Tag>
                          {item.title}
                        </Space>
                      }
                      description={
                        <>
                          <div>{item.message}</div>
                          <div style={{ marginTop: 4 }}>
                            <small style={{ color: '#999' }}>
                              {item.created_at}
                            </small>
                          </div>
                          {item.related_entity_id && (
                            <div style={{ marginTop: 8 }}>
                              {/* View Details button can be uncommented if needed */}
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

          <TabPane 
            tab={
              <span>
                <ThunderboltOutlined />
                Weather Alerts
                {weatherAlertCount > 0 && <Badge count={weatherAlertCount} style={{ marginLeft: 8 }} />}
              </span>
            } 
            key="weather"
          >
            <Alert 
              message="Weather alerts are provided by the National Weather Service API"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Spin spinning={weatherLoading}>
              <List
                itemLayout="horizontal"
                dataSource={weatherAlerts}
                renderItem={item => (
                  <List.Item
                    style={{ 
                      padding: '12px 16px',
                      borderBottom: '1px solid #f0f0f0',
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar icon={getWeatherAlertIcon(item.type)} />
                      }
                      title={
                        <Space>
                          <Tag color={getWeatherAlertTag(item.severity).color}>
                            {getWeatherAlertTag(item.severity).text}
                          </Tag>
                          {item.title}
                        </Space>
                      }
                      description={
                        <>
                          <div>
                            <EnvironmentOutlined /> {item.area}
                          </div>
                          <div style={{ marginTop: 8 }}>{item.message}</div>
                          <div style={{ marginTop: 8 }}>
                            <Space>
                              <small style={{ color: '#999' }}>
                                <ClockCircleOutlined /> Effective: {item.effective}
                              </small>
                              <small style={{ color: '#999' }}>
                                Expires: {item.expires}
                              </small>
                            </Space>
                          </div>
                        </>
                      }
                    />
                  </List.Item>
                )}
                locale={{
                  emptyText: 'No active weather alerts in your region'
                }}
              />
            </Spin>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default NotificationsPage;