import { ArrowRight, BookOpen, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <div className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          {/* Pill Badge */}
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 glass">
            <span className="text-sm">The knowledge platform for students</span>
          </div>

          {/* Headline */}
          <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent tracking-tight animate-slide-in">
            Campus<span className="text-primary">Connect</span>
          </h1>
          <p className="max-w-[42rem] text-muted-foreground sm:text-xl animate-slide-up">
            Ask questions. Share knowledge. Connect with students from around the campus.
            Get the answers you need to succeed in your college journey.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 min-[400px]:gap-4 mt-4 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <Link
              to="/colleges"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-11 px-8"
            >
              Browse Colleges
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-11 px-8"
            >
              Join Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="glass p-6 rounded-xl animate-zoom-in" style={{ animationDelay: "200ms" }}>
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Ask Questions</h3>
            <p className="text-muted-foreground">
              Get answers to your academic questions from peers who've been there before.
            </p>
          </div>
          
          <div className="glass p-6 rounded-xl animate-zoom-in" style={{ animationDelay: "300ms" }}>
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Build Community</h3>
            <p className="text-muted-foreground">
              Connect with fellow students facing similar challenges and share experiences.
            </p>
          </div>
          
          <div className="glass p-6 rounded-xl animate-zoom-in" style={{ animationDelay: "400ms" }}>
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Grow Knowledge</h3>
            <p className="text-muted-foreground">
              Upvote the best answers and contribute your expertise to help others.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 