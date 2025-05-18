
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppLayout } from "@/components/AppLayout";
import { AuthProvider } from "@/hooks/useAuth";

// Pages
import HomePage from "./pages/HomePage";
import CommunitiesPage from "./pages/CommunitiesPage";
import AskQuestionPage from "./pages/AskQuestionPage";
import MyQuestionsPage from "./pages/MyQuestionsPage";
import StudyPathsPage from "./pages/StudyPathsPage";
import StudyPathDetailPage from "./pages/StudyPathDetailPage";
import QuestionDetailPage from "./pages/QuestionDetailPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<HomePage />} />
                <Route path="/communities" element={<CommunitiesPage />} />
                <Route path="/questions/:id" element={<QuestionDetailPage />} />
                <Route path="/ask" element={<AskQuestionPage />} />
                <Route path="/my-questions" element={<MyQuestionsPage />} />
                <Route path="/study-paths" element={<StudyPathsPage />} />
                <Route path="/study-paths/:id" element={<StudyPathDetailPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
