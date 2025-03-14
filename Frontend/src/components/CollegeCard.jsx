import { Users, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

export default function CollegeCard({ college }) {
  return (
    <Link to={`/college/${college.id}`} className="block">
      <div className="bg-card rounded-xl shadow-md border border-border overflow-hidden hover:shadow-lg transition-shadow">
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
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
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
      </div>
    </Link>
  );
} 