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

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/positions" element={<PositionsPage />} />
        <Route path="/positions/new" element={<CreatePositionPage />} />
        <Route path="/positions/:id" element={<PositionPage />} />
        <Route path="/positions/:id/edit" element={<EditPositionPage />} />
        <Route path="/positions/:id/cvs" element={<div>123</div>} />
        <Route path="/attribute" element={<AttributeManagement />} />
        <Route path="/" element={<MainPage />} />
      </Route>
    </Routes>
  );
}

export default App;
