import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { categories } from "../data/mockData";

export default function CollegePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('questions');
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const college = {
    id,
    name: "Example University",
    questionsCount: 1200,
    rank: 15,
  };

  return (
    <div className="min-h-screen bg-background">      
      <main className="container max-w-7xl mx-auto px-4 pt-28 pb-16">
        <h1 className="text-3xl font-bold mb-4 text-foreground">{college.name}</h1>
        <p className="text-muted-foreground mb-8">Explore your college community</p>
        
        <div className="grid md:grid-cols-3 gap-6">
          <button
            className="bg-card text-card-foreground rounded-lg shadow-md dark:shadow-primary/5 border border-border p-6 hover:shadow-lg dark:hover:shadow-primary/10 transition-all duration-300 ease-in-out transform hover:-translate-y-1 w-full"
            onClick={() => {
              setActiveSection('questions');
              navigate(`/questions?college=${id}`);
            }}
          >
            <h2 className="text-xl font-semibold mb-2">Questions</h2>
            <p className="text-3xl font-bold text-primary">
              {college.questionsCount.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Total questions asked
            </p>
          </button>

          <button
            className="bg-card text-card-foreground rounded-lg shadow-md dark:shadow-primary/5 border border-border p-6 hover:shadow-lg dark:hover:shadow-primary/10 transition-all duration-300 ease-in-out transform hover:-translate-y-1 w-full"
            onClick={() => setActiveSection('categories')}
          >
            <h2 className="text-xl font-semibold mb-2">Categories</h2>
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 3).map((category) => (
                <span
                  key={category.id}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {category.name}
                </span>
              ))}
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                +{categories.length - 3} more
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Click to explore all categories
            </p>
          </button>

          <button
            className="bg-card text-card-foreground rounded-lg shadow-md dark:shadow-primary/5 border border-border p-6 hover:shadow-lg dark:hover:shadow-primary/10 transition-all duration-300 ease-in-out transform hover:-translate-y-1 w-full"
            onClick={() => navigate(`/ranking?college=${id}`)}
          >
            <h2 className="text-xl font-semibold mb-2">Ranking</h2>
            <p className="text-3xl font-bold text-primary">#{college.rank}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Your current rank
            </p>
          </button>
        </div>

        {activeSection === 'categories' && (
          <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-semibold mb-6">Question Categories</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => navigate(`/questions?college=${id}&category=${category.slug}`)}
                  className="bg-card text-card-foreground rounded-lg shadow-md dark:shadow-primary/5 border border-border p-6 hover:shadow-lg dark:hover:shadow-primary/10 transition-all duration-300 ease-in-out transform hover:-translate-y-1 text-left w-full"
                >
                  <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {category.description}
                  </p>
                  <div className="mt-4 text-sm text-primary">
                    View questions →
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
