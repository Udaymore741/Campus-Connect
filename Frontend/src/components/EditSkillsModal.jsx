import { useState, useEffect } from "react";
import { X, Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from "axios";

export default function EditSkillsModal({ isOpen, onClose, userData, onUpdate }) {
  const [skills, setSkills] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [newAchievement, setNewAchievement] = useState({ title: "", description: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedItemType, setDraggedItemType] = useState(null);

  useEffect(() => {
    if (userData) {
      setSkills(userData.skills || []);
      setAchievements(userData.achievements || []);
    }
  }, [userData]);

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleAddAchievement = () => {
    if (newAchievement.title.trim() && newAchievement.description.trim()) {
      setAchievements([...achievements, { ...newAchievement }]);
      setNewAchievement({ title: "", description: "" });
    }
  };

  const handleRemoveAchievement = (index) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const handleDragStart = (e, index, type) => {
    setDraggedItem(index);
    setDraggedItemType(type);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetIndex, type) => {
    e.preventDefault();
    if (draggedItemType !== type) return;

    if (type === "skill") {
      const newSkills = [...skills];
      const [removed] = newSkills.splice(draggedItem, 1);
      newSkills.splice(targetIndex, 0, removed);
      setSkills(newSkills);
    } else if (type === "achievement") {
      const newAchievements = [...achievements];
      const [removed] = newAchievements.splice(draggedItem, 1);
      newAchievements.splice(targetIndex, 0, removed);
      setAchievements(newAchievements);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await axios.put(
        "http://localhost:8080/api/profile/update",
        {
          skills,
          achievements
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        onUpdate({
          skills,
          achievements
        });
        toast.success("Skills and achievements updated successfully!");
        onClose();
      }
    } catch (error) {
      console.error("Error updating skills and achievements:", error);
      toast.error("Failed to update skills and achievements");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Skills & Achievements</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Skills Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Skills</h3>
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              placeholder="Add new skill"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddSkill} disabled={!newSkill.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {skills.map((skill, index) => (
              <div
                key={index}
                draggable
                onDragStart={(e) => handleDragStart(e, index, "skill")}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index, "skill")}
                className="flex items-center gap-2 p-3 bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100 rounded-lg cursor-move"
              >
                <GripVertical className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="flex-1">{skill}</span>
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Achievements</h3>
          <div className="space-y-4 mb-4">
            <Input
              type="text"
              placeholder="Achievement title"
              value={newAchievement.title}
              onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
            />
            <Input
              type="text"
              placeholder="Achievement description"
              value={newAchievement.description}
              onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
            />
            <Button
              onClick={handleAddAchievement}
              disabled={!newAchievement.title.trim() || !newAchievement.description.trim()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Achievement
            </Button>
          </div>
          <div className="space-y-2">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                draggable
                onDragStart={(e) => handleDragStart(e, index, "achievement")}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index, "achievement")}
                className="flex items-start gap-3 p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg cursor-move"
              >
                <GripVertical className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">{achievement.title}</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">{achievement.description}</p>
                </div>
                <button
                  onClick={() => handleRemoveAchievement(index)}
                  className="hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
} 