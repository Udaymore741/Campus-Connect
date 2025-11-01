import { useEffect } from "react";
import Navbar from "../components/Navbar";
import CollegeCard from "../components/CollegeCard";
import { colleges } from "../data/mockData";

export default function Colleges() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold mb-2">Browse Colleges</h1>
            <p className="text-muted-foreground">
              Explore colleges and their active communities
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {colleges.map((college, idx) => (
            <div key={college.id} style={{ animationDelay: `${idx * 50}ms` }} className="animate-fade-in">
              <CollegeCard college={college} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 