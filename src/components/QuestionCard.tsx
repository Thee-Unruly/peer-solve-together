
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";

export type DifficultyType = "Beginner" | "Intermediate" | "Advanced";

export interface QuestionCardProps {
  id: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatar: string;
  };
  createdAt: string;
  subject: string;
  difficulty: DifficultyType;
  answersCount: number;
  isLoading?: boolean;
  votes?: number;
  hasVoted?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  id,
  title,
  excerpt,
  author,
  createdAt,
  subject,
  difficulty,
  answersCount,
  isLoading = false,
  votes = 0,
  hasVoted = false,
}) => {
  const { user } = useAuth();
  const [isVoting, setIsVoting] = React.useState(false);
  const [currentVotes, setCurrentVotes] = React.useState(votes);
  const [userHasVoted, setUserHasVoted] = React.useState(hasVoted);

  const getDifficultyColor = () => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Intermediate":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "Advanced":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to the question
    
    if (!user) {
      toast.error("Please sign in to vote");
      return;
    }

    setIsVoting(true);
    
    try {
      if (userHasVoted) {
        // Remove vote
        const { error } = await supabase
          .from("votes")
          .delete()
          .eq("entity_id", id)
          .eq("user_id", user.id)
          .eq("entity_type", "question");
        
        if (error) throw error;

        await supabase
          .from("questions")
          .update({ votes: currentVotes - 1 })
          .eq("id", id);
        
        setCurrentVotes(prev => prev - 1);
        setUserHasVoted(false);
      } else {
        // Add vote
        const { error } = await supabase
          .from("votes")
          .insert({
            entity_id: id,
            entity_type: "question",
            user_id: user.id,
            value: 1
          });
        
        if (error) throw error;

        await supabase
          .from("questions")
          .update({ votes: currentVotes + 1 })
          .eq("id", id);
        
        setCurrentVotes(prev => prev + 1);
        setUserHasVoted(true);
      }
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to register vote");
    } finally {
      setIsVoting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden transition-all">
        <CardHeader className="p-4 pb-0">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <div className="flex gap-2 mt-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-4/5" />
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold line-clamp-2">
            <Link to={`/questions/${id}`} className="hover:underline">
              {title}
            </Link>
          </h3>
        </div>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline" className="text-xs">
            {subject}
          </Badge>
          <Badge
            variant="outline"
            className={`text-xs ${getDifficultyColor()}`}
          >
            {difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-muted-foreground line-clamp-2">{excerpt}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={author.avatar} />
            <AvatarFallback>
              {author.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{author.name}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">
            {new Date(createdAt).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full"
              onClick={handleVote}
              disabled={isVoting}
            >
              <ThumbsUp 
                className={`h-4 w-4 ${userHasVoted ? "fill-current text-primary" : ""}`} 
              />
            </Button>
            <span className="text-xs font-medium">{currentVotes}</span>
          </div>
          <span className="text-xs font-medium">
            {answersCount} {answersCount === 1 ? "answer" : "answers"}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};
