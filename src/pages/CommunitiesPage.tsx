
import { useState } from "react";
import { TopicCard } from "@/components/TopicCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function CommunitiesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const allCommunities = [
    {
      id: "math",
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
  ];

  const filteredCommunities = allCommunities.filter((community) =>
    community.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container py-10 px-4 md:px-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Communities</h1>
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
      </div>
    </div>
  );
}
