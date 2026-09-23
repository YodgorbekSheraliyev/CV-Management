import { Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import RequireAuth from "./components/auth/RequireAuth";
import PositionsPage from "./pages/PositionsPage";
import PositionPage from "./pages/PositionPage";
import MainPage from "./pages/MainPage";
import CreatePositionPage from "./pages/CreatePositionPage";
import EditPositionPage from "./pages/EditPositionPage";
import AttributeManagement from "./pages/AttributeManagement";
import PositionCvsPage from "./pages/PositionCvsPage";
import CvPage from "./pages/CvPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import AdminUsersPage from "./pages/AdminUsersPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/positions" element={<PositionsPage />} />
      <Route path="/positions/:id" element={<PositionPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/users/:id" element={<ProfilePage />} />
        <Route path="/positions/new" element={<CreatePositionPage />} />
        <Route path="/positions/:id/edit" element={<EditPositionPage />} />
        <Route path="/positions/:id/cvs" element={<PositionCvsPage />} />
        <Route path="/attribute" element={<AttributeManagement />} />
        <Route path="/cvs/:id" element={<CvPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
      </Route>
    </Routes>
  );
}

export default App;
