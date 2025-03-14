import { useEffect } from "react";
import { Link } from "react-router-dom";

const colleges = [
  {
    id: 1,
    name: "Example University",
    foundedYear: 1950,
    members: 5000,
    questionsAsked: 1200,
    activeUsers: 800,
  },
  {
    id: 2,
    name: "Tech Institute",
    foundedYear: 1975,
    members: 3500,
    questionsAsked: 800,
    activeUsers: 600,
  },
  // Add more colleges as needed
];

export default function CollegesList() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-7xl mx-auto px-4 pt-28 pb-16">
        <h1 className="text-3xl font-bold mb-4 text-foreground">Colleges</h1>
        <p className="text-muted-foreground mb-8">Browse and connect with college communities</p>

        <div className="grid gap-6">
          {colleges.map((college) => (
            <div
              key={college.id}
              className="bg-card text-card-foreground rounded-lg shadow-md dark:shadow-primary/5 border border-border p-6 hover:shadow-lg dark:hover:shadow-primary/10 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
            >
              <Link to={`/college/${college.id}`} className="block">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-2 text-foreground">{college.name}</h2>
                    <p className="text-muted-foreground">
                      Founded in {college.foundedYear}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="font-semibold text-foreground">{college.members.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Members</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="font-semibold text-foreground">{college.questionsAsked.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Questions</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="font-semibold text-foreground">{college.activeUsers.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Active Users</p>
                    </div>
                    <div className="bg-primary/10 rounded-lg p-3">
                      <p className="font-semibold text-primary">View Details →</p>
                      <p className="text-sm text-muted-foreground">Click to explore</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
