import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { PaymentGuard } from "./components/PaymentGuard";
import { Landing } from "./pages/Landing";
import { ChooseFrame } from "./pages/ChooseFrame";
import { ChooseQuantity } from "./pages/ChooseQuantity";
import { Payment } from "./pages/Payment";
import { CaptureV2 } from "./pages/CaptureV2";
import { Filters } from "./pages/Filters";
import { Preview } from "./pages/Preview";
import { Password } from "./pages/Password";
import { QRDownload } from "./pages/QRDownload";
import { ExportImage } from "./pages/ExportImage";
import { FilterImage } from "./pages/FilterImage";
import { ListImage } from "./pages/ListImage";
import { WaitCapture } from "./pages/WaitCapture";
import { End } from "./pages/End";
import { Finish } from "./pages/Finish";
import TotalPayment from "./pages/TotalPayment";
import LoadingScreen from "./pages/LoadingScreen";
import { Startup } from "./pages/Startup";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Startup />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/choose-frame" element={<ChooseFrame />} />
        <Route path="/choose-quantity" element={<ChooseQuantity />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/total-payment" element={<TotalPayment />} />
        <Route path="/loading" element={<LoadingScreen />} />
        <Route
          path="/capture"
          element={
            <PaymentGuard>
              <CaptureV2 />
            </PaymentGuard>
          }
        />
        <Route path="/filters" element={<Filters />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/finish" element={<Finish />} />
        <Route path="/password" element={<Password />} />
        <Route path="/wait-capture" element={<WaitCapture />} />
        <Route path="/list-image" element={<ListImage />} />
        <Route path="/qr-download" element={<QRDownload />} />
        <Route path="/export-image" element={<ExportImage />} />
        <Route path="/filter-image" element={<FilterImage />} />
        <Route path="/end" element={<End />} />
      </Routes>
    </Router>
  );
}

export default App;
