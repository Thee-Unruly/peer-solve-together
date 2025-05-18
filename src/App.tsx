
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppLayout } from "@/components/AppLayout";

// Pages
import HomePage from "./pages/HomePage";
import CommunitiesPage from "./pages/CommunitiesPage";
import AskQuestionPage from "./pages/AskQuestionPage";
import MyQuestionsPage from "./pages/MyQuestionsPage";
import StudyPathsPage from "./pages/StudyPathsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="/communities" element={<CommunitiesPage />} />
              <Route path="/ask" element={<AskQuestionPage />} />
              <Route path="/my-questions" element={<MyQuestionsPage />} />
              <Route path="/study-paths" element={<StudyPathsPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
