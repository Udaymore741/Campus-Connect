import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ReportDialog } from "@/components/ReportDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Reports = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    if (!user) {
      navigate('/auth?mode=login');
      return;
    }
    
    if (user.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/');
      return;
    }
    
    fetchReports();
  }, [filterType, filterStatus, searchQuery, user]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/reports', {
        params: {
          type: filterType === 'all' ? undefined : filterType,
          status: filterStatus === 'all' ? undefined : filterStatus,
          search: searchQuery || undefined
        },
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to view reports');
        navigate('/auth?mode=login');
      } else if (error.response?.status === 403) {
        toast.error('Admin access required');
        navigate('/');
      } else {
        toast.error('Failed to fetch reports');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (data) => {
    try {
      await axios.put(`http://localhost:8080/api/reports/${selectedReport._id}/resolve`, {
        resolution: data.resolution
      }, { withCredentials: true });
      toast.success('Report resolved successfully');
      setIsResolveDialogOpen(false);
      setSelectedReport(null);
      fetchReports(); // Refresh the reports list
    } catch (error) {
      console.error('Error resolving report:', error);
      toast.error('Failed to resolve report');
    }
  };

  const handleNavigateToContent = () => {
    if (selectedReport && selectedReport.contentType === 'question') {
      navigate(`/question/${selectedReport.reportedContent}`);
      setIsResolveDialogOpen(false);
      setSelectedReport(null);
    }
  };

  const handleDelete = async (reportId) => {
    setReportToDelete(reportId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/reports/${reportToDelete}`, {
        withCredentials: true
      });
      toast.success('Report deleted successfully');
      setIsDeleteDialogOpen(false);
      setReportToDelete(null);
      fetchReports(); // Refresh the reports list
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      resolved: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700"
    };
    return variants[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">
            Review and manage reported content.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="question">Questions</SelectItem>
            <SelectItem value="answer">Answers</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports List */}
      <div className="rounded-md border">
        {loading ? (
          <div className="p-4 text-center">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="p-4 text-center">No reports found</div>
        ) : (
          <div className="divide-y">
            {reports.map((report) => (
              <div key={report._id} className="p-4 hover:bg-muted/50">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{report.category}</span>
                      <Badge className={getStatusBadge(report.status)}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                    <div className="text-sm">
                      <span className="font-medium">Content Type:</span> {report.contentType}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {report.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedReport(report);
                          setIsResolveDialogOpen(true);
                        }}
                        className="hover:bg-blue-500 hover:text-white"
                      >
                        Resolve
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(report._id)}
                      className="hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Report</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this report? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setReportToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Reports; 