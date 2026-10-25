import { Route, Routes } from "react-router-dom";
import { AppFooter } from "./components/AppFooter";
import { AppHeader } from "./components/AppHeader";
import { ComparePage } from "./pages/ComparePage";
import { ModelDetailPage } from "./pages/ModelDetailPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ResultsPage } from "./pages/ResultsPage";

export function App() {
  return (
    <>
      <AppHeader />
      <main>
        <Routes>
          <Route path="/" element={<ResultsPage />} />
          <Route path="/cars/:modelId" element={<ModelDetailPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <AppFooter />
    </>
  );
}
