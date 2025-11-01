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
 * @typedef {Object} College
 * @property {string} _id
 * @property {string} name
 * @property {string} description
 * @property {string} location
 * @property {string} website
 * @property {string[]} departments
 * @property {string} establishedYear
 * @property {string} accreditation
 
 * @property {string} image
 */

/**
 * @typedef {Object} FormData
 * @property {string} name
 * @property {string} description
 * @property {string} location
 * @property {string} website
 * @property {string} departments
 * @property {string} establishedYear
 * @property {string} accreditation
 
 * @property {File|null} image
 */

/**
 * @param {Object} props
 * @param {boolean} props.open
 * @param {(open: boolean) => void} props.onOpenChange
 * @param {() => void} props.onSuccess
 * @param {College|null} props.college
 */
function EditCollegeDialog({ open, onOpenChange, onSuccess, college }) {
  // If no college is selected, don't render the dialog
  if (!college) return null;

  const [loading, setLoading] = useState(false);
  /** @type {FormData} */
  const initialFormData = {
    name: college.name,
    description: college.description,
    location: college.location,
    website: college.website || "",
    departments: college.departments.join(", "),
    establishedYear: college.establishedYear || "",
    accreditation: college.accreditation || "",
    
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
        } else if (key === 'image' && value) {
          data.append(key, value);
        } else if (value) {
          data.append(key, value);
        }
      });

      await axios.put(`http://localhost:8080/api/colleges/${college._id}`, data, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('College updated successfully');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Failed to update college';
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="space-y-1">
          <DialogTitle>Edit College</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="establishedYear">Established Year</Label>
              <Input
                id="establishedYear"
                type="number"
                value={formData.establishedYear}
                onChange={(e) => handleInputChange(e, 'establishedYear')}
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
              <Label htmlFor="image">College Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange(e, 'description')}
              required
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update College"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

EditCollegeDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  college: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    website: PropTypes.string,
    departments: PropTypes.arrayOf(PropTypes.string).isRequired,
    establishedYear: PropTypes.string,
    accreditation: PropTypes.string,
    image: PropTypes.string
  }).isRequired
};

export default EditCollegeDialog; 