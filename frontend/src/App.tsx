import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Authentication/Login";
import Register from "./pages/Authentication/Register";
import AcceptInvite from "./pages/Authentication/AcceptInvite";
import ForgotPassword from "./pages/Authentication/ForgotPassword";
import ResetPassword from "./pages/Authentication/ResetPassword";
import Dashboard from "./pages/Dashboard";
import GroupDetail from "./pages/Dashboard/GroupDetail";
import Profile from "./pages/Dashboard/Profile";
import Layout from "./Layout";
import { useSelector } from "react-redux";
import { RootState } from "./slices";

function App() {
  const { user } = useSelector((state: RootState) => state.Login);
  const isAuthenticated = !!localStorage.getItem("token") || !!user.id;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Devise default email link path */}
        <Route path="/users/password/edit" element={<ResetPassword />} />
        
        <Route 
          path="/" 
          element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="groups/:id" element={<GroupDetail />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
