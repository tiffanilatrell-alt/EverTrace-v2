import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import ExampleTribute from "../pages/ExampleTribute";
import Home from "../pages/Home";
import ManageTribute from "../pages/ManageTribute";
import PlaqueInfo from "../pages/PlaqueInfo";
import PlaqueOrder from "../pages/PlaqueOrder";
import PlaqueRedirect from "../pages/PlaqueRedirect";
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
          <Route path="manage/:tributeId" element={<ManageTribute />} />
          <Route path="tribute/:tributeId" element={<TributePage />} />
          <Route path="plaques/:tributeId/order" element={<PlaqueOrder />} />
          <Route path="plaques/:tributeId" element={<PlaqueInfo />} />
          <Route path="example" element={<ExampleTribute />} />
          <Route path=":plaqueCode" element={<PlaqueRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
