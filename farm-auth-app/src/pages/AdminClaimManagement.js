import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Tag,
  Modal,
  Select,
  notification,
  Space,
  Descriptions,
  Popconfirm,
  Spin,
  Card
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  FilePdfOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const { Option } = Select;

const CLAIMS_API = 'http://localhost/firebase-auth/api/farmers/claims/claims.php';
const INSPECTORS_API = 'http://localhost/firebase-auth/api/inspectors/inspectors.php';
const REGIONS_API = 'http://localhost/firebase-auth/api/regions.php'; // Add your regions API endpoint

const AdminClaimManagement = () => {
  const [claims, setClaims] = useState([]);
  const [inspectors, setInspectors] = useState([]);
  const [regions, setRegions] = useState([]); // For region data
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  useEffect(() => {
    fetchClaims();
    fetchInspectors();
    fetchRegions(); // Fetch region data
  }, []);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await axios.get(CLAIMS_API);
      const data = res.data || {};
      const claimsArray = Object.entries(data).map(([id, claim]) => ({
        id,
        ...claim,
        created_at: new Date(claim.created_at).toLocaleDateString(),
        damage_date: new Date(claim.damage_date).toLocaleDateString()
      }));
      setClaims(claimsArray);
    } catch (err) {
      notification.error({ message: 'Error loading claims', description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchInspectors = async () => {
    try {
      const res = await axios.get(INSPECTORS_API);
      const data = res.data || {};
      const inspectorArray = Object.entries(data).map(([id, ins]) => ({
        id,
        ...ins
      }));
      setInspectors(inspectorArray);
    } catch (err) {
      notification.error({ message: 'Error loading inspectors', description: err.message });
    }
  };

  const fetchRegions = async () => {
    try {
      const res = await axios.get(REGIONS_API);
      setRegions(res.data || []);
    } catch (err) {
      notification.error({ message: 'Error loading regions', description: err.message });
    }
  };

  const handleUpdateClaim = async (id, updates) => {
    try {
      await axios.put(`${CLAIMS_API}?id=${id}`, updates);
      notification.success({ message: 'Claim updated successfully' });
      fetchClaims();
    } catch (err) {
      notification.error({ message: 'Update failed', description: err.message });
    }
  };

  const handleAssignInspector = (id, inspectorId) => {
    handleUpdateClaim(id, { inspector_id: inspectorId });
  };

  const handleDecision = (id, status) => {
    handleUpdateClaim(id, { status });
  };

  const generateAnalyticsReport = () => {
    setPdfLoading(true);
    
    try {
      const doc = new jsPDF();
      
      // Title Page
      doc.setFontSize(20);
      doc.setTextColor(40, 53, 147);
      doc.text('Insurance Claims Analytics Report', 105, 30, { align: 'center' });
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`Report generated on: ${new Date().toLocaleDateString()}`, 105, 40, { align: 'center' });
      doc.text(`Total Claims: ${claims.length}`, 105, 50, { align: 'center' });
      doc.addPage();

      // Claims by Region Report
      generateClaimsByRegion(doc);
      doc.addPage();

      // Damage Types Report
      generateDamageTypes(doc);
      doc.addPage();

      // Approval Rates Report
      generateApprovalRates(doc);
      
      // Save the PDF
      doc.save(`claims_analytics_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (error) {
      notification.error({ message: 'Failed to generate report', description: error.message });
    } finally {
      setPdfLoading(false);
    }
  };

  const generateClaimsByRegion = (doc) => {
    // Enhanced region grouping with actual region names
    const regionData = claims.reduce((acc, claim) => {
      const regionId = claim.region_id;
      const region = regions.find(r => r.id === regionId) || { name: 'Unknown' };
      const regionName = region.name;
      
      if (!acc[regionName]) {
        acc[regionName] = {
          count: 0,
          approved: 0,
          rejected: 0,
          pending: 0
        };
      }
      
      acc[regionName].count++;
      acc[regionName][claim.status] = (acc[regionName][claim.status] || 0) + 1;
      return acc;
    }, {});

    doc.setFontSize(16);
    doc.setTextColor(40, 53, 147);
    doc.text('1. Claims by Region', 14, 20);
    
    autoTable(doc, {
      startY: 30,
      head: [['Region', 'Total Claims', 'Approved', 'Rejected', 'Pending', 'Approval Rate']],
      body: Object.entries(regionData).map(([region, data]) => [
        region,
        data.count,
        data.approved || 0,
        data.rejected || 0,
        data.pending || 0,
        data.approved ? `${((data.approved / (data.approved + data.rejected)) * 100 || 0).toFixed(1)}%` : 'N/A'
      ]),
      theme: 'grid',
      headStyles: { fillColor: [40, 53, 147], textColor: 255 },
      styles: { cellPadding: 5, fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 30 }
      }
    });

    // Add summary statistics
    let yPos = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.setTextColor(40, 53, 147);
    doc.text('Regional Summary Statistics', 14, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(80);
    
    const sortedRegions = Object.entries(regionData).sort((a, b) => b[1].count - a[1].count);
    
    sortedRegions.forEach(([region, data], index) => {
      if (index % 24 === 0 && index !== 0) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.text(`${region}:`, 20, yPos);
      doc.text(`Total: ${data.count}`, 60, yPos);
      doc.text(`Approval Rate: ${data.approved ? `${((data.approved / (data.approved + data.rejected)) * 100 || 0).toFixed(1)}%` : 'N/A'}`, 100, yPos);
      yPos += 8;
    });
  };

  const generateDamageTypes = (doc) => {
    const damageData = claims.reduce((acc, claim) => {
      const type = claim.damage_type || 'Unknown';
      if (!acc[type]) {
        acc[type] = {
          count: 0,
          approved: 0,
          rejected: 0,
          pending: 0
        };
      }
      
      acc[type].count++;
      acc[type][claim.status] = (acc[type][claim.status] || 0) + 1;
      return acc;
    }, {});

    doc.setFontSize(16);
    doc.setTextColor(40, 53, 147);
    doc.text('2. Damage Type Analysis', 14, 20);
    
    autoTable(doc, {
      startY: 30,
      head: [['Damage Type', 'Total Claims', 'Approved', 'Rejected', 'Pending', 'Approval Rate']],
      body: Object.entries(damageData).map(([type, data]) => [
        type.toUpperCase(),
        data.count,
        data.approved || 0,
        data.rejected || 0,
        data.pending || 0,
        data.approved ? `${((data.approved / (data.approved + data.rejected)) * 100 || 0).toFixed(1)}%` : 'N/A'
      ]),
      theme: 'grid',
      headStyles: { fillColor: [40, 53, 147], textColor: 255 },
      styles: { cellPadding: 5, fontSize: 10 }
    });

    // Add insights
    let yPos = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.setTextColor(40, 53, 147);
    doc.text('Key Insights:', 14, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(80);
    
    const sortedTypes = Object.entries(damageData).sort((a, b) => b[1].count - a[1].count);
    const mostCommon = sortedTypes[0];
    const leastCommon = sortedTypes[sortedTypes.length - 1];
    
    doc.text(`• Most common damage type: ${mostCommon[0].toUpperCase()} (${mostCommon[1].count} claims)`, 20, yPos);
    yPos += 8;
    doc.text(`• Least common damage type: ${leastCommon[0].toUpperCase()} (${leastCommon[1].count} claims)`, 20, yPos);
    yPos += 8;
    
    const highestApproval = sortedTypes.reduce((prev, current) => {
      const prevRate = prev[1].approved / (prev[1].approved + prev[1].rejected) || 0;
      const currentRate = current[1].approved / (current[1].approved + current[1].rejected) || 0;
      return currentRate > prevRate ? current : prev;
    });
    
    const lowestApproval = sortedTypes.reduce((prev, current) => {
      const prevRate = prev[1].approved / (prev[1].approved + prev[1].rejected) || 0;
      const currentRate = current[1].approved / (current[1].approved + current[1].rejected) || 0;
      return currentRate < prevRate ? current : prev;
    });
    
    doc.text(`• Highest approval rate: ${highestApproval[0].toUpperCase()} (${((highestApproval[1].approved / (highestApproval[1].approved + highestApproval[1].rejected)) * 100 || 0).toFixed(1)}%)`, 20, yPos);
    yPos += 8;
    doc.text(`• Lowest approval rate: ${lowestApproval[0].toUpperCase()} (${((lowestApproval[1].approved / (lowestApproval[1].approved + lowestApproval[1].rejected)) * 100 || 0).toFixed(1)}%)`, 20, yPos);
  };

  const generateApprovalRates = (doc) => {
    const statusData = claims.reduce((acc, claim) => {
      acc[claim.status] = (acc[claim.status] || 0) + 1;
      return acc;
    }, {});

    doc.setFontSize(16);
    doc.setTextColor(40, 53, 147);
    doc.text('3. Claim Status Analytics', 14, 20);
    
    autoTable(doc, {
      startY: 30,
      head: [['Status', 'Number of Claims', 'Percentage']],
      body: Object.entries(statusData).map(([status, count]) => [
        status.toUpperCase().replace('_', ' '),
        count,
        `${((count / claims.length) * 100).toFixed(1)}%`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [40, 53, 147], textColor: 255 },
      styles: { cellPadding: 5, fontSize: 10 }
    });

    // Add approval rate summary
    const approved = statusData.approved || 0;
    const rejected = statusData.rejected || 0;
    const pending = statusData.pending || 0;
    const processed = approved + rejected;
    const approvalRate = processed > 0 ? (approved / processed) * 100 : 0;
    
    let yPos = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.setTextColor(40, 53, 147);
    doc.text('Approval Rate Summary', 14, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(`• Total Claims: ${claims.length}`, 20, yPos);
    yPos += 8;
    doc.text(`• Processed Claims (Approved + Rejected): ${processed}`, 20, yPos);
    yPos += 8;
    doc.text(`• Pending Claims: ${pending} (${((pending / claims.length) * 100).toFixed(1)}%)`, 20, yPos);
    yPos += 8;
    doc.text(`• Approval Rate: ${approvalRate.toFixed(1)}%`, 20, yPos);
    yPos += 8;
    doc.text(`• Rejection Rate: ${(100 - approvalRate).toFixed(1)}%`, 20, yPos);
    yPos += 15;
    
    // Add time-based approval trends (simplified)
    if (claims.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(40, 53, 147);
      doc.text('Monthly Approval Trends', 14, yPos);
      
      yPos += 10;
      doc.setFontSize(10);
      
      // Group by month (simplified)
      const monthlyData = claims.reduce((acc, claim) => {
        const date = new Date(claim.created_at);
        const monthYear = `${date.getMonth()+1}/${date.getFullYear()}`;
        
        if (!acc[monthYear]) {
          acc[monthYear] = { approved: 0, rejected: 0, total: 0 };
        }
        
        if (claim.status === 'approved') acc[monthYear].approved++;
        if (claim.status === 'rejected') acc[monthYear].rejected++;
        acc[monthYear].total++;
        
        return acc;
      }, {});
      
      autoTable(doc, {
        startY: yPos,
        head: [['Month', 'Approved', 'Rejected', 'Total', 'Approval Rate']],
        body: Object.entries(monthlyData).map(([month, data]) => [
          month,
          data.approved,
          data.rejected,
          data.total,
          `${((data.approved / (data.approved + data.rejected)) * 100 || 0).toFixed(1)}%`
        ]),
        theme: 'grid',
        headStyles: { fillColor: [40, 53, 147], textColor: 255 },
        styles: { cellPadding: 5, fontSize: 10 }
      });
    }
  };

  const columns = [
    { 
      title: 'Claim ID', 
      dataIndex: 'id',
      width: 120,
      render: (id) => <span style={{ fontFamily: 'monospace' }}>{id}</span>
    },
    { 
      title: 'Farmer ID', 
      dataIndex: 'farmer_id',
      width: 120,
      render: (id) => <span style={{ fontFamily: 'monospace' }}>{id}</span>
    },
    { 
      title: 'Region', 
      dataIndex: 'region_id',
      render: (id) => {
        const region = regions.find(r => r.id === id);
        return region ? region.name : 'Unknown';
      }
    },
    { 
      title: 'Damage Type', 
      dataIndex: 'damage_type',
      render: (type) => type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: status => (
        <Tag color={
          status === 'pending' ? 'orange' :
          status === 'approved' ? 'green' :
          status === 'rejected' ? 'red' : 'blue'
        }>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Inspector',
      dataIndex: 'inspector_id',
      render: (inspectorId, record) => (
        <Select
          value={inspectorId || undefined}
          onChange={value => handleAssignInspector(record.id, value)}
          placeholder="Assign Inspector"
          style={{ width: 200 }}
          loading={loading}
        >
          {inspectors.map(ins => (
            <Option key={ins.id} value={ins.id}>
              {ins.name} ({ins.license_number})
            </Option>
          ))}
        </Select>
      )
    },
    {
      title: 'Actions',
      fixed: 'right',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => {
              setSelectedClaim(record);
              setIsDetailModalVisible(true);
            }}
            tooltip="View Details"
          />
          <Popconfirm
            title="Approve this claim?"
            onConfirm={() => handleDecision(record.id, 'approved')}
            disabled={record.status === 'approved'}
          >
            <Button 
              icon={<CheckCircleOutlined />} 
              type={record.status === 'approved' ? 'default' : 'primary'} 
              disabled={record.status === 'approved'}
            />
          </Popconfirm>
          <Popconfirm
            title="Reject this claim?"
            onConfirm={() => handleDecision(record.id, 'rejected')}
            disabled={record.status === 'rejected'}
          >
            <Button 
              icon={<CloseCircleOutlined />} 
              danger 
              disabled={record.status === 'rejected'}
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Claim Management Dashboard"
        extra={
          <Space>
            <Button 
              type="primary" 
              icon={<FilePdfOutlined />}
              onClick={generateAnalyticsReport}
              loading={pdfLoading}
            >
              Generate Full Report
            </Button>
            <Button onClick={fetchClaims} loading={loading}>
              Refresh Data
            </Button>
          </Space>
        }
      >
        <Spin spinning={loading}>
          <Table
            dataSource={claims}
            columns={columns}
            rowKey="id"
            scroll={{ x: 1300 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '25', '50', '100']
            }}
            bordered
          />
        </Spin>
      </Card>

      {selectedClaim && (
        <Modal
          title={`Claim Details - ${selectedClaim.id}`}
          open={isDetailModalVisible}
          onCancel={() => setIsDetailModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => setIsDetailModalVisible(false)}>
              Close
            </Button>,
            <Button 
              key="pdf" 
              type="primary" 
              icon={<FilePdfOutlined />}
              onClick={() => {
                const doc = new jsPDF();
                doc.text(`Claim Details - ${selectedClaim.id}`, 10, 10);
                autoTable(doc, {
                  head: [['Field', 'Value']],
                  body: [
                    ['Claim ID', selectedClaim.id],
                    ['Farmer ID', selectedClaim.farmer_id],
                    ['Land ID', selectedClaim.land_id],
                    ['Policy ID', selectedClaim.policy_id],
                    ['Damage Type', selectedClaim.damage_type],
                    ['Damage Date', selectedClaim.damage_date],
                    ['Status', selectedClaim.status.toUpperCase()],
                    ['Description', selectedClaim.description || 'N/A'],
                    ['Inspector', inspectors.find(i => i.id === selectedClaim.inspector_id)?.name || 'Not assigned'],
                    ['Created At', selectedClaim.created_at]
                  ]
                });
                doc.save(`claim_${selectedClaim.id}_details.pdf`);
              }}
            >
              Export as PDF
            </Button>
          ]}
          width={800}
        >
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Claim ID">{selectedClaim.id}</Descriptions.Item>
            <Descriptions.Item label="Farmer ID">{selectedClaim.farmer_id}</Descriptions.Item>
            <Descriptions.Item label="Land ID">{selectedClaim.land_id}</Descriptions.Item>
            <Descriptions.Item label="Policy ID">{selectedClaim.policy_id}</Descriptions.Item>
            <Descriptions.Item label="Region">
              {regions.find(r => r.id === selectedClaim.region_id)?.name || 'Unknown'}
            </Descriptions.Item>
            <Descriptions.Item label="Damage Type">
              {selectedClaim.damage_type ? selectedClaim.damage_type.charAt(0).toUpperCase() + selectedClaim.damage_type.slice(1) : 'Unknown'}
            </Descriptions.Item>
            <Descriptions.Item label="Damage Date">{selectedClaim.damage_date}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={
                selectedClaim.status === 'pending' ? 'orange' :
                selectedClaim.status === 'approved' ? 'green' :
                selectedClaim.status === 'rejected' ? 'red' : 'blue'
              }>
                {selectedClaim.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {selectedClaim.description || 'No description provided'}
            </Descriptions.Item>
            <Descriptions.Item label="Inspection Report">
              {selectedClaim.inspection_report || 'Not submitted'}
            </Descriptions.Item>
            <Descriptions.Item label="Inspector">
              {inspectors.find(i => i.id === selectedClaim.inspector_id)?.name || 'Not assigned'}
            </Descriptions.Item>
            <Descriptions.Item label="Created At">{selectedClaim.created_at}</Descriptions.Item>
          </Descriptions>
        </Modal>
      )}
    </div>
  );
};

export default AdminClaimManagement;