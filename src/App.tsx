import { useState, Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

const Login = lazy(() => import("./components/Login/Login"));
const Home = lazy(() => import("./components/Home/Home"));
const AIChat = lazy(() => import("./components/AIChat/AIChat"));
const ExpertDirectory = lazy(
  () => import("./components/ExpertDirectory/ExpertDirectory"),
);
const Forum = lazy(() => import("./components/Forum/Forum"));

// Admin route components (URL-based)
const AdminLogin = lazy(() => import("./components/Admin/AdminLogin"));
const AdminAuthGuard = lazy(() => import("./middleware/AdminAuthGuard"));
const AdminDashboardLayout = lazy(
  () => import("./components/Admin/AdminDashboardLayout"),
);
const AdminDashboardPage = lazy(
  () => import("./components/Admin/AdminDashboardPage"),
);
const AdminPlaceholderPage = lazy(
  () => import("./components/Admin/AdminPlaceholderPage"),
);

const LoadingFallback = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      background: "var(--canvas)",
    }}
  >
    <div
      className="login-spinner"
      style={{
        borderColor: "var(--brand-300)",
        borderTopColor: "var(--brand-700)",
        width: "40px",
        height: "40px",
        borderWidth: "4px",
      }}
    ></div>
  </div>
);

/**
 * Main app screen (state-driven navigation for the user-facing app)
 */
function MainApp() {
  const [userRole, setUserRole] = useState<"guest" | "user" | "admin">("guest");
  const [currentScreen, setCurrentScreen] = useState("home");

  const handleLoginRequired = () => {
    setCurrentScreen("login");
  };

  const renderScreen = () => {
    if (currentScreen === "login" || currentScreen === "register") {
      return (
        <Login
          initialMode={currentScreen === "register" ? "register" : "login"}
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
      return (
        <ExpertDirectory
          onBack={() => setCurrentScreen("home")}
          userRole={userRole}
          onLoginRequired={handleLoginRequired}
        />
      );
    }

    if (currentScreen === "forum") {
      return (
        <Forum
          onBack={() => setCurrentScreen("home")}
          userRole={userRole}
          onLoginRequired={handleLoginRequired}
        />
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
        onOpenRegister={() => setCurrentScreen("register")}
        onLogout={() => setUserRole("guest")}
        userRole={userRole}
      />
    );
  };

  return <>{renderScreen()}</>;
}

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* ===== Admin Routes (URL-based) ===== */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route element={<AdminAuthGuard />}>
          <Route element={<AdminDashboardLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route
              path="/admin/users"
              element={
                <AdminPlaceholderPage
                  title="Users"
                  description="Manage platform users, roles, and permissions. View user activity and account details."
                  icon="👥"
                />
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminPlaceholderPage
                  title="Orders"
                  description="Track and manage all orders. Process refunds, view payment details, and handle disputes."
                  icon="📦"
                />
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminPlaceholderPage
                  title="Products"
                  description="Manage your product catalog. Add, edit, or remove products and manage inventory."
                  icon="🏷️"
                />
              }
            />
            <Route
              path="/admin/reports"
              element={
                <AdminPlaceholderPage
                  title="Reports"
                  description="View analytics dashboards, generate custom reports, and export data."
                  icon="📊"
                />
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AdminPlaceholderPage
                  title="Settings"
                  description="Configure platform settings, integrations, API keys, and system preferences."
                  icon="⚙️"
                />
              }
            />
          </Route>
        </Route>

        {/* ===== Main App (state-based, existing behavior) ===== */}
        <Route path="/*" element={<MainApp />} />
      </Routes>
    </Suspense>
  );
}

export default App;
