import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuestionCard } from "@/components/QuestionCard";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyQuestionsPage() {
  const [activeTab, setActiveTab] = useState("asked");
  const [myQuestions, setMyQuestions] = useState<any[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<any[]>([]);
  const [savedQuestions, setSavedQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      toast.error("Please sign in to view your questions");
      navigate("/auth");
      return;
    }
    
    // Fetch user's questions and answers
    fetchUserContent();
    
    // Set up real-time subscription
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "questions",
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchUserContent();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "answers"
        },
        () => {
          fetchUserContent();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "votes"
        },
        () => {
          fetchUserContent();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate]);

  const fetchUserContent = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Fetch questions asked by the user
      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (questionsError) throw questionsError;

      // Fetch answers by the user to get questions they've answered
      const { data: answersData, error: answersError } = await supabase
        .from("answers")
        .select(`
          *,
          questions:question_id (
            *,
            profiles:user_id (
              username,
              avatar_url
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (answersError) throw answersError;

      // Fetch questions the user has voted on (as "saved")
      const { data: votesData, error: votesError } = await supabase
        .from("votes")
        .select(`
          *,
          entity_id
        `)
        .eq("user_id", user.id)
        .eq("entity_type", "question")
        .order("created_at", { ascending: false });

      if (votesError) throw votesError;
      
      // Now fetch the actual questions that were voted on
      let savedQuestionsList: any[] = [];
      
      if (votesData && votesData.length > 0) {
        const votedQuestionIds = votesData.map(vote => vote.entity_id);
        
        const { data: savedQuestionsData, error: savedQuestionsError } = await supabase
          .from("questions")
          .select(`
            *,
            profiles:user_id (
              username,
              avatar_url
            )
          `)
          .in("id", votedQuestionIds);
          
        if (savedQuestionsError) throw savedQuestionsError;
        
        // Process saved questions
        if (savedQuestionsData) {
          savedQuestionsList = savedQuestionsData.map(question => ({
            id: question.id,
            title: question.title,
            excerpt: question.body || "No description provided",
            author: {
              name: question.profiles?.username || "Anonymous User",
              avatar: question.profiles?.avatar_url || ""
            },
            createdAt: question.created_at || new Date().toISOString(),
            subject: question.category,
            difficulty: mapDifficultyFromCategory(question.category),
            answersCount: 0, // We'll update this later
            votes: question.votes || 0,
            hasVoted: true
          }));
        }
      }

      // Process questions asked by user
      const formattedQuestions = questionsData?.map(question => ({
        id: question.id,
        title: question.title,
        excerpt: question.body || "No description provided",
        author: {
          name: question.profiles?.username || user.email || "Anonymous User",
          avatar: question.profiles?.avatar_url || ""
        },
        createdAt: question.created_at || new Date().toISOString(),
        subject: question.category,
        difficulty: mapDifficultyFromCategory(question.category),
        answersCount: 0, // We'll update this later
        votes: question.votes || 0,
        hasVoted: false // Default value
      })) || [];

      // Process questions answered by user
      const answeredQuestionsList = answersData
        ?.filter(answer => answer.questions) // Ensure question exists
        .map(answer => {
          const question = answer.questions;
          return {
            id: question.id,
            title: question.title,
            excerpt: question.body || "No description provided",
            author: {
              name: question.profiles?.username || "Anonymous User",
              avatar: question.profiles?.avatar_url || ""
            },
            createdAt: question.created_at || new Date().toISOString(),
            subject: question.category,
            difficulty: mapDifficultyFromCategory(question.category),
            answersCount: 0, // Placeholder
            votes: question.votes || 0,
            hasVoted: false // Default value
          };
        }) || [];

      // Get answer counts for all questions
      const questionIds = [
        ...formattedQuestions.map(q => q.id),
        ...answeredQuestionsList.map(q => q.id),
        ...savedQuestionsList.map(q => q.id)
      ];
      
      if (questionIds.length > 0) {
        // Fix: Use select with count to get answer counts
        const answerCounts: Record<string, number> = {};
        
        // Get counts for each question individually
        await Promise.all(
          questionIds.map(async (questionId) => {
            const { count, error } = await supabase
              .from("answers")
              .select("*", { count: "exact", head: true })
              .eq("question_id", questionId);
            
            if (!error && count !== null) {
              answerCounts[questionId] = count;
            }
          })
        );

        // Update the answer counts for all question lists
        formattedQuestions.forEach(q => {
          q.answersCount = answerCounts[q.id] || 0;
        });

        answeredQuestionsList.forEach(q => {
          q.answersCount = answerCounts[q.id] || 0;
        });

        savedQuestionsList.forEach(q => {
          q.answersCount = answerCounts[q.id] || 0;
        });
      }

      // Check user votes
      if (user) {
        const { data: userVotes } = await supabase
          .from("votes")
          .select("entity_id")
          .eq("user_id", user.id)
          .eq("entity_type", "question");

        if (userVotes) {
          const votedQuestionIds = userVotes.map(v => v.entity_id);
          
          // Update hasVoted flag for questions the user has voted on
          formattedQuestions.forEach(q => {
            q.hasVoted = votedQuestionIds.includes(q.id);
          });
          
          answeredQuestionsList.forEach(q => {
            q.hasVoted = votedQuestionIds.includes(q.id);
          });
        }
      }

      setMyQuestions(formattedQuestions);
      setAnsweredQuestions(answeredQuestionsList);
      setSavedQuestions(savedQuestionsList);
    } catch (error) {
      console.error("Error fetching user content:", error);
      toast.error("Failed to load your questions");
    } finally {
      setIsLoading(false);
    }
  };

  const mapDifficultyFromCategory = (category: string): "Beginner" | "Intermediate" | "Advanced" => {
    const lowerCaseCategory = (category || "").toLowerCase();
    
    if (lowerCaseCategory.includes("advanced") || 
        lowerCaseCategory.includes("complex") ||
        lowerCaseCategory.includes("graduate")) {
      return "Advanced";
    } else if (lowerCaseCategory.includes("intermediate") ||
              lowerCaseCategory.includes("college") ||
              lowerCaseCategory.includes("calculus")) {
      return "Intermediate";
    }
    
    return "Beginner";
  };

  return (
    <div className="container py-10 px-4 md:px-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Questions</h1>
          <p className="text-muted-foreground">
            View and manage your questions and contributions
          </p>
        </div>
        <Button asChild>
          <Link to="/ask">
            <PlusCircle className="mr-2 h-4 w-4" />
            Ask New Question
          </Link>
        </Button>
      </div>

      <Tabs
        defaultValue="asked"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full justify-start mb-8">
          <TabsTrigger value="asked">Questions I Asked</TabsTrigger>
          <TabsTrigger value="answered">Questions I Answered</TabsTrigger>
          <TabsTrigger value="saved">Saved Questions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="asked" className="mt-0">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(3).fill(0).map((_, i) => (
                <QuestionCard
                  key={`loading-asked-${i}`}
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
              ))}
            </div>
          ) : myQuestions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myQuestions.map((question) => (
                <QuestionCard key={question.id} {...question} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">You haven't asked any questions yet</h3>
              <p className="text-muted-foreground mb-4">Ask your first question to get help from the community</p>
              <Button asChild>
                <Link to="/ask">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Ask a Question
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="answered" className="mt-0">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(3).fill(0).map((_, i) => (
                <QuestionCard
                  key={`loading-answered-${i}`}
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
              ))}
            </div>
          ) : answeredQuestions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {answeredQuestions.map((question) => (
                <QuestionCard key={question.id} {...question} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">You haven't answered any questions yet</h3>
              <p className="text-muted-foreground mb-4">Help others by answering their questions</p>
              <Button asChild variant="outline">
                <Link to="/communities">Browse Communities</Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="saved" className="mt-0">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(3).fill(0).map((_, i) => (
                <QuestionCard
                  key={`loading-saved-${i}`}
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
              ))}
            </div>
          ) : savedQuestions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedQuestions.map((question) => (
                <QuestionCard key={question.id} {...question} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">You haven't saved any questions yet</h3>
              <p className="text-muted-foreground mb-4">Save questions to read them later</p>
              <Button asChild variant="outline">
                <Link to="/communities">Browse Communities</Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
