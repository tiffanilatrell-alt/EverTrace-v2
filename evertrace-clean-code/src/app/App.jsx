import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import About from "../pages/About";
import ExampleTribute from "../pages/ExampleTribute";
import FAQ from "../pages/FAQ";
import Home from "../pages/Home";
import ManageTribute from "../pages/ManageTribute";
import PlaqueInfo from "../pages/PlaqueInfo";
import PublishSuccess from "../pages/PublishSuccess";
import Resources from "../pages/Resources";
import StartTribute from "../pages/StartTribute";
import TributePage from "../pages/TributePage";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="faqs" element={<Navigate to="/faq" replace />} />
          <Route path="resources" element={<Resources />} />
          <Route path="start" element={<StartTribute />} />
          <Route path="published/:tributeId" element={<PublishSuccess />} />
          <Route path="manage/:tributeId" element={<ManageTribute />} />
          <Route path="tribute/:tributeId" element={<TributePage />} />
          <Route path="plaques/:tributeId" element={<PlaqueInfo />} />
          <Route path="example" element={<ExampleTribute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}