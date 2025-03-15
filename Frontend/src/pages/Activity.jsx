import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpCircle, MessageCircle } from "lucide-react";
import ActivityChart from "../components/ActivityChart";

// Mock data for the user's activity
const mockUserActivity = {
  questions: [
    {
      id: "q1",
      title: "How to prepare for placement interviews?",
      content: "I'm a final year student looking for tips on technical interviews...",
      createdAt: new Date("2025-03-14T10:00:00"),
      upvotes: 15,
      comments: 5,
      category: "Placement & Internship"
    },
    {
      id: "q2",
      title: "Best resources for learning Data Structures?",
      content: "Can someone recommend good resources for DSA preparation?",
      createdAt: new Date("2025-03-13T15:30:00"),
      upvotes: 20,
      comments: 8,
      category: "Academic Projects"
    }
  ],
  comments: [
    {
      id: "c1",
      content: "I would recommend practicing on LeetCode and GeeksForGeeks.",
      questionId: "q3",
      questionTitle: "Preparation strategy for coding interviews",
      createdAt: new Date("2025-03-14T11:20:00"),
      upvotes: 10
    },
    {
      id: "c2",
      content: "The college library has some great resources on this topic.",
      questionId: "q4",
      questionTitle: "Resources for machine learning projects",
      createdAt: new Date("2025-03-13T16:45:00"),
      upvotes: 5
    }
  ],
  votes: [
    {
      id: "v1",
      type: "question",
      itemId: "q5",
      itemTitle: "Tips for writing research papers",
      votedAt: new Date("2025-03-14T09:15:00")
    },
    {
      id: "v2",
      type: "comment",
      itemId: "c3",
      itemTitle: "Comment on 'How to choose research topics'",
      votedAt: new Date("2025-03-13T14:30:00")
    }
  ],
  weeklyActivity: [
    {
      date: "2025-03-14",
      activeHours: 6,
      totalActions: 45,
      hourlyBreakdown: [
        { hour: 9, count: 8 },
        { hour: 10, count: 12 },
        { hour: 11, count: 15 },
        { hour: 14, count: 5 },
        { hour: 15, count: 3 },
        { hour: 16, count: 2 }
      ]
    },
    {
      date: "2025-03-13",
      activeHours: 4,
      totalActions: 30,
      hourlyBreakdown: [
        { hour: 10, count: 8 },
        { hour: 11, count: 10 },
        { hour: 14, count: 7 },
        { hour: 15, count: 5 }
      ]
    },
    {
      date: "2025-03-12",
      activeHours: 5,
      totalActions: 35,
      hourlyBreakdown: [
        { hour: 9, count: 6 },
        { hour: 10, count: 8 },
        { hour: 11, count: 12 },
        { hour: 14, count: 5 },
        { hour: 15, count: 4 }
      ]
    },
    {
      date: "2025-03-11",
      activeHours: 3,
      totalActions: 25,
      hourlyBreakdown: [
        { hour: 10, count: 10 },
        { hour: 11, count: 8 },
        { hour: 14, count: 7 }
      ]
    },
    {
      date: "2025-03-10",
      activeHours: 7,
      totalActions: 50,
      hourlyBreakdown: [
        { hour: 9, count: 8 },
        { hour: 10, count: 10 },
        { hour: 11, count: 12 },
        { hour: 14, count: 8 },
        { hour: 15, count: 6 },
        { hour: 16, count: 4 },
        { hour: 17, count: 2 }
      ]
    },
    {
      date: "2025-03-09",
      activeHours: 4,
      totalActions: 28,
      hourlyBreakdown: [
        { hour: 10, count: 8 },
        { hour: 11, count: 10 },
        { hour: 14, count: 6 },
        { hour: 15, count: 4 }
      ]
    },
    {
      date: "2025-03-08",
      activeHours: 5,
      totalActions: 32,
      hourlyBreakdown: [
        { hour: 9, count: 7 },
        { hour: 10, count: 8 },
        { hour: 11, count: 9 },
        { hour: 14, count: 5 },
        { hour: 15, count: 3 }
      ]
    }
  ]
};

export default function Activity() {
  const [activeTab, setActiveTab] = useState("questions");
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-7xl mx-auto px-4 pt-28 pb-16">
        <h1 className="text-3xl font-bold mb-2 text-foreground">My Activity</h1>
        <p className="text-muted-foreground mb-8">Track your contributions and engagement</p>

        {/* Activity Chart */}
        <Card className="p-6 mb-8">
          <ActivityChart weeklyData={mockUserActivity.weeklyActivity} />
        </Card>

        <Tabs defaultValue="questions" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="questions">My Questions</TabsTrigger>
            <TabsTrigger value="comments">My Comments</TabsTrigger>
            <TabsTrigger value="votes">My Votes</TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="space-y-4">
            {mockUserActivity.questions.map((question) => (
              <Card key={question.id} className="p-6 hover:shadow-lg transition-shadow">
                <Link
                  to={`/question/${question.id}`}
                  className="text-xl font-semibold hover:text-primary transition-colors"
                >
                  {question.title}
                </Link>
                <p className="text-muted-foreground mt-2">{question.content}</p>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ArrowUpCircle className="w-4 h-4" />
                    {question.upvotes} upvotes
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {question.comments} comments
                  </span>
                  <span>{formatDistanceToNow(question.createdAt)} ago</span>
                  <Link 
                    to={`/questions/${question.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                    className="text-primary hover:underline"
                  >
                    {question.category}
                  </Link>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            {mockUserActivity.comments.map((comment) => (
              <Card key={comment.id} className="p-6 hover:shadow-lg transition-shadow">
                <Link
                  to={`/question/${comment.questionId}`}
                  className="text-lg font-medium hover:text-primary transition-colors"
                >
                  Re: {comment.questionTitle}
                </Link>
                <p className="text-muted-foreground mt-2">{comment.content}</p>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ArrowUpCircle className="w-4 h-4" />
                    {comment.upvotes} upvotes
                  </span>
                  <span>{formatDistanceToNow(comment.createdAt)} ago</span>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="votes" className="space-y-4">
            {mockUserActivity.votes.map((vote) => (
              <Card key={vote.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <ArrowUpCircle className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <Link
                      to={`/question/${vote.itemId}`}
                      className="text-lg font-medium hover:text-primary transition-colors"
                    >
                      {vote.itemTitle}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      You upvoted this {vote.type} {formatDistanceToNow(vote.votedAt)} ago
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
