
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface QuestionCardProps {
  id: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
  subject: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  answersCount: number;
}

export function QuestionCard({
  id,
  title,
  excerpt,
  author,
  createdAt,
  subject,
  difficulty,
  answersCount,
}: QuestionCardProps) {
  const difficultyColors = {
    Beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    Intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    Advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <Link to={`/questions/${id}`}>
      <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <Badge className={difficultyColors[difficulty]}>{difficulty}</Badge>
              <Badge variant="outline" className="ml-2">
                {subject}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {answersCount} {answersCount === 1 ? "answer" : "answers"}
            </div>
          </div>
          <CardTitle className="mt-2 line-clamp-2">{title}</CardTitle>
          <CardDescription className="line-clamp-2">{excerpt}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          {/* Content goes here if needed */}
        </CardContent>
        <CardFooter className="pt-0 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={author.avatar} />
              <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{author.name}</span>
            <span className="mx-1">•</span>
            <span>{createdAt}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
