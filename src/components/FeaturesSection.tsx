
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Users, MessageSquare, Star } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: <Users className="h-10 w-10 text-peersolve-purple" />,
      title: "Topic Communities",
      description:
        "Join subject-specific communities to collaborate with peers who share your academic interests.",
    },
    {
      icon: <MessageSquare className="h-10 w-10 text-peersolve-blue-DEFAULT" />,
      title: "Ask & Answer",
      description:
        "Post your questions and help others with step-by-step explanations, not just final answers.",
    },
    {
      icon: <Book className="h-10 w-10 text-peersolve-purple-dark" />,
      title: "Study Paths",
      description:
        "Create and follow curated learning paths with the best questions and resources on any topic.",
    },
    {
      icon: <Star className="h-10 w-10 text-peersolve-blue-DEFAULT" />,
      title: "Build Profile",
      description:
        "Earn recognition with badges and track your learning journey as you help others.",
    },
  ];

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              How PeerSolve Works
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Our platform is designed to foster collaborative learning through these key features.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {features.map((feature, index) => (
            <Card key={index} className="border-none shadow-md">
              <CardHeader>
                <div className="flex items-center justify-center">{feature.icon}</div>
                <CardTitle className="text-center">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
