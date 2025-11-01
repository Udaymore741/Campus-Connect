import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Users,
  School,
  MessageCircle,
  Shield,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";
import BackButton from "@/components/BackButton";

const features = [
  {
    icon: <MessageCircle className="h-6 w-6" />,
    title: "Open Discussion Platform",
    description:
      "A space where students can freely ask questions, share knowledge, and engage in meaningful academic discussions.",
  },
  {
    icon: <School className="h-6 w-6" />,
    title: "College-Focused Community",
    description:
      "Connect with students and alumni from various colleges, sharing experiences and insights about academic life.",
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: "Knowledge Sharing",
    description:
      "Access a wealth of academic resources, study materials, and peer support to enhance your learning journey.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Collaborative Learning",
    description:
      "Work together with peers to solve problems, share study tips, and help each other succeed academically.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Safe Environment",
    description:
      "A moderated platform ensuring respectful discussions and verified information sharing.",
  },
  {
    icon: <Target className="h-6 w-6" />,
    title: "Focused Support",
    description:
      "Get targeted help for specific subjects, courses, and college-related queries from knowledgeable peers.",
  },
];

const About = () => {
  return (
    <div className="container mx-auto px-2 md:px-4 py-16 pt-20 md:pt-28">
      <div className="mb-4 md:mb-6">
        <BackButton fallbackTo="/" label="Back" className="text-sm px-3 py-1.5" />
      </div>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12 md:mb-16"
      >
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3 md:mb-4">
          About CampusConnect
        </h1>
        <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
          Your trusted platform for college-related discussions, knowledge sharing,
          and academic support. We're building a community where students help
          students succeed.
        </p>
      </motion.div>

      {/* Mission Statement */}
      <div className="mb-16">
        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center">
              To create an inclusive, supportive, and knowledge-rich environment where
              college students can connect, learn, and grow together. We believe in the
              power of peer-to-peer learning and community-driven support.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="text-primary mb-4">{feature.icon}</div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Join Our Community</h2>
        <p className="text-muted-foreground mb-8">
          Ready to be part of our growing academic community? Start asking
          questions, sharing knowledge, and connecting with peers today.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/signup" className="inline-block">
            <Button>Get Started</Button>
          </Link>
          <Link to="/questions" className="inline-block">
            <Button variant="outline">Browse Questions</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About; 