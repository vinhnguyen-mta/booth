import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PaymentGuard } from './components/PaymentGuard';
import { Landing } from './pages/Landing';
import { ChooseFrame } from './pages/ChooseFrame';
import { ChooseQuantity } from './pages/ChooseQuantity';
import { Payment } from './pages/Payment';
import { Capture } from './pages/Capture';
import { Filters } from './pages/Filters';
import { Preview } from './pages/Preview';
import { Print } from './pages/Print';
import { Finish } from './pages/Finish';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/choose-frame" element={<ChooseFrame />} />
        <Route path="/choose-quantity" element={<ChooseQuantity />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/capture" element={<PaymentGuard><Capture /></PaymentGuard>} />
        <Route path="/filters" element={<Filters />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/finish" element={<Finish />} />
      </Routes>
    </Router>
  );
}

export default App;