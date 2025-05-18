
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardFooter,
  CardDescription,
  CardTitle
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ThumbsUp, ArrowLeft, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [question, setQuestion] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(true);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [userVotes, setUserVotes] = useState<Record<string, boolean>>({});
  const [answerVotes, setAnswerVotes] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!id) return;

    fetchQuestion();
    fetchAnswers();
    
    // Set up real-time updates
    const channel = supabase
      .channel('detailed-question')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'questions', filter: `id=eq.${id}` },
        () => {
          fetchQuestion();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'answers', filter: `question_id=eq.${id}` },
        () => {
          fetchAnswers();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        () => {
          fetchQuestion();
          fetchAnswers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const fetchQuestion = async () => {
    if (!id) return;
    
    setIsLoadingQuestion(true);
    
    try {
      const { data, error } = await supabase
        .from("questions")
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        setQuestion({
          ...data,
          author: {
            name: data.profiles?.username || "Anonymous User",
            avatar: data.profiles?.avatar_url || ""
          }
        });
        
        // Check if user has voted on this question
        if (user) {
          const { data: voteData } = await supabase
            .from("votes")
            .select("entity_id")
            .eq("user_id", user.id)
            .eq("entity_type", "question")
            .eq("entity_id", id);
            
          if (voteData && voteData.length > 0) {
            setUserVotes(prev => ({
              ...prev,
              [id]: true
            }));
          }
        }
      }
    } catch (error) {
      console.error("Error fetching question:", error);
      toast.error("Failed to load the question");
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const fetchAnswers = async () => {
    if (!id) return;
    
    setIsLoadingAnswers(true);
    
    try {
      const { data, error } = await supabase
        .from("answers")
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq("question_id", id)
        .order("votes", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setAnswers(data.map(answer => ({
          ...answer,
          author: {
            name: answer.profiles?.username || "Anonymous User",
            avatar: answer.profiles?.avatar_url || ""
          }
        })));
        
        // Create map of answer votes
        const votesMap = data.reduce((acc, answer) => {
          acc[answer.id] = answer.votes || 0;
          return acc;
        }, {});
        
        setAnswerVotes(votesMap);
        
        // Check which answers the user has voted on
        if (user) {
          const answerIds = data.map(a => a.id);
          
          if (answerIds.length > 0) {
            const { data: voteData } = await supabase
              .from("votes")
              .select("entity_id")
              .eq("user_id", user.id)
              .eq("entity_type", "answer")
              .in("entity_id", answerIds);
              
            if (voteData) {
              const votedAnswerIds = voteData.map(v => v.entity_id);
              
              const newUserVotes = {...userVotes};
              votedAnswerIds.forEach(id => {
                newUserVotes[id] = true;
              });
              
              setUserVotes(newUserVotes);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching answers:", error);
      toast.error("Failed to load answers");
    } finally {
      setIsLoadingAnswers(false);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to answer");
      navigate("/auth");
      return;
    }
    
    if (!newAnswer.trim()) {
      toast.error("Answer cannot be empty");
      return;
    }
    
    setIsSubmittingAnswer(true);
    
    try {
      const { error } = await supabase
        .from("answers")
        .insert({
          body: newAnswer,
          question_id: id,
          user_id: user.id,
          votes: 0
        });

      if (error) throw error;

      toast.success("Answer posted successfully!");
      setNewAnswer("");
    } catch (error) {
      console.error("Error posting answer:", error);
      toast.error("Failed to post your answer");
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleVote = async (entityId: string, entityType: "question" | "answer", currentVotes: number) => {
    if (!user) {
      toast.error("Please sign in to vote");
      navigate("/auth");
      return;
    }
    
    try {
      const hasVoted = userVotes[entityId];
      
      if (hasVoted) {
        // Remove vote
        const { error: deleteError } = await supabase
          .from("votes")
          .delete()
          .eq("entity_id", entityId)
          .eq("user_id", user.id)
          .eq("entity_type", entityType);
        
        if (deleteError) throw deleteError;
        
        // Update entity votes count
        const { error: updateError } = await supabase
          .from(entityType === "question" ? "questions" : "answers")
          .update({ votes: currentVotes - 1 })
          .eq("id", entityId);
          
        if (updateError) throw updateError;
        
        // Update local state
        setUserVotes(prev => ({
          ...prev,
          [entityId]: false
        }));
        
        if (entityType === "answer") {
          setAnswerVotes(prev => ({
            ...prev,
            [entityId]: Math.max(0, (prev[entityId] || 0) - 1)
          }));
        }
      } else {
        // Add vote
        const { error: insertError } = await supabase
          .from("votes")
          .insert({
            entity_id: entityId,
            entity_type: entityType,
            user_id: user.id,
            value: 1
          });
        
        if (insertError) throw insertError;
        
        // Update entity votes count
        const { error: updateError } = await supabase
          .from(entityType === "question" ? "questions" : "answers")
          .update({ votes: currentVotes + 1 })
          .eq("id", entityId);
          
        if (updateError) throw updateError;
        
        // Update local state
        setUserVotes(prev => ({
          ...prev,
          [entityId]: true
        }));
        
        if (entityType === "answer") {
          setAnswerVotes(prev => ({
            ...prev,
            [entityId]: (prev[entityId] || 0) + 1
          }));
        }
      }
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to register your vote");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getDifficultyColor = (category: string) => {
    const lowerCategory = (category || "").toLowerCase();
    
    if (lowerCategory.includes("advanced") || lowerCategory.includes("complex")) {
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    } else if (lowerCategory.includes("intermediate") || lowerCategory.includes("college")) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    }
    
    return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  };

  const findDifficulty = (category: string): "Beginner" | "Intermediate" | "Advanced" => {
    const lowerCategory = (category || "").toLowerCase();
    
    if (lowerCategory.includes("advanced") || lowerCategory.includes("complex")) {
      return "Advanced";
    } else if (lowerCategory.includes("intermediate") || lowerCategory.includes("college")) {
      return "Intermediate";
    }
    
    return "Beginner";
  };
  
  return (
    <div className="container max-w-4xl py-10 px-4 md:px-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        {isLoadingQuestion ? (
          <div>
            <Skeleton className="h-10 w-3/4 mb-4" />
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-28" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full mr-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        ) : question ? (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{question.title}</CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="text-sm">
                      {question.category}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-sm ${getDifficultyColor(question.category)}`}
                    >
                      {findDifficulty(question.category)}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 rounded-full ${userVotes[question.id] ? "bg-primary/10" : ""}`}
                  onClick={() => handleVote(question.id, "question", question.votes || 0)}
                >
                  <ThumbsUp className={`h-4 w-4 ${userVotes[question.id] ? "fill-current text-primary" : ""}`} />
                  <span className="sr-only">Vote</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="py-4">
              <div className="prose prose-sm dark:prose-invert">
                <p className="whitespace-pre-wrap">{question.body}</p>
              </div>
            </CardContent>
            <CardFooter className="pt-0 pb-4 flex justify-between items-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={question.author?.avatar} />
                  <AvatarFallback>
                    {question.author?.name?.charAt(0).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <span>{question.author?.name}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDate(question.created_at)}</span>
                <span className="mx-2">•</span>
                <ThumbsUp className="h-4 w-4 mr-1" />
                <span>{question.votes || 0} votes</span>
              </div>
            </CardFooter>
          </Card>
        ) : (
          <div className="text-center p-10">
            <h2 className="text-xl font-medium">Question not found</h2>
            <p className="text-muted-foreground mt-2">
              The question you're looking for might have been removed or doesn't exist.
            </p>
            <Button asChild className="mt-4">
              <Link to="/communities">Browse Communities</Link>
            </Button>
          </div>
        )}
      </div>
      
      {question && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Answers ({answers.length})
          </h2>
          
          {isLoadingAnswers ? (
            <div className="space-y-4">
              {[1, 2].map((_, i) => (
                <Card key={`skeleton-answer-${i}`}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-4 w-32" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : answers.length > 0 ? (
            <div className="space-y-4">
              {answers.map((answer) => (
                <Card key={answer.id} className="transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={answer.author?.avatar} />
                          <AvatarFallback>
                            {answer.author?.name?.charAt(0).toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{answer.author?.name}</span>
                        {answer.is_accepted && (
                          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Accepted
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 rounded-full ${userVotes[answer.id] ? "bg-primary/10" : ""}`}
                          onClick={() => handleVote(answer.id, "answer", answer.votes || 0)}
                        >
                          <ThumbsUp className={`h-4 w-4 ${userVotes[answer.id] ? "fill-current text-primary" : ""}`} />
                        </Button>
                        <span className="ml-1 text-sm">{answerVotes[answer.id] || answer.votes || 0}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="py-4">
                    <div className="prose prose-sm dark:prose-invert">
                      <p className="whitespace-pre-wrap">{answer.body}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 pb-2 text-xs text-muted-foreground">
                    <span>Answered {formatDate(answer.created_at)}</span>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-secondary/50 p-6 text-center">
              <CardDescription>
                No answers yet. Be the first to answer!
              </CardDescription>
            </Card>
          )}
          
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Your Answer</h3>
            <form onSubmit={handleSubmitAnswer}>
              <Textarea
                placeholder="Write your answer here..."
                className="min-h-[200px] mb-4"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmittingAnswer}>
                  {isSubmittingAnswer ? "Posting..." : "Post Answer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
