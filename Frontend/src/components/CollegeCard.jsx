import { Users, MessageSquare, BookOpen, GraduationCap, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { categories } from "../data/mockData";

export default function CollegeCard({ college }) {
  // Get the most relevant categories for colleges
  const relevantCategories = [
    categories.find(c => c.slug === "courses-academics"),
    categories.find(c => c.slug === "placement-internship"),
    categories.find(c => c.slug === "admissions"),
  ].filter(Boolean);

  return (
    <div className="bg-card rounded-xl shadow-md border border-border overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/college/${college.id}`}>
        <div className="aspect-video relative">
          <img
            src={college.image}
            alt={college.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">{college.name}</h3>
          <p className="text-muted-foreground text-sm mb-4">{college.description}</p>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{college.activeUsers.toLocaleString()} active users</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{college.questionsCount.toLocaleString()} questions</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Category Quick Links */}
      <div className="px-4 pb-4">
        <div className="text-sm font-medium mb-2">Quick Links:</div>
        <div className="flex flex-wrap gap-2">
          {relevantCategories.map((category) => (
            <Link
              key={category.id}
              to={`/questions?category=${category.slug}`}
              className="inline-flex items-center gap-1 px-3 py-1 bg-secondary hover:bg-secondary/80 text-foreground rounded-full text-sm transition-colors"
            >
              {category.slug === "courses-academics" && <BookOpen className="h-3 w-3" />}
              {category.slug === "placement-internship" && <Briefcase className="h-3 w-3" />}
              {category.slug === "admissions" && <GraduationCap className="h-3 w-3" />}
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}