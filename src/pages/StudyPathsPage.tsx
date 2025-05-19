import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Book, Plus, ArrowRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

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
    id?: string;
  };
  followers: number;
}

export default function StudyPathsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [studyPaths, setStudyPaths] = useState<StudyPath[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPathTitle, setNewPathTitle] = useState("");
  const [newPathDescription, setNewPathDescription] = useState("");
  const [newPathSubject, setNewPathSubject] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchStudyPaths();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('study-paths-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'posts', filter: `group_slug=eq.study_path` }, 
          () => {
            fetchStudyPaths();
          })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const fetchStudyPaths = async () => {
    setIsLoading(true);
    
    try {
      // For study paths, we can use the posts table with a specific group_slug to identify them
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url,
            id
          )
        `)
        .eq('group_slug', 'study_path')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Transform posts into study paths
        const paths = await Promise.all(data.map(async (post) => {
          // Count associated questions (e.g. from a linking table or posts with a specific tag)
          const { count: questionCount } = await supabase
            .from('questions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', post.user_id);
            
          const { count: resourceCount } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);
            
          const { count: followerCount } = await supabase
            .from('votes')
            .select('*', { count: 'exact', head: true })
            .eq('entity_id', post.id)
            .eq('entity_type', 'post');
          
          return {
            id: post.id,
            title: post.title,
            description: post.body || "A curated study path",
            subject: post.image_url || "General", // Using image_url to store subject
            questionCount: questionCount || 0,
            resourceCount: resourceCount || 0,
            author: {
              name: post.profiles?.username || "Anonymous",
              avatar: post.profiles?.avatar_url || "",
              id: post.user_id
            },
            followers: followerCount || 0
          };
        }));
        
        setStudyPaths(paths);
      } else {
        // If no study paths found, use mock data
        setStudyPaths([
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
              id: user?.id
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
              id: user?.id
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
              id: user?.id
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
              id: user?.id
            },
            followers: 189,
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching study paths:", error);
      toast({
        title: "Error",
        description: "Failed to load study paths",
        variant: "destructive"});
    } finally {
      setIsLoading(false);
    }
  };
  
  const createStudyPath = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "You must be signed in to create a study path"
      });
      navigate("/auth");
      return;
    }
    
    if (!newPathTitle || !newPathSubject) {
      toast({
        variant: "destructive",
        title: "Required Fields Missing",
        description: "Title and subject are required"
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      console.log("Creating study path with user:", user.id);
      
      // First check if user profile exists
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      // If profile doesn't exist, create one
      if (!profileData) {
        await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: user.email?.split('@')[0] || 'user',
          });
      }
      
      // Create a new entry in the posts table as a study path
      const { data, error } = await supabase
        .from('posts')
        .insert({
          title: newPathTitle,
          body: newPathDescription,
          image_url: newPathSubject, // Using image_url to store subject
          group_slug: 'study_path',
          user_id: user.id,
        })
        .select();
      
      if (error) {
        console.error("Supabase error details:", error);
        throw error;
      }
      
      toast({
        title: "Success!",
        description: "Study path created successfully!"
      });
      
      setDialogOpen(false);
      setNewPathTitle("");
      setNewPathDescription("");
      setNewPathSubject("");
      
      // Navigate to the newly created path
      if (data && data[0]) {
        navigate(`/study-paths/${data[0].id}`);
      } else {
        fetchStudyPaths();
      }
    } catch (error: any) {
      console.error("Error creating study path:", error);
      toast({
        variant: "destructive",
        title: "Failed to create study path",
        description: error.message || "Please try again"
      });
    } finally {
      setIsCreating(false);
    }
  };

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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Study Path
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Study Path</DialogTitle>
              <DialogDescription>
                Create a structured learning journey for yourself or others.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="title">
                  Title
                </label>
                <Input
                  id="title"
                  placeholder="E.g., Calculus Fundamentals"
                  value={newPathTitle}
                  onChange={(e) => setNewPathTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="subject">
                  Subject
                </label>
                <Input
                  id="subject"
                  placeholder="E.g., Mathematics"
                  value={newPathSubject}
                  onChange={(e) => setNewPathSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="description">
                  Description
                </label>
                <Textarea
                  id="description"
                  placeholder="Describe your study path..."
                  className="min-h-[100px]"
                  value={newPathDescription}
                  onChange={(e) => setNewPathDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="button"
                onClick={createStudyPath}
                disabled={isCreating || !newPathTitle || !newPathSubject}
              >
                {isCreating ? "Creating..." : "Create Study Path"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <Card key={`skeleton-${i}`} className="overflow-hidden">
              <div className="h-2 bg-secondary" />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-6 w-full mt-2" />
                <Skeleton className="h-4 w-4/5" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Skeleton className="h-6 w-6 rounded-full mr-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
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
              <p className="text-muted-foreground mb-4">Try a different search term or create your own path</p>
              <Button onClick={() => setSearchTerm("")}>View All Study Paths</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
