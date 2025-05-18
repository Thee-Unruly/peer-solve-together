
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  title: z
    .string()
    .min(10, { message: "Title must be at least 10 characters long" })
    .max(100, { message: "Title cannot exceed 100 characters" }),
  subject: z.string({ required_error: "Please select a subject" }),
  difficulty: z.string({ required_error: "Please select a difficulty level" }),
  content: z
    .string()
    .min(20, { message: "Question details must be at least 20 characters long" })
    .max(5000, { message: "Question details cannot exceed 5000 characters" }),
  useAiAssist: z.boolean().default(false),
});

export default function AskQuestionPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAiAssistOpen, setIsAiAssistOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      subject: "",
      difficulty: "",
      content: "",
      useAiAssist: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real app, we would send this data to an API
    console.log(values);

    toast({
      title: "Question submitted!",
      description: "Your question has been posted successfully.",
    });
    
    // Navigate to a thank-you page or back to the home page
    navigate("/");
  }

  function toggleAiAssist() {
    setIsAiAssistOpen(!isAiAssistOpen);
  }

  const subjects = [
    "Mathematics", 
    "Physics", 
    "Chemistry", 
    "Biology", 
    "Computer Science",
    "Literature",
    "History",
    "Economics",
    "Geography",
    "Psychology",
    "Sociology",
    "Philosophy",
    "Art",
    "Music",
    "Foreign Languages",
  ];

  return (
    <div className="container max-w-4xl py-10 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Ask a Question</h1>
      <Card>
        <CardHeader>
          <CardTitle>New Question</CardTitle>
          <CardDescription>
            Fill out the form below to ask your academic question. Be specific to get better answers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Title</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., How do you solve quadratic equations?" {...field} />
                    </FormControl>
                    <FormDescription>
                      A clear, specific title will attract better answers.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject} value={subject.toLowerCase()}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Details</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide all the necessary details about your question..." 
                        className="min-h-[200px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Include what you've tried so far and where specifically you're stuck.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="bg-secondary/50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">AI Assist</h3>
                    <p className="text-sm text-muted-foreground">
                      Let our AI help break down your question into manageable parts.
                    </p>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={toggleAiAssist}
                  >
                    {isAiAssistOpen ? "Hide AI Assist" : "Use AI Assist"}
                  </Button>
                </div>
                
                {isAiAssistOpen && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <FormLabel>What do you already know?</FormLabel>
                      <Textarea 
                        placeholder="List the concepts, formulas, or facts you already understand..." 
                        className="min-h-[100px]"
                      />
                    </div>
                    <div>
                      <FormLabel>What are you trying to find?</FormLabel>
                      <Textarea 
                        placeholder="What's your goal or desired outcome?" 
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button type="submit">Post Question</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
