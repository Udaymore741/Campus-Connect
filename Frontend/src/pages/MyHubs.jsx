import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, MessageSquare, School } from "lucide-react";
import { colleges } from "../data/mockData";

export default function MyHubs() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filter only joined colleges
  const joinedColleges = colleges.filter(college => college.isJoined);

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-7xl mx-auto px-4 pt-28 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Hubs</h1>
            <p className="text-muted-foreground">
              Quick access to your joined college communities
            </p>
          </div>
          <Link
            to="/colleges"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <School className="h-4 w-4" />
            Join More Colleges
          </Link>
        </div>

        {joinedColleges.length > 0 ? (
          <div className="grid gap-6">
            {joinedColleges.map((college) => (
              <Link
                key={college.id}
                to={`/college/${college.id}`}
                className="block bg-card text-card-foreground rounded-lg shadow-md dark:shadow-primary/5 border border-border p-6 hover:shadow-lg dark:hover:shadow-primary/10 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-2 text-foreground">{college.name}</h2>
                    <p className="text-muted-foreground">
                      Founded in {college.foundedYear}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center justify-center gap-1 font-semibold text-foreground">
                        <Users className="h-4 w-4" />
                        <span>{college.members.toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Members</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center justify-center gap-1 font-semibold text-foreground">
                        <MessageSquare className="h-4 w-4" />
                        <span>{college.questionsCount.toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Questions</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center justify-center gap-1 font-semibold text-foreground">
                        <Users className="h-4 w-4" />
                        <span>{college.activeUsers.toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Active Users</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-lg border border-border">
            <School className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Joined Colleges Yet</h2>
            <p className="text-muted-foreground mb-6">
              Join college communities to see them here
            </p>
            <Link
              to="/colleges"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
            >
              <School className="h-4 w-4" />
              Browse Colleges
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
