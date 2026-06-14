import { useState } from "react";
import Login from "./components/Login/Login";
import Home from "./components/Home/Home";
import AIChat from "./components/AIChat/AIChat";
import ExpertDirectory from "./components/ExpertDirectory/ExpertDirectory";
import AdminGuard from "./middleware/adminGuard";
import AdminLayout from "./components/Admin/AdminLayout";
import { AdminRouteDispatcher, AdminRoute } from "./routes/adminRoutes";
import Forum from "./components/Forum/Forum";
import "./App.css";

function App() {
  const [userRole, setUserRole] = useState<"guest" | "user" | "admin">("guest");
  const [currentScreen, setCurrentScreen] = useState("home");
  const [adminRoute, setAdminRoute] = useState<AdminRoute>("dashboard");

  const handleLoginRequired = () => {
    setCurrentScreen("login");
  };

  if (currentScreen === "login") {
    return (
      <Login
        onLoginSuccess={(role) => {
          setUserRole(role);
          setCurrentScreen("home");
        }}
        onBack={() => setCurrentScreen("home")}
      />
    );
  }

  if (currentScreen === "aichat") {
    return <AIChat onBack={() => setCurrentScreen("home")} />;
  }

  if (currentScreen === "expert") {
    return <ExpertDirectory onBack={() => setCurrentScreen("home")} userRole={userRole} onLoginRequired={handleLoginRequired} />;
  }

  if (currentScreen === "forum") {
    return <Forum onBack={() => setCurrentScreen("home")} userRole={userRole} onLoginRequired={handleLoginRequired} />;
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
      onOpenAIChat={() => {
        if (userRole === "guest") handleLoginRequired();
        else setCurrentScreen("aichat");
      }}
      onOpenExpertDirectory={() => setCurrentScreen("expert")}
      onOpenForum={() => setCurrentScreen("forum")}
      onOpenLogin={handleLoginRequired}
      onLogout={() => setUserRole("guest")}
      userRole={userRole}
      onOpenAdminPortal={() => {
        setAdminRoute("dashboard");
        setCurrentScreen("admin");
      }}
    />
  );
}

export default App;
