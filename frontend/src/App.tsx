import { Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import RequireAuth from "./components/RequireAuth";
import PositionsPage from "./pages/PositionsPage";
import PositionPage from "./pages/PositionPage";
import MainPage from "./pages/MainPage";
import NewPositionPage from "./pages/NewPositionPage";
import PositionEditPage from "./pages/PositionEditPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<RequireAuth/>}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/positions" element={<PositionsPage />} />
        <Route path="/positions/new" element={<NewPositionPage />} />
        <Route path="/positions/:id" element={<PositionPage />} />
        <Route path="/positions/:id/edit" element={<PositionEditPage />} />
        <Route path="/" element={<MainPage />} />
      </Route>
    </Routes>
  );
}

export default App;
