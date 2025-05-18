
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Book, Plus, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link } from "react-router-dom";

interface StudyPath {
  id: string;
  title: string;
  description: string;
  subject: string;
  questionCount: number;
  resourceCount: number;
  author: {
    name: string;
    avatar?: string;
  };
  followers: number;
}

export default function StudyPathsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data
  const studyPaths: StudyPath[] = [
    {
      id: "calculus-101",
      title: "Calculus Fundamentals",
      description: "A comprehensive introduction to differential and integral calculus for beginners.",
      subject: "Mathematics",
      questionCount: 24,
      resourceCount: 8,
      author: {
        name: "Prof. Smith",
        avatar: "",
      },
      followers: 342,
    },
    {
      id: "python-basics",
      title: "Python Programming: Zero to Hero",
      description: "Learn Python from scratch with hands-on coding problems and examples.",
      subject: "Computer Science",
      questionCount: 42,
      resourceCount: 15,
      author: {
        name: "Coding Master",
        avatar: "",
      },
      followers: 578,
    },
    {
      id: "organic-chemistry",
      title: "Organic Chemistry Essentials",
      description: "Master the fundamentals of organic chemistry with this curated study path.",
      subject: "Chemistry",
      questionCount: 36,
      resourceCount: 12,
      author: {
        name: "Dr. Martinez",
        avatar: "",
      },
      followers: 213,
    },
    {
      id: "physics-mechanics",
      title: "Classical Mechanics Mastery",
      description: "From Newton's laws to Hamiltonian mechanics - a comprehensive study guide.",
      subject: "Physics",
      questionCount: 30,
      resourceCount: 10,
      author: {
        name: "Physics Pro",
        avatar: "",
      },
      followers: 189,
    },
  ];

  const filteredPaths = studyPaths.filter(
    (path) =>
      path.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      path.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      path.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-10 px-4 md:px-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Study Paths</h1>
          <p className="text-muted-foreground">
            Curated learning journeys to master any subject
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Study Path
        </Button>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search study paths..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPaths.map((path) => (
          <Card key={path.id} className="overflow-hidden">
            <div 
              className="h-2 bg-gradient-to-r from-peersolve-purple to-peersolve-blue-DEFAULT"
            />
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge>{path.subject}</Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Book className="h-4 w-4 mr-1" />
                  <span>
                    {path.questionCount} questions • {path.resourceCount} resources
                  </span>
                </div>
              </div>
              <CardTitle className="mt-2">{path.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {path.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage src={path.author.avatar} />
                  <AvatarFallback>{path.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{path.author.name}</span>
                <span className="mx-2 text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  {path.followers} followers
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" variant="outline">
                <Link to={`/study-paths/${path.id}`}>
                  View Path <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        {filteredPaths.length === 0 && (
          <div className="col-span-full text-center py-12">
            <h3 className="text-xl font-medium mb-2">No study paths found</h3>
            <p className="text-muted-foreground mb-4">Try a different search term</p>
            <Button onClick={() => setSearchTerm("")}>View All Study Paths</Button>
          </div>
        )}
      </div>
    </div>
  );
}
