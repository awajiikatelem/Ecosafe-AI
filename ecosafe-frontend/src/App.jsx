import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./Pages/Signup";
import Login from "./Pages/Login";
import LandingPage from "./Pages/LandingPage";
import Dashboard from "./Pages/Dashboard";
import ProtectedRoute from "./Pages/ProtectedRoute";
import ReportPage from "./Pages/ReportPage";
import FireOutbreak from "./Pages/FireOutbreak"
import Maps from "./Pages/Maps";
import MyReport from "./Pages/MyReport";
import Map from "./Pages/Map";
import Alert from "./Pages/Alert";
import Awareness from "./Pages/Awareness";
import AdminLogin from "./Pages/AdminLogin";
import AdminDashboard from "./Pages/AdminDashboard";
import Users from "./Pages/users";
import UserAlerts from "./Pages/UserAlerts";
import IncidentReports from "./Pages/IncidentReports";
import AgencyUsers from "./Pages/AgencyUsers";
import Setting from "./Pages/setting"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/Login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
         <Route path="/" element={<LandingPage />} />
         <Route path="/Dashboard" element={<Dashboard />} />
         <Route path="/Dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
         <Route path="/ReportPage" element={<ReportPage />} />
         <Route path="/FireOutbreak" element={<FireOutbreak />} />
         <Route path="/MyReport" element={<MyReport />} />
          <Route path="/Map" element={<Map />} />
          <Route path="/Alert" element={<Alert />} />
          <Route path="/Awareness" element={<Awareness />} />
          <Route path="/AdminLogin" element={<AdminLogin />} />
          <Route path="/AdminDashboard" element={<AdminDashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/UserAlerts" element={<UserAlerts />} />
          <Route path="/IncidentReports" element={<IncidentReports />} />
          <Route path="/Maps" element={<Maps />} />
          <Route path="/AgencyUsers" element={<AgencyUsers />} />     
          <Route path="/setting" element={<Setting />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;