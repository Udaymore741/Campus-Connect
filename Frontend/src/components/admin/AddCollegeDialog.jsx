import { useState } from "react";
import PropTypes from "prop-types";
import { toast } from "sonner";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

/**
 * @typedef {Object} FormData
 * @property {string} name
 * @property {string} description
 * @property {string} location
 * @property {string} website
 * @property {string} departments
 * @property {string} established
 * @property {string} accreditation
 * @property {string} contactInfo
 * @property {string} courses
 * @property {string} facilities
 * @property {string} achievements
 * @property {File|null} image
 */

/**
 * @param {Object} props
 * @param {boolean} props.open
 * @param {(open: boolean) => void} props.onOpenChange
 * @param {() => void} props.onSuccess
 */
function AddCollegeDialog({ open, onOpenChange, onSuccess }) {
  const [loading, setLoading] = useState(false);
  /** @type {FormData} */
  const initialFormData = {
    name: "",
    description: "",
    location: "",
    website: "",
    departments: "",
    established: "",
    accreditation: "",
    contactInfo: "",
    courses: "",
    facilities: "",
    achievements: "",
    image: null
  };
  const [formData, setFormData] = useState(initialFormData);

  /**
   * @param {React.FormEvent} event
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'departments' && value) {
          data.append(key, JSON.stringify(value.split(',').map(d => d.trim())));
        } else if (key === 'courses' && value) {
          data.append(key, JSON.stringify(value.split(',').map(c => c.trim())));
        } else if (key === 'facilities' && value) {
          data.append(key, JSON.stringify(value.split(',').map(f => f.trim())));
        } else if (key === 'image' && value) {
          data.append(key, value);
        } else if (value) {
          data.append(key, value);
        }
      });

      await axios.post('http://localhost:8080/api/colleges', data, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('College added successfully');
      onSuccess();
      onOpenChange(false);
      setFormData(initialFormData);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Failed to add college';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * @param {React.ChangeEvent<HTMLInputElement>} event
   */
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (file && !file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setFormData(prev => ({ ...prev, image: file || null }));
  };

  /**
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} event
   * @param {keyof FormData} field
   */
  const handleInputChange = (event, field) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-hidden">
        <DialogHeader className="space-y-1">
          <DialogTitle>Add New College</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="overflow-y-auto max-h-[calc(90vh-180px)] pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">College Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange(e, 'name')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange(e, 'location')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="established">Established *</Label>
                <Input
                  id="established"
                  value={formData.established}
                  onChange={(e) => handleInputChange(e, 'established')}
                  required
                  placeholder="e.g., 1990"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactInfo">Contact Info *</Label>
                <Input
                  id="contactInfo"
                  value={formData.contactInfo}
                  onChange={(e) => handleInputChange(e, 'contactInfo')}
                  required
                  placeholder="e.g., Phone, Email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange(e, 'website')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="departments">Departments (comma-separated)</Label>
                <Input
                  id="departments"
                  value={formData.departments}
                  onChange={(e) => handleInputChange(e, 'departments')}
                  placeholder="CS, IT, ECE"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="courses">Courses (comma-separated)</Label>
                <Input
                  id="courses"
                  value={formData.courses}
                  onChange={(e) => handleInputChange(e, 'courses')}
                  placeholder="B.Tech, M.Tech, MBA"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facilities">Facilities (comma-separated)</Label>
                <Input
                  id="facilities"
                  value={formData.facilities}
                  onChange={(e) => handleInputChange(e, 'facilities')}
                  placeholder="Library, Sports, Labs"
                />
              </div>

              

              <div className="space-y-2">
                <Label htmlFor="accreditation">Accreditation</Label>
                <Input
                  id="accreditation"
                  value={formData.accreditation}
                  onChange={(e) => handleInputChange(e, 'accreditation')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">College Image *</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange(e, 'description')}
                required
                rows={4}
              />
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="achievements">Achievements</Label>
              <Textarea
                id="achievements"
                value={formData.achievements}
                onChange={(e) => handleInputChange(e, 'achievements')}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add College"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

AddCollegeDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
};

export default AddCollegeDialog; 