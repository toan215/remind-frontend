import { useState } from "react";
import Login from "./components/Login/Login";
import Home from "./components/Home/Home";
import AIChat from "./components/AIChat/AIChat";
import ExpertDirectory from "./components/ExpertDirectory/ExpertDirectory";
import AdminGuard from "./middleware/adminGuard";
import AdminLayout from "./components/Admin/AdminLayout";
import { AdminRouteDispatcher, AdminRoute } from "./routes/adminRoutes";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<"user" | "admin">("user");
  const [currentScreen, setCurrentScreen] = useState("home");
  const [adminRoute, setAdminRoute] = useState<AdminRoute>("dashboard");

  if (!isLoggedIn) {
    return (
      <Login
        onLoginSuccess={(role) => {
          setIsLoggedIn(true);
          setUserRole(role);
        }}
      />
    );
  }

  if (currentScreen === "aichat") {
    return <AIChat onBack={() => setCurrentScreen("home")} />;
  }

  if (currentScreen === "expert") {
    return <ExpertDirectory onBack={() => setCurrentScreen("home")} />;
  }

  if (currentScreen === "admin") {
    return (
      <AdminGuard userRole={userRole} onBackToHome={() => setCurrentScreen("home")}>
        <AdminLayout
          currentRoute={adminRoute}
          onNavigate={(route) => setAdminRoute(route)}
          onBackToHome={() => setCurrentScreen("home")}
        >
          <AdminRouteDispatcher
            currentRoute={adminRoute}
            onNavigate={(route) => setAdminRoute(route)}
            onBackToHome={() => setCurrentScreen("home")}
          />
        </AdminLayout>
      </AdminGuard>
    );
  }

  return (
    <Home
      onOpenAIChat={() => setCurrentScreen("aichat")}
      onOpenExpertDirectory={() => setCurrentScreen("expert")}
      userRole={userRole}
      onOpenAdminPortal={() => {
        setAdminRoute("dashboard");
        setCurrentScreen("admin");
      }}
    />
  );
}

export default App;
