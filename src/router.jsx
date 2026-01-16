import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard, FinancialInsti, HealthInsti, Home, Medicalspecialist, SMSManager, Supportgroups, Utils, Feed } from './Components/indexScreens';
export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />}>
          <Route index element={<Dashboard />} />
          <Route path="health" element={<HealthInsti />} />
          <Route path="financial" element={<FinancialInsti />} />
          <Route path="medspecialist" element={<Medicalspecialist />} />
          <Route path="supportgroups" element={<Supportgroups />} />
          <Route path="feed" element={<Feed />} />
          <Route path="utils" element={<Utils />} />
          <Route path="sms" element={<SMSManager />} />
        </Route>
      </Routes>
    </Router>
  );
}
