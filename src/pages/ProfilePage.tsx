
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-12 w-48 mb-6" />
        <div className="grid gap-6 md:grid-cols-[250px_1fr] lg:grid-cols-[300px_1fr]">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      <div className="grid gap-6 md:grid-cols-[250px_1fr] lg:grid-cols-[300px_1fr]">
        <Card>
          <CardHeader className="flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-2">
              <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ""} />
              <AvatarFallback className="text-lg">
                {user.email ? user.email.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-center">{user.email}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Member Since</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Badges</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Early Adopter</Badge>
                  <Badge variant="outline">Curious Mind</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="questions">My Questions</TabsTrigger>
                <TabsTrigger value="contributions">Contributions</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="overview" className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Activity Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border p-3">
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-sm text-muted-foreground">Questions Asked</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-sm text-muted-foreground">Answers Provided</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Learning Interests</h3>
                  <p className="text-sm text-muted-foreground">
                    No interests set yet. You can add your learning interests to find more relevant content.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="questions" className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You haven't asked any questions yet. When you do, they will appear here.
                </p>
              </TabsContent>
              
              <TabsContent value="contributions" className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You haven't made any contributions yet. Help other students by answering questions, and your contributions will show here.
                </p>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
