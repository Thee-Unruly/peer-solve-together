
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TopicCardProps {
  id: string;
  title: string;
  description: string;
  memberCount: number;
  questionCount: number;
  tags: string[];
  color: string;
}

export function TopicCard({
  id,
  title,
  description,
  memberCount,
  questionCount,
  tags,
  color,
}: TopicCardProps) {
  return (
    <Link to={`/communities/${id}`}>
      <Card className="hover:shadow-lg transition-shadow overflow-hidden">
        <div 
          className="h-3" 
          style={{ 
            background: color || 'var(--peersolve-purple)' 
          }} 
        />
        <CardHeader className="pb-2">
          <CardTitle>{title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex gap-1 flex-wrap">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="bg-secondary text-secondary-foreground">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground pt-0">
          <div className="flex justify-between w-full">
            <span>{memberCount} members</span>
            <span>{questionCount} questions</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
