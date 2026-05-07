import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import ExampleTribute from "../pages/ExampleTribute";
import Home from "../pages/Home";
import PlaqueInfo from "../pages/PlaqueInfo";
import PublishSuccess from "../pages/PublishSuccess";
import StartTribute from "../pages/StartTribute";
import TributePage from "../pages/TributePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="start" element={<StartTribute />} />
          <Route path="published/:tributeId" element={<PublishSuccess />} />
          <Route path="tribute/:tributeId" element={<TributePage />} />
          <Route path="plaques/:tributeId" element={<PlaqueInfo />} />
          <Route path="example" element={<ExampleTribute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
