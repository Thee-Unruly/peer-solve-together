import { useState, useEffect } from "react";
import { TopicCard } from "@/components/TopicCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, PlusCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface Community {
  id: string;
  title: string;
  description: string;
  memberCount: number;
  questionCount: number;
  tags: string[];
  color: string;
}

export default function CommunitiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchCommunities() {
      setIsLoading(true);
      try {
        // First try to get communities from the groups table
        const { data: groupsData, error: groupsError } = await supabase
          .from("groups")
          .select("*");

        if (groupsError) {
          throw groupsError;
        }

        if (groupsData && groupsData.length > 0) {
          // Transform groups data into communities format
          const formattedCommunities = await Promise.all(
            groupsData.map(async (group) => {
              // Count questions for this group
              const { count: questionCount, error: countError } = await supabase
                .from("questions")
                .select("*", { count: "exact", head: true })
                .eq("category", group.name.toLowerCase());

              if (countError) console.error("Error counting questions:", countError);

              // Get unique tags for this group (using questions)
              const { data: tagsData } = await supabase
                .from("questions")
                .select("category")
                .eq("category", group.name.toLowerCase())
                .limit(3);

              const tags = tagsData
                ? Array.from(new Set(tagsData.map(q => q.category)))
                : [group.name];

              return {
                id: group.slug,
                title: group.name,
                description: group.description || `Explore ${group.name} topics and questions`,
                memberCount: Math.floor(Math.random() * 1000) + 100, // Placeholder
                questionCount: questionCount || 0,
                tags: tags,
                color: group.color || getRandomColor(),
              };
            })
          );
          
          setCommunities(formattedCommunities);
        } else {
          // If no groups in database, use mock data instead
          setCommunities([
            {
              id: "mathematics",
              title: "Mathematics",
              description: "Algebra, Calculus, Statistics, Geometry and more",
              memberCount: 1250,
              questionCount: 435,
              tags: ["Algebra", "Calculus", "Statistics"],
              color: "#9b87f5",
            },
            {
              id: "physics",
              title: "Physics",
              description: "Classical Mechanics, Electromagnetism, Quantum Physics",
              memberCount: 875,
              questionCount: 312,
              tags: ["Mechanics", "Electricity", "Quantum"],
              color: "#1EAEDB",
            },
            {
              id: "programming",
              title: "Programming",
              description: "Learn coding with Python, Java, JavaScript, and more",
              memberCount: 2100,
              questionCount: 768,
              tags: ["Python", "Java", "JavaScript"],
              color: "#7E69AB",
            },
            {
              id: "chemistry",
              title: "Chemistry",
              description: "Organic, Inorganic, Physical and Analytical Chemistry",
              memberCount: 720,
              questionCount: 285,
              tags: ["Organic", "Inorganic", "Biochemistry"],
              color: "#FEC6A1",
            },
            {
              id: "biology",
              title: "Biology",
              description: "Cell Biology, Genetics, Ecology, Evolution and more",
              memberCount: 630,
              questionCount: 215,
              tags: ["Genetics", "Ecology", "Anatomy"],
              color: "#F2FCE2",
            },
            {
              id: "literature",
              title: "Literature",
              description: "Fiction, Poetry, Drama, Literary Analysis",
              memberCount: 450,
              questionCount: 180,
              tags: ["Fiction", "Poetry", "Analysis"],
              color: "#FFDEE2",
            },
            {
              id: "history",
              title: "History",
              description: "World History, Ancient Civilizations, Modern History",
              memberCount: 510,
              questionCount: 195,
              tags: ["World", "Ancient", "Modern"],
              color: "#FEF7CD",
            },
            {
              id: "economics",
              title: "Economics",
              description: "Microeconomics, Macroeconomics, Economic Theory",
              memberCount: 390,
              questionCount: 142,
              tags: ["Micro", "Macro", "Finance"],
              color: "#D3E4FD",
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching communities:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load communities"
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchCommunities();

    // Subscribe to realtime changes on the groups table
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'groups' },
        (payload) => {
          fetchCommunities(); // Refetch communities on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getRandomColor = () => {
    const colors = ["#9b87f5", "#1EAEDB", "#7E69AB", "#FEC6A1", "#F2FCE2", "#FFDEE2", "#FEF7CD", "#D3E4FD"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const filteredCommunities = communities.filter((community) =>
    community.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container py-10 px-4 md:px-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Communities</h1>
          {user && (
            <Link to="/communities/new">
              <Button className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                New Community
              </Button>
            </Link>
          )}
        </div>
        <p className="text-muted-foreground pb-4">
          Explore and join topic-specific communities where you can connect with peers and experts.
        </p>
        
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search communities..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <div className="flex justify-between mt-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCommunities.length > 0 ? (
              filteredCommunities.map((community) => (
                <TopicCard key={community.id} {...community} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <h3 className="text-xl font-medium mb-2">No communities found</h3>
                <p className="text-muted-foreground mb-4">Try a different search term</p>
                <Button onClick={() => setSearchTerm("")}>View All Communities</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
