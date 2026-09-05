import { Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import RequireAuth from "./components/RequireAuth";
import PositionsPage from "./pages/PositionsPage";
import PositionPage from "./pages/PositionPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<RequireAuth/>}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/positions/:id" element={<PositionPage />} />
        <Route path="/positions" element={<PositionsPage />} />
        <Route path="/" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}

export default App;
