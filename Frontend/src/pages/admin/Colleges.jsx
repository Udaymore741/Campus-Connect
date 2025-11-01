import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, School } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import AddCollegeDialog from "@/components/admin/AddCollegeDialog";
import EditCollegeDialog from "@/components/admin/EditCollegeDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminColleges() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/colleges");
      setColleges(response.data);
    } catch (error) {
      toast.error("Failed to fetch colleges");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this college?")) return;

    try {
      await axios.delete(`http://localhost:8080/api/colleges/${id}`, {
        withCredentials: true,
      });
      toast.success("College deleted successfully");
      fetchColleges();
    } catch (error) {
      toast.error("Failed to delete college");
    }
  };

  const handleEdit = (college) => {
    setSelectedCollege(college);
    setShowEditDialog(true);
  };

  const filteredColleges = colleges.filter((college) =>
    college.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Colleges</h1>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add College
        </Button>
      </div>

      <div className="mb-6 animate-fade-in">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search colleges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {colleges.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <School className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h2 className="mt-4 text-lg font-medium">No Colleges Found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Get started by adding your first college using the "Add College" button above.
          </p>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="mt-4"
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Your First College
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border animate-fade-in">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Departments</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredColleges.map((college, idx) => (
                <TableRow key={college._id} className="hover:bg-muted/50 transition-colors animate-fade-in" style={{ animationDelay: `${idx * 40}ms` }}>
                  <TableCell>
                    <img
                      src={college.image}
                      alt={college.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{college.name}</TableCell>
                  <TableCell>{college.location}</TableCell>
                  <TableCell>
                    {college.departments?.length || 0} departments
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(college)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(college._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddCollegeDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={fetchColleges}
      />

      {selectedCollege && (
        <EditCollegeDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          college={selectedCollege}
          onSuccess={fetchColleges}
        />
      )}
    </div>
  );
} 