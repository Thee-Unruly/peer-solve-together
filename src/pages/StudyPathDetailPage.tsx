import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/sonner';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from '@/components/ui/card';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from '@/components/ui/avatar';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Plus, 
  Search,
  ThumbsUp,
  Trash2,
  Edit,
  Book,
  CheckCircle
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { QuestionCard } from '@/components/QuestionCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function StudyPathDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [studyPath, setStudyPath] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPathOwner, setIsPathOwner] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    if (!id) return;
    
    fetchStudyPath();
    
    // Set up real-time updates
    const channel = supabase
      .channel('study-path-detail-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'posts', filter: `id=eq.${id}` }, 
          () => {
            fetchStudyPath();
          })
      .on('postgres_changes',
          { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${id}` },
          () => {
            fetchPathQuestions();
          })
      .on('postgres_changes',
          { event: '*', schema: 'public', table: 'votes', filter: `entity_id=eq.${id}` },
          () => {
            checkFollowStatus();
          })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, user]);
  
  const fetchStudyPath = async () => {
    if (!id) return;
    
    setIsLoading(true);
    
    try {
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
        .eq('id', id)
        .eq('group_slug', 'study_path')
        .single();
      
      if (error) throw error;
      
      if (data) {
        setStudyPath({
          ...data,
          title: data.title,
          description: data.body,
          subject: data.image_url, // We used image_url to store subject
          author: {
            name: data.profiles?.username || "Anonymous",
            avatar: data.profiles?.avatar_url || "",
            id: data.profiles?.id
          }
        });
        
        setEditTitle(data.title);
        setEditDescription(data.body || '');
        setEditSubject(data.image_url || '');
        
        // Check if the current user is the owner of this study path
        if (user && data.user_id === user.id) {
          setIsPathOwner(true);
        } else {
          setIsPathOwner(false);
        }
        
        // Fetch linked questions
        fetchPathQuestions();
        
        // Check if the user is following this path
        checkFollowStatus();
      }
    } catch (error) {
      console.error('Error fetching study path:', error);
      toast.error('Failed to load the study path');
      navigate('/study-paths');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Updated fetchPathQuestions function to fix the count() TypeScript error
const fetchPathQuestions = async () => {
  if (!id) return;
  
  setIsLoadingQuestions(true);
  
  try {
    // Get linked questions from comments table (we use comments to store path-question associations)
    const { data: commentLinks, error: linksError } = await supabase
      .from('comments')
      .select('post_id, body') // Using body to store question_id
      .eq('post_id', id);
    
    if (linksError) throw linksError;
    
    if (commentLinks && commentLinks.length > 0) {
      const questionIds = commentLinks.map(link => link.body);
      
      // Now fetch the actual questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .in('id', questionIds);
      
      if (questionsError) throw questionsError;
      
      if (questionsData) {
        // Get answer counts for these questions - FIXED APPROACH
        const { data: answerCounts, error: answerError } = await supabase
          .from('answers')
          .select('question_id, count', { count: 'exact' })
          .in('question_id', questionIds)
          .group('question_id');
        
        if (answerError) {
          console.error('Error fetching answer counts:', answerError);
        }
        
        // Create a map of question_id to answer count
        const countMap: Record<string, number> = {};
        if (answerCounts) {
          // Two alternative approaches:
          
          // Approach 1: Use the raw Supabase response structure
          answerCounts.forEach(item => {
            // Check if the item has a count property
            // @ts-ignore - temporarily ignore TypeScript checking for this property
            countMap[item.question_id] = parseInt(item.count) || 0;
          });
          
          // Approach 2: Make individual count queries for each question
          // Remove this approach and keep just one if you know which works
          if (Object.keys(countMap).length === 0) {
            // If the first approach didn't work, try individual queries
            await Promise.all(questionIds.map(async (qId) => {
              const { count } = await supabase
                .from('answers')
                .select('*', { count: 'exact', head: true })
                .eq('question_id', qId);
              
              countMap[qId] = count || 0;
            }));
          }
        }
        
        // Transform question data
        const formattedQuestions = questionsData.map(q => ({
          id: q.id,
          title: q.title,
          excerpt: q.body || "No description provided",
          author: {
            name: q.profiles?.username || "Anonymous",
            avatar: q.profiles?.avatar_url || ""
          },
          createdAt: q.created_at || new Date().toISOString(),
          subject: q.category,
          difficulty: mapDifficultyFromCategory(q.category),
          answersCount: countMap[q.id] || 0,
          votes: q.votes || 0
        }));
        
        setQuestions(formattedQuestions);
      }
    } else {
      setQuestions([]);
    }
  } catch (error) {
    console.error('Error fetching path questions:', error);
    toast.error('Failed to load questions');
  } finally {
    setIsLoadingQuestions(false);
  }
};
  
  const checkFollowStatus = async () => {
    if (!id || !user) return;
    
    try {
      const { data } = await supabase
        .from('votes')
        .select('*')
        .eq('entity_id', id)
        .eq('entity_type', 'post')
        .eq('user_id', user.id);
      
      setIsFollowing(data && data.length > 0);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };
  
  const handleFollow = async () => {
    if (!user) {
      toast.error('Please sign in to follow this study path');
      navigate('/auth');
      return;
    }
    
    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('votes')
          .delete()
          .eq('entity_id', id)
          .eq('entity_type', 'post')
          .eq('user_id', user.id);
          
        setIsFollowing(false);
        toast.success('Unfollowed study path');
      } else {
        // Follow
        await supabase
          .from('votes')
          .insert({
            entity_id: id,
            entity_type: 'post',
            user_id: user.id,
            value: 1
          });
          
        setIsFollowing(true);
        toast.success('Following study path');
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
      toast.error('Failed to update follow status');
    }
  };
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .ilike('title', `%${searchTerm}%`)
        .limit(10);
      
      if (error) throw error;
      
      if (data) {
        // Filter out questions that are already in the path
        const currentIds = questions.map(q => q.id);
        const filteredResults = data
          .filter(q => !currentIds.includes(q.id))
          .map(q => ({
            id: q.id,
            title: q.title,
            excerpt: q.body || "No description provided",
            author: {
              name: q.profiles?.username || "Anonymous",
              avatar: q.profiles?.avatar_url || ""
            },
            createdAt: q.created_at || new Date().toISOString(),
            subject: q.category,
            difficulty: mapDifficultyFromCategory(q.category),
            answersCount: 0,
            votes: q.votes || 0
          }));
        
        setSearchResults(filteredResults);
      }
    } catch (error) {
      console.error('Error searching questions:', error);
      toast.error('Failed to search questions');
    } finally {
      setIsSearching(false);
    }
  };
  
  const addQuestionToPath = async (questionId: string) => {
    if (!user || !isPathOwner) {
      toast.error('You must be the owner of this study path to add questions');
      return;
    }
    
    setIsAddingQuestion(true);
    
    try {
      // Create a link using comments table (post_id = path id, body = question id)
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: id,
          body: questionId,
          user_id: user.id
        });
      
      if (error) throw error;
      
      // Update UI
      setSearchResults(prev => prev.filter(q => q.id !== questionId));
      toast.success('Question added to study path');
      
      // Refresh questions
      fetchPathQuestions();
    } catch (error) {
      console.error('Error adding question to path:', error);
      toast.error('Failed to add question to path');
    } finally {
      setIsAddingQuestion(false);
    }
  };
  
  const removeQuestionFromPath = async (questionId: string) => {
    if (!user || !isPathOwner) {
      toast.error('You must be the owner of this study path to remove questions');
      return;
    }
    
    try {
      // Delete the link from comments table
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('post_id', id)
        .eq('body', questionId);
      
      if (error) throw error;
      
      // Update UI
      setQuestions(prev => prev.filter(q => q.id !== questionId));
      toast.success('Question removed from study path');
    } catch (error) {
      console.error('Error removing question from path:', error);
      toast.error('Failed to remove question');
    }
  };
  
  const handleSaveEdit = async () => {
    if (!user || !isPathOwner) {
      toast.error('You must be the owner of this study path to edit it');
      return;
    }
    
    if (!editTitle || !editSubject) {
      toast.error('Title and subject are required');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          title: editTitle,
          body: editDescription,
          image_url: editSubject // Using image_url to store subject
        })
        .eq('id', id);
      
      if (error) throw error;
      
      setIsEditing(false);
      toast.success('Study path updated successfully');
      fetchStudyPath();
    } catch (error) {
      console.error('Error updating study path:', error);
      toast.error('Failed to update study path');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeletePath = async () => {
    if (!user || !isPathOwner) {
      toast.error('You must be the owner of this study path to delete it');
      return;
    }
    
    setIsDeleting(true);
    
    try {
      // First delete all comments (links to questions)
      const { error: commentsError } = await supabase
        .from('comments')
        .delete()
        .eq('post_id', id);
      
      if (commentsError) throw commentsError;
      
      // Then delete votes
      const { error: votesError } = await supabase
        .from('votes')
        .delete()
        .eq('entity_id', id)
        .eq('entity_type', 'post');
      
      if (votesError) throw votesError;
      
      // Finally delete the study path itself
      const { error: pathError } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);
      
      if (pathError) throw pathError;
      
      toast.success('Study path deleted successfully');
      navigate('/study-paths');
    } catch (error) {
      console.error('Error deleting study path:', error);
      toast.error('Failed to delete study path');
    } finally {
      setIsDeleting(false);
      setShowDeleteAlert(false);
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
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <div className="container max-w-5xl py-10 px-4 md:px-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/study-paths')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Study Paths
        </Button>
        
        {isLoading ? (
          <div>
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-6 w-32 mb-6" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-6" />
            <div className="flex items-center">
              <Skeleton className="h-10 w-10 rounded-full mr-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        ) : (
          <>
            {isEditing ? (
              <div className="bg-card border rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Edit Study Path</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="edit-title">
                      Title
                    </label>
                    <Input
                      id="edit-title"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="edit-subject">
                      Subject
                    </label>
                    <Input
                      id="edit-subject"
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="edit-description">
                      Description
                    </label>
                    <Textarea
                      id="edit-description"
                      className="min-h-[100px]"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveEdit} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <Badge className="mb-2">{studyPath?.subject}</Badge>
                    <h1 className="text-3xl font-bold">{studyPath?.title}</h1>
                    <p className="text-muted-foreground mt-2 whitespace-pre-wrap">
                      {studyPath?.description}
                    </p>
                    
                    <div className="flex items-center mt-4">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={studyPath?.author?.avatar} />
                        <AvatarFallback>
                          {studyPath?.author?.name?.charAt(0).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="text-sm font-medium">{studyPath?.author?.name}</span>
                        <p className="text-xs text-muted-foreground">
                          Created on {studyPath?.created_at ? formatDate(studyPath.created_at) : 'unknown date'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {isPathOwner ? (
                      <>
                        <Button onClick={() => setIsEditing(true)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Path
                        </Button>
                        <Button variant="destructive" onClick={() => setShowDeleteAlert(true)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Path
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant={isFollowing ? "outline" : "default"}
                        onClick={handleFollow}
                        className="min-w-[120px]"
                      >
                        {isFollowing ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Following
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Follow
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                
                <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to delete this study path?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        study path and remove all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeletePath}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
            
            <Separator className="my-8" />
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-semibold">
                Questions ({questions.length})
              </h2>
              
              {isPathOwner && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Questions
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Add Questions to Study Path</DialogTitle>
                      <DialogDescription>
                        Search for questions to add to your study path
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSearch} className="py-4">
                      <div className="flex w-full max-w-md items-center space-x-2">
                        <Input
                          placeholder="Search questions..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Button type="submit" disabled={isSearching}>
                          {isSearching ? "Searching..." : "Search"}
                        </Button>
                      </div>
                    </form>
                    
                    <div className="max-h-[300px] overflow-y-auto">
                      {searchResults.length > 0 ? (
                        <div className="space-y-4">
                          {searchResults.map((question) => (
                            <Card key={question.id} className="overflow-hidden">
                              <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-base font-medium">
                                  {question.title}
                                </CardTitle>
                                <div className="flex gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {question.subject}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="p-4 pt-2">
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {question.excerpt}
                                </p>
                              </CardContent>
                              <CardFooter className="p-4 pt-0 flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  By {question.author.name}
                                </span>
                                <Button 
                                  size="sm" 
                                  onClick={() => addQuestionToPath(question.id)}
                                  disabled={isAddingQuestion}
                                >
                                  Add to Path
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      ) : searchTerm && !isSearching ? (
                        <p className="text-center py-4 text-muted-foreground">
                          No questions found matching your search
                        </p>
                      ) : !searchTerm ? (
                        <p className="text-center py-4 text-muted-foreground">
                          Search for questions to add them to your study path
                        </p>
                      ) : null}
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" type="button" asChild>
                        <Link to="/ask">Ask New Question</Link>
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            
            {isLoadingQuestions ? (
              <div className="grid grid-cols-1 gap-4">
                {Array(3).fill(0).map((_, i) => (
                  <QuestionCard
                    key={`loading-question-${i}`}
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
            ) : questions.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {questions.map((question, index) => (
                  <div key={question.id} className="relative">
                    {isPathOwner && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                        onClick={() => removeQuestionFromPath(question.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    )}
                    <div className="relative">
                      <Badge className="absolute -left-3 -top-3 z-10">#{index + 1}</Badge>
                      <QuestionCard {...question} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="bg-secondary/50">
                <CardHeader>
                  <CardTitle className="text-center">No questions yet</CardTitle>
                  <CardDescription className="text-center">
                    {isPathOwner ? 
                      "Add questions to your study path to get started" : 
                      "This study path doesn't have any questions yet"}
                  </CardDescription>
                </CardHeader>
                {isPathOwner && (
                  <CardFooter className="flex justify-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Questions
                        </Button>
                      </DialogTrigger>
                      {/* Dialog content is the same as above */}
                    </Dialog>
                  </CardFooter>
                )}
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
