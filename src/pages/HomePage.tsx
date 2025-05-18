
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { TopicCard } from "@/components/TopicCard";
import { QuestionCard } from "@/components/QuestionCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function HomePage() {
  // Mock data
  const trendingTopics = [
    {
      id: "math",
      title: "Mathematics",
      description: "Algebra, Calculus, Statistics, Geometry and more",
      memberCount: 1250,
      questionCount: 435,
      tags: ["Algebra", "Calculus", "Statistics"],
      color: "#9b87f5",
    },
    {
      id: "physics",
      title: "Physics",
      description: "Classical Mechanics, Electromagnetism, Quantum Physics",
      memberCount: 875,
      questionCount: 312,
      tags: ["Mechanics", "Electricity", "Quantum"],
      color: "#1EAEDB",
    },
    {
      id: "programming",
      title: "Programming",
      description: "Learn coding with Python, Java, JavaScript, and more",
      memberCount: 2100,
      questionCount: 768,
      tags: ["Python", "Java", "JavaScript"],
      color: "#7E69AB",
    },
  ];

  const recentQuestions = [
    {
      id: "q1",
      title: "How do you find the derivative of f(x) = x³ + 2x² - 4x + 1?",
      excerpt: "I'm struggling with this calculus problem. Can someone explain the steps?",
      author: { name: "Emily Chen", avatar: "" },
      createdAt: "2 hours ago",
      subject: "Calculus",
      difficulty: "Intermediate",
      answersCount: 3,
    },
    {
      id: "q2",
      title: "How to implement binary search in Python?",
      excerpt: "I understand the concept but I'm having trouble with the implementation.",
      author: { name: "Marcus Lee", avatar: "" },
      createdAt: "5 hours ago",
      subject: "Programming",
      difficulty: "Beginner",
      answersCount: 5,
    },
    {
      id: "q3",
      title: "Newton's Second Law of Motion - Application Problem",
      excerpt: "Need help solving this problem about a block on an inclined plane.",
      author: { name: "Sophie Wang", avatar: "" },
      createdAt: "1 day ago",
      subject: "Physics",
      difficulty: "Advanced",
      answersCount: 2,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <FeaturesSection />
      
      <section className="w-full py-12 md:py-24 bg-secondary/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Popular Communities</h2>
              <p className="text-muted-foreground">Join these active topic communities to start learning.</p>
            </div>
            <Button asChild>
              <Link to="/communities">View All Communities</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingTopics.map((topic) => (
              <TopicCard key={topic.id} {...topic} />
            ))}
          </div>
        </div>
      </section>
      
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Recent Questions</h2>
              <p className="text-muted-foreground">Help your peers by answering their questions.</p>
            </div>
            <Button asChild variant="outline">
              <Link to="/questions">Browse All Questions</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentQuestions.map((question) => (
              <QuestionCard key={question.id} {...question} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
