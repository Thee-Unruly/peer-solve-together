
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { HexColorPicker } from "react-colorful";

const formSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Community name must be at least 3 characters long" })
    .max(50, { message: "Community name cannot exceed 50 characters" }),
  slug: z
    .string()
    .min(3, { message: "Slug must be at least 3 characters long" })
    .max(50, { message: "Slug cannot exceed 50 characters" })
    .regex(/^[a-z0-9-]+$/, { 
      message: "Slug can only contain lowercase letters, numbers, and hyphens" 
    }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters long" })
    .max(500, { message: "Description cannot exceed 500 characters" }),
  color: z.string().min(4).max(9),
});

export default function NewCommunityPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      color: "#9b87f5",
    },
  });

  const watchedColor = form.watch("color");

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value;
    form.setValue("name", name);
    
    // Auto-generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-")         // Replace spaces with hyphens
      .replace(/-+/g, "-");         // Replace multiple hyphens with a single hyphen
      
    form.setValue("slug", slug);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You must be logged in to create a community"
      });
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log("Creating community with values:", values);
      
      // Insert the community into Supabase groups table
      const { data, error } = await supabase
        .from("groups")
        .insert({
          name: values.name,
          slug: values.slug,
          description: values.description,
          color: values.color,
        })
        .select();

      if (error) {
        console.error("Supabase error details:", error);
        throw error;
      }
      
      toast({
        title: "Community created successfully!",
        description: "Your community has been created."
      });
      
      // Navigate back to communities page
      navigate("/communities");
      
    } catch (error: any) {
      console.error("Error creating community:", error);
      toast({
        variant: "destructive",
        title: "Failed to create community",
        description: error.message || "Please try again"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container max-w-4xl py-10 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Create a New Community</h1>
      <Card>
        <CardHeader>
          <CardTitle>New Community</CardTitle>
          <CardDescription>
            Fill out the form below to create a new community. Communities are spaces where users can discuss specific topics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Community Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="E.g., Mathematics" 
                        {...field} 
                        onChange={(e) => handleNameChange(e)}
                      />
                    </FormControl>
                    <FormDescription>
                      A clear, descriptive name for your community.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Community URL Slug</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="E.g., mathematics" 
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This will be used in the URL: /communities/{field.value || 'slug'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe what your community is about..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Explain the purpose and topics of your community.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theme Color</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-10 h-10 rounded-full cursor-pointer border"
                          style={{ backgroundColor: watchedColor }}
                          onClick={() => setShowColorPicker(!showColorPicker)}
                        />
                        <Input 
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="#9b87f5"
                        />
                      </div>
                    </FormControl>
                    {showColorPicker && (
                      <div className="mt-2">
                        <HexColorPicker color={field.value} onChange={field.onChange} />
                      </div>
                    )}
                    <FormDescription>
                      Choose a color that represents your community.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Community"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
