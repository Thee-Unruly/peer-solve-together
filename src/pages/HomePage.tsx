
import { useEffect, useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { TopicCard } from "@/components/TopicCard";
import { QuestionCard, DifficultyType } from "@/components/QuestionCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

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

  useEffect(() => {
    // Fetch real communities data
    async function fetchCommunities() {
      try {
        const { data: groupsData, error: groupsError } = await supabase
          .from('groups')
          .select('*');

        if (groupsError) throw groupsError;
        
        if (groupsData && groupsData.length > 0) {
          // Transform groups data to match our UI format
          const formattedTopics = await Promise.all(
            groupsData.map(async (group) => {
              // Count questions in this community
              const { count: questionCount } = await supabase
                .from('questions')
                .select('*', { count: 'exact', head: true })
                .eq('category', group.slug);

              return {
                id: group.slug,
                title: group.name,
                description: group.description || `Questions about ${group.name}`,
                memberCount: Math.floor(Math.random() * 1000) + 100, // Placeholder until we implement member counting
                questionCount: questionCount || 0,
                tags: [group.slug], // Placeholder until we implement tags
                color: group.color || "#9b87f5",
              };
            })
          );
          
          if (formattedTopics.length > 0) {
            setTrendingTopics(formattedTopics);
          }
        }
      } catch (error) {
        console.error("Error fetching communities:", error);
      }
    }

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
          // Get answer counts for these questions
          const answerCounts: Record<string, number> = {};
          await Promise.all(
            data.map(async (question) => {
              const { data: answerData, error: answerError } = await supabase
                .from('answers')
                .select('*', { head: true, count: 'exact' })
                .eq('question_id', question.id);
              
              if (!answerError) {
                // @ts-ignore - We know count exists on the response
                answerCounts[question.id] = answerData.count || 0;
              }
            })
          );

          const formattedQuestions = data.map((question) => ({
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
            answersCount: answerCounts[question.id] || 0,
          }));
          setRecentQuestions(formattedQuestions);
        } else {
          // If no questions found, show empty state
          setRecentQuestions([]);
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

    fetchCommunities();
    fetchRecentQuestions();
  }, []);

  // Helper function to map subject categories to difficulty levels
  const mapDifficulty = (category: string): DifficultyType => {
    const lowerCategory = (category || "").toLowerCase();
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
            {trendingTopics.length > 0 ? (
              trendingTopics.slice(0, 3).map((topic) => (
                <TopicCard key={topic.id} {...topic} />
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-muted-foreground">No communities found. Be the first to create one!</p>
                <Button asChild className="mt-4">
                  <Link to="/communities/new">Create Community</Link>
                </Button>
              </div>
            )}
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
              <Link to="/communities">Browse All Communities</Link>
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
            ) : recentQuestions.length > 0 ? (
              recentQuestions.map((question) => (
                <QuestionCard key={question.id} {...question} />
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-muted-foreground">No questions found. Be the first to ask a question!</p>
                <Button asChild className="mt-4">
                  <Link to="/ask">Ask a Question</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
