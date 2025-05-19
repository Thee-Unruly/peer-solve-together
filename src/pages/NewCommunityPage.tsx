
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Define form schema with validation rules
const formSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters long" })
    .max(50, { message: "Name cannot exceed 50 characters" }),
  slug: z
    .string()
    .min(3, { message: "Slug must be at least 3 characters long" })
    .max(30, { message: "Slug cannot exceed 30 characters" })
    .regex(/^[a-z0-9-]+$/, { message: "Slug can only contain lowercase letters, numbers, and hyphens" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters long" })
    .max(500, { message: "Description cannot exceed 500 characters" }),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, { message: "Please enter a valid hex color code" }),
});

export default function NewCommunityPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      color: "#9b87f5",
    },
  });

  // Auto-generate slug from the name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const generatedSlug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    
    form.setValue("slug", generatedSlug);
  };

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You must be logged in to create a community",
      });
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if a community with this slug already exists
      const { data: existingGroup, error: checkError } = await supabase
        .from("groups")
        .select("slug")
        .eq("slug", values.slug)
        .single();

      if (existingGroup) {
        form.setError("slug", {
          message: "This community slug already exists. Please choose another.",
        });
        setIsSubmitting(false);
        return;
      }

      // Insert the new community into Supabase
      const { error } = await supabase.from("groups").insert({
        name: values.name,
        slug: values.slug,
        description: values.description,
        color: values.color,
      });

      if (error) {
        console.error("Error creating community:", error);
        throw error;
      }

      toast({
        title: "Community created!",
        description: `${values.name} has been successfully created.`,
      });

      // Navigate to the communities page
      navigate("/communities");
    } catch (error: any) {
      console.error("Error submitting community:", error);
      toast({
        variant: "destructive",
        title: "Failed to create community",
        description: error.message || "Please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Predefined color options
  const colorOptions = [
    { name: "Purple", value: "#9b87f5" },
    { name: "Blue", value: "#1EAEDB" },
    { name: "Lavender", value: "#7E69AB" },
    { name: "Peach", value: "#FEC6A1" },
    { name: "Mint", value: "#F2FCE2" },
    { name: "Pink", value: "#FFDEE2" },
    { name: "Yellow", value: "#FEF7CD" },
    { name: "Sky", value: "#D3E4FD" },
  ];

  return (
    <div className="container max-w-3xl py-10 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Create New Community</h1>

      <Card>
        <CardHeader>
          <CardTitle>Community Details</CardTitle>
          <CardDescription>
            Fill out the form below to create a new community for academic discussions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Community Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="E.g., Quantum Physics" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          handleNameChange(e);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Choose a descriptive name for your community.
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
                        placeholder="E.g., quantum-physics" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      This will be used in the URL for your community. Use only lowercase letters, numbers, and hyphens.
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
                      Provide details about the topics covered in this community.
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
                    <FormLabel>Community Color</FormLabel>
                    <div className="flex flex-wrap gap-3 mb-3">
                      {colorOptions.map((color) => (
                        <div
                          key={color.value}
                          className={`w-10 h-10 rounded-full cursor-pointer border-2 ${
                            field.value === color.value
                              ? "border-primary"
                              : "border-transparent"
                          }`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => form.setValue("color", color.value)}
                          title={color.name}
                        />
                      ))}
                    </div>
                    <FormControl>
                      <div className="flex items-center gap-3">
                        <Input {...field} />
                        <div
                          className="w-8 h-8 rounded"
                          style={{ backgroundColor: field.value }}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Select a color to represent your community.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/communities")}
                >
                  Cancel
                </Button>
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
