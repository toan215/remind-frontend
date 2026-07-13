import { useState, useEffect, Suspense, lazy } from "react";
import { AdminRoute } from "./routes/adminRoutes";
import { AuthController } from "./controllers/AuthController";
import "./App.css";

const Login = lazy(() => import("./components/Login/Login"));
const Home = lazy(() => import("./components/Home/Home"));
const AIChat = lazy(() => import("./components/AIChat/AIChat"));
const Chat = lazy(() => import("./components/Chat/Chat"));
const ExpertDirectory = lazy(
  () => import("./components/ExpertDirectory/ExpertDirectory"),
);
const ExpertCalendar = lazy(
  () => import("./components/ExpertCalendar/ExpertCalendar"),
);
const AdminGuard = lazy(() => import("./middleware/AdminAuthGuard"));
const AdminLayout = lazy(() => import("./components/Admin/AdminLayout"));
const AdminRouteDispatcher = lazy(() =>
  import("./routes/adminRoutes").then((module) => ({
    default: module.AdminRouteDispatcher,
  })),
);
const Forum = lazy(() => import("./components/Forum/Forum"));
const AboutUs = lazy(() => import("./components/AboutUs/AboutUs"));
const Header = lazy(() => import("./components/Header/Header"));
const ForgetPassword = lazy(
  () => import("./components/ForgetPassword/ForgetPassword"),
);
const Payment = lazy(() => import("./components/Payment/Payment"));

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

function App() {
  const [userRole, setUserRole] = useState<"guest" | "user" | "admin">("guest");
  const [currentScreen, setCurrentScreen] = useState("home");
  const [adminRoute, setAdminRoute] = useState<AdminRoute>("dashboard");
  const [pendingBooking, setPendingBooking] = useState<any>(null);

  useEffect(() => {
    const user = AuthController.getCurrentUser();
    if (user) {
      setUserRole(user.role === 'admin' ? 'admin' : 'user');
    }
  }, []);

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
          onForgotPassword={() => setCurrentScreen("forgot-password")}
        />
      );
    }

    if (currentScreen === "forgot-password") {
      return <ForgetPassword onBack={() => setCurrentScreen("login")} />;
    }

    if (currentScreen === "aichat") {
      return <AIChat onBack={() => setCurrentScreen("home")} />;
    }

    if (currentScreen === "chat") {
      return <Chat onBack={() => setCurrentScreen("home")} />;
    }

    if (currentScreen === "expert") {
      return (
        <ExpertDirectory
          onBack={() => setCurrentScreen("home")}
          userRole={userRole}
          onLoginRequired={handleLoginRequired}
          onProceedToPayment={(details) => {
            setPendingBooking(details);
            setCurrentScreen("payment");
          }}
        />
      );
    }

    if (currentScreen === "payment" && pendingBooking) {
      return (
        <Payment
          onBack={() => setCurrentScreen("expert")}
          onPaymentComplete={() => {
            setPendingBooking(null);
            setCurrentScreen("home");
          }}
          bookingDetails={pendingBooking}
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

    if (currentScreen === "about") {
      return <AboutUs onBack={() => setCurrentScreen("home")} />;
    }

    if (currentScreen === "calendar") {
      return <ExpertCalendar onBack={() => setCurrentScreen("home")} />;
    }

    if (currentScreen === "admin") {
      return (
        <AdminGuard
          userRole={userRole}
          onBackToHome={() => setCurrentScreen("home")}
        >
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
        onOpenChat={() => {
          if (userRole === "guest") handleLoginRequired();
          else setCurrentScreen("chat");
        }}
        onOpenExpertDirectory={() => setCurrentScreen("expert")}
        onOpenCalendar={() => {
          if (userRole === "guest") handleLoginRequired();
          else setCurrentScreen("calendar");
        }}
        onOpenForum={() => setCurrentScreen("forum")}
        onOpenLogin={handleLoginRequired}
        onOpenRegister={() => setCurrentScreen("register")}
        onLogout={() => setUserRole("guest")}
        userRole={userRole}
        onOpenAdminPortal={() => {
          setAdminRoute("dashboard");
          setCurrentScreen("admin");
        }}
        onOpenAbout={() => setCurrentScreen("about")}
        onOpenSettings={() => {}}
      />
    );
  };

  return (
    <Suspense fallback={<LoadingFallback />}>
      {currentScreen !== "login" &&
        currentScreen !== "register" &&
        currentScreen !== "admin" &&
        currentScreen !== "home" && (
          <Header
            currentScreen={currentScreen}
            onNavigate={(screen) => setCurrentScreen(screen)}
            userRole={userRole}
            onOpenLogin={handleLoginRequired}
            onOpenRegister={() => setCurrentScreen("register")}
            onLogout={() => setUserRole("guest")}
            onOpenAdminPortal={() => {
              setAdminRoute("dashboard");
              setCurrentScreen("admin");
            }}
            onOpenChat={() => {
              if (userRole === "guest") handleLoginRequired();
              else setCurrentScreen("chat");
            }}
          />
        )}
      {renderScreen()}
    </Suspense>
  );
}

export default App;
