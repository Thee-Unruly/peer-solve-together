
import { useEffect, useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { TopicCard } from "@/components/TopicCard";
import { QuestionCard, DifficultyType } from "@/components/QuestionCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  title: string;
  body: string | null;
  created_at: string | null;
  category: string;
  votes: number | null;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
}

export default function HomePage() {
  const [trendingTopics, setTrendingTopics] = useState([
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
  ]);

  const [recentQuestions, setRecentQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchRecentQuestions() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('questions')
          .select(`
            id,
            title,
            body,
            created_at,
            category,
            votes,
            profiles:user_id (
              username,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          const formattedQuestions = data.map((question: Question) => ({
            id: question.id,
            title: question.title,
            excerpt: question.body || "No description provided",
            author: { 
              name: question.profiles?.username || "Anonymous User", 
              avatar: question.profiles?.avatar_url || "" 
            },
            createdAt: question.created_at || new Date().toISOString(),
            subject: question.category,
            difficulty: mapDifficulty(question.category),
            answersCount: Math.floor(Math.random() * 5), // Placeholder until we implement answer counting
          }));
          setRecentQuestions(formattedQuestions);
        } else {
          // If no questions found, use placeholder data
          setRecentQuestions([
            {
              id: "q1",
              title: "How do you find the derivative of f(x) = x³ + 2x² - 4x + 1?",
              excerpt: "I'm struggling with this calculus problem. Can someone explain the steps?",
              author: { name: "Emily Chen", avatar: "" },
              createdAt: new Date().toISOString(),
              subject: "Calculus",
              difficulty: "Intermediate" as DifficultyType,
              answersCount: 3,
            },
            {
              id: "q2",
              title: "How to implement binary search in Python?",
              excerpt: "I understand the concept but I'm having trouble with the implementation.",
              author: { name: "Marcus Lee", avatar: "" },
              createdAt: new Date().toISOString(),
              subject: "Programming",
              difficulty: "Beginner" as DifficultyType,
              answersCount: 5,
            },
            {
              id: "q3",
              title: "Newton's Second Law of Motion - Application Problem",
              excerpt: "Need help solving this problem about a block on an inclined plane.",
              author: { name: "Sophie Wang", avatar: "" },
              createdAt: new Date().toISOString(),
              subject: "Physics",
              difficulty: "Advanced" as DifficultyType,
              answersCount: 2,
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
        toast({
          title: "Error",
          description: "Failed to load recent questions. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecentQuestions();
  }, [toast]);

  // Helper function to map subject categories to difficulty levels
  const mapDifficulty = (category: string): DifficultyType => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes("calculus") || lowerCategory.includes("physics")) {
      return "Intermediate";
    } else if (lowerCategory.includes("quantum") || lowerCategory.includes("advanced")) {
      return "Advanced";
    }
    return "Beginner";
  };

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
            {isLoading ? (
              // Show skeleton loaders while fetching data
              Array(3).fill(0).map((_, index) => (
                <QuestionCard
                  key={`skeleton-${index}`}
                  id=""
                  title=""
                  excerpt=""
                  author={{ name: "", avatar: "" }}
                  createdAt=""
                  subject=""
                  difficulty="Beginner"
                  answersCount={0}
                  isLoading={true}
                />
              ))
            ) : (
              recentQuestions.map((question) => (
                <QuestionCard key={question.id} {...question} />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
