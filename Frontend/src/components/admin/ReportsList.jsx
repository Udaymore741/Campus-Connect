import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReportDialog } from '../ReportDialog';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const ReportsList = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get('/api/reports');
      setReports(response.data);
    } catch (error) {
      toast.error('Failed to fetch reports');
    }
  };

  const handleResolve = async (data) => {
    try {
      await axios.put(`/api/reports/${selectedReport._id}/resolve`, {
        resolution: data.resolution
      });
      toast.success('Report resolved successfully');
      fetchReports();
    } catch (error) {
      toast.error('Failed to resolve report');
    }
  };

  const handleNavigateToContent = () => {
    if (selectedReport) {
      const path = selectedReport.contentType === 'question'
        ? `/questions/${selectedReport.reportedContent}`
        : `/answers/${selectedReport.reportedContent}`;
      navigate(path);
    }
  };

  const getStatusBadge = (status) => {
    return status === 'pending' ? (
      <Badge variant="warning">Pending</Badge>
    ) : (
      <Badge variant="success">Resolved</Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reports</h2>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Reporter</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report._id}>
                <TableCell className="capitalize">{report.contentType}</TableCell>
                <TableCell>{report.category}</TableCell>
                <TableCell>{report.reporter?.name}</TableCell>
                <TableCell>{getStatusBadge(report.status)}</TableCell>
                <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  {report.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReport(report);
                        setIsResolveDialogOpen(true);
                      }}
                    >
                      Resolve
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ReportDialog
        isOpen={isResolveDialogOpen}
        onClose={() => {
          setIsResolveDialogOpen(false);
          setSelectedReport(null);
        }}
        onSubmit={handleResolve}
        isResolveDialog={true}
        report={selectedReport}
        onNavigateToContent={handleNavigateToContent}
      />
    </div>
  );
};

export default ReportsList; 