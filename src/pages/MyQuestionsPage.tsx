
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuestionCard } from "@/components/QuestionCard";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function MyQuestionsPage() {
  const [activeTab, setActiveTab] = useState("asked");

  // Mock data for questions
  const myQuestions = [
    {
      id: "q1",
      title: "How do you find the derivative of f(x) = x³ + 2x² - 4x + 1?",
      excerpt: "I'm struggling with this calculus problem. Can someone explain the steps?",
      author: { name: "You", avatar: "" },
      createdAt: "2 hours ago",
      subject: "Calculus",
      difficulty: "Intermediate" as const,
      answersCount: 3,
    },
    {
      id: "q2",
      title: "What is the significance of the Magna Carta in world history?",
      excerpt: "I need to write an essay about the Magna Carta and its historical impact.",
      author: { name: "You", avatar: "" },
      createdAt: "1 day ago",
      subject: "History",
      difficulty: "Beginner" as const,
      answersCount: 0,
    },
  ];

  const answeredQuestions = [
    {
      id: "q3",
      title: "How to implement binary search in Python?",
      excerpt: "I understand the concept but I'm having trouble with the implementation.",
      author: { name: "Marcus Lee", avatar: "" },
      createdAt: "5 hours ago",
      subject: "Programming",
      difficulty: "Beginner" as const,
      answersCount: 5,
    },
    {
      id: "q4",
      title: "What's the difference between mitosis and meiosis?",
      excerpt: "I'm studying for my biology exam and getting confused between these processes.",
      author: { name: "Aisha Johnson", avatar: "" },
      createdAt: "3 days ago",
      subject: "Biology",
      difficulty: "Intermediate" as const,
      answersCount: 3,
    },
  ];

  const savedQuestions = [
    {
      id: "q5",
      title: "Newton's Second Law of Motion - Application Problem",
      excerpt: "Need help solving this problem about a block on an inclined plane.",
      author: { name: "Sophie Wang", avatar: "" },
      createdAt: "1 day ago",
      subject: "Physics",
      difficulty: "Advanced" as const,
      answersCount: 2,
    },
  ];

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
          {myQuestions.length > 0 ? (
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
          {answeredQuestions.length > 0 ? (
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
          {savedQuestions.length > 0 ? (
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
