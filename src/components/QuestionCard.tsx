
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  title,
  excerpt,
  author,
  createdAt,
  subject,
  difficulty,
  answersCount,
}) => {
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

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold line-clamp-2">{title}</h3>
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
          <span className="text-xs font-medium">
            {answersCount} {answersCount === 1 ? "answer" : "answers"}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};
