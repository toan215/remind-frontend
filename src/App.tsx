import { useState, useEffect, useRef, Suspense, lazy } from "react";
import { AdminRoute } from "./routes/adminRoutes";
import { AuthController, UserDto } from "./controllers/AuthController";
import "./App.css";
import "./components/Home/Home.css";
import "./components/Login/LoginPrompt.css";
import gsap from "gsap";
import { getUserSocket, disconnectUserSocket } from "./utils/userSocket";

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
const Profile = lazy(() => import("./components/Profile/Profile"));
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
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [openChatAppointmentId, setOpenChatAppointmentId] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<UserDto | null>(null);
  const [expertKey, setExpertKey] = useState(0);
  // ponytail: pending experts must finish onboarding before using expert features
  const [showOnboardingPrompt, setShowOnboardingPrompt] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const onboardingOverlayRef = useRef<HTMLDivElement>(null);
  const onboardingModalRef = useRef<HTMLDivElement>(null);

  // Sync currentScreen with URL hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, "");
      const validScreens = [
        "home",
        "expert",
        "forum",
        "aichat",
        "chat",
        "about",
        "calendar",
        "settings",
        "admin",
        "login",
        "register",
        "forgot-password",
        "payment",
      ];

      if (hash && validScreens.includes(hash)) {
        setCurrentScreen(hash);
      } else if (!hash) {
        setCurrentScreen("home");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // Handle initial URL hash on load

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  useEffect(() => {
    const currentHash = window.location.hash.replace(/^#\/?/, "");
    if (currentScreen === "home") {
      if (currentHash !== "" && currentHash !== "/") {
        window.location.hash = "#/";
      }
    } else {
      if (currentHash !== currentScreen) {
        window.location.hash = `#/${currentScreen}`;
      }
    }
  }, [currentScreen]);

  useEffect(() => {
    const user = AuthController.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setUserRole(user.role === "admin" ? "admin" : "user");
    }
  }, []);

  useEffect(() => {
    if (showLoginPrompt && overlayRef.current && modalRef.current) {
      gsap.set(overlayRef.current, { opacity: 0 });
      gsap.set(modalRef.current, { scale: 0.92, opacity: 0, y: 15 });

      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.35,
        ease: "power2.out",
      });
      gsap.to(modalRef.current, {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: "back.out(1.6)",
      });
    }
  }, [showLoginPrompt]);

  useEffect(() => {
    if (showOnboardingPrompt && onboardingOverlayRef.current && onboardingModalRef.current) {
      gsap.set(onboardingOverlayRef.current, { opacity: 0 });
      gsap.set(onboardingModalRef.current, { scale: 0.92, opacity: 0, y: 15 });
      gsap.to(onboardingOverlayRef.current, {
        opacity: 1,
        duration: 0.35,
        ease: "power2.out",
      });
      gsap.to(onboardingModalRef.current, {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: "back.out(1.6)",
      });
    }
  }, [showOnboardingPrompt]);

  // ponytail: show the completion popup when a pending expert hits a gated screen (side effect, not during render)
  useEffect(() => {
    if (
      isExpertPending() &&
      !showOnboardingPrompt &&
      ["aichat", "chat", "calendar"].includes(currentScreen)
    ) {
      setShowOnboardingPrompt(true);
    }
  }, [currentScreen, currentUser, showOnboardingPrompt]);

  // ponytail: realtime expert status updates from admin review (no reload needed)
  useEffect(() => {
    if (userRole === "guest") return;
    const token = localStorage.getItem("accessToken");
    if (!token || !currentUser) return;

    const socket = getUserSocket(token);
    const handleStatusUpdated = (data: { expertId: string; status: string }) => {
      if (data.expertId !== currentUser.id) return;
      const updated: UserDto = { ...currentUser, status: data.status as UserDto["status"] };
      localStorage.setItem("user", JSON.stringify(updated));
      setCurrentUser(updated);
      if (data.status !== "pending") setShowOnboardingPrompt(false);
    };

    socket.on("expert:status-updated", handleStatusUpdated);
    return () => {
      socket.off("expert:status-updated", handleStatusUpdated);
    };
  }, [userRole, currentUser]);

  const closeLoginPrompt = (callback?: () => void) => {
    if (overlayRef.current && modalRef.current) {
      gsap.to(modalRef.current, {
        scale: 0.92,
        opacity: 0,
        y: 15,
        duration: 0.25,
        ease: "power2.in",
      });
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          setShowLoginPrompt(false);
          if (callback) callback();
        },
      });
    } else {
      setShowLoginPrompt(false);
      if (callback) callback();
    }
  };

  const handleLoginRequired = () => {
    setShowLoginPrompt(true);
  };

  const handleLogout = async () => {
    try {
      await AuthController.logout();
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
    setUserRole("guest");
    setCurrentUser(null);
    setCurrentScreen("home");
  };

  // Gate expert-only screens until the expert finishes onboarding (status pending)
  const isExpertPending = (): boolean =>
    currentUser?.role === "expert" && currentUser?.status === "pending";

  // ponytail: show the completion popup; navigation to settings happens on button click
  const requireExpertOnboarding = (): void => {
    setShowOnboardingPrompt(true);
  };

  const renderScreen = () => {
    if (currentScreen === "login" || currentScreen === "register") {
      return (
        <Login
          initialMode={currentScreen === "register" ? "register" : "login"}
          onLoginSuccess={(role) => {
            setUserRole(role);
            const user = AuthController.getCurrentUser();
            setCurrentUser(user);
            if (user?.role === "admin" || user?.role === "system_manager") {
              setAdminRoute("dashboard");
              setCurrentScreen("admin");
            } else if (user?.role === "expert" && user?.status === "pending") {
              setCurrentScreen("home");
              setShowOnboardingPrompt(true);
            } else {
              setCurrentScreen("home");
            }
          }}
          onBack={() => setCurrentScreen("home")}
          onForgotPassword={() => setCurrentScreen("forgot-password")}
        />
      );
    }

    if (currentScreen === "forgot-password") {
      return <ForgetPassword onBack={() => setCurrentScreen("login")} />;
    }

    // ponytail: block expert-only actions until onboarding complete; settings is the completion screen so it stays allowed
    if (isExpertPending() && ["aichat", "chat", "calendar"].includes(currentScreen)) {
      return <LoadingFallback />;
    }

    if (currentScreen === "aichat") {
      if (userRole === "guest") {
        setTimeout(() => {
          setCurrentScreen("home");
          handleLoginRequired();
        }, 0);
        return <LoadingFallback />;
      }
      return <AIChat onBack={() => setCurrentScreen("home")} />;
    }

    if (currentScreen === "chat") {
      if (userRole === "guest") {
        setTimeout(() => {
          setCurrentScreen("home");
          handleLoginRequired();
        }, 0);
        return <LoadingFallback />;
      }
      return (
        <Chat
          onBack={() => {
            setOpenChatAppointmentId(null);
            setCurrentScreen("home");
          }}
          initialAppointmentId={openChatAppointmentId}
        />
      );
    }

    if (currentScreen === "expert") {
      return (
        <ExpertDirectory
          key={expertKey}
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
          onOpenChat={(appointmentId) => {
            setPendingBooking(null);
            setOpenChatAppointmentId(appointmentId);
            setCurrentScreen("chat");
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
      if (userRole === "guest") {
        setTimeout(() => {
          setCurrentScreen("home");
          handleLoginRequired();
        }, 0);
        return <LoadingFallback />;
      }
      return <ExpertCalendar onBack={() => setCurrentScreen("home")} />;
    }

    if (currentScreen === "settings") {
      if (userRole === "guest") {
        setTimeout(() => {
          setCurrentScreen("home");
          handleLoginRequired();
        }, 0);
        return <LoadingFallback />;
      }
      return (
        <Profile
          onBack={() => setCurrentScreen("home")}
          onLogout={handleLogout}
          onProfileUpdate={(updatedUser) => setCurrentUser(updatedUser)}
        />
      );
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
          else if (isExpertPending()) requireExpertOnboarding();
          else setCurrentScreen("aichat");
        }}
        onOpenChat={() => {
          if (userRole === "guest") handleLoginRequired();
          else if (isExpertPending()) requireExpertOnboarding();
          else {
            setOpenChatAppointmentId(null);
            setCurrentScreen("chat");
          }
        }}
        onOpenExpertDirectory={() => setCurrentScreen("expert")}
        onOpenCalendar={() => {
          if (userRole === "guest") handleLoginRequired();
          else if (isExpertPending()) requireExpertOnboarding();
          else setCurrentScreen("calendar");
        }}
        onOpenForum={() => setCurrentScreen("forum")}
        onOpenLogin={handleLoginRequired}
        onOpenRegister={() => setCurrentScreen("register")}
        onLogout={handleLogout}
        userRole={userRole}
        onOpenAdminPortal={() => {
          setAdminRoute("dashboard");
          setCurrentScreen("admin");
        }}
        onOpenAbout={() => setCurrentScreen("about")}
        onOpenSettings={() => {
          if (isExpertPending()) requireExpertOnboarding();
          else setCurrentScreen("settings");
        }}
      />
    );
  };

  return (
    <Suspense fallback={<LoadingFallback />}>
      {currentScreen !== "login" &&
        currentScreen !== "register" &&
        currentScreen !== "admin" && (
          <Header
            currentScreen={currentScreen}
            onNavigate={(screen) => {
              if (screen === "expert" && currentScreen === "expert") {
                setExpertKey((prev) => prev + 1);
              }
              setCurrentScreen(screen);
            }}
            userRole={userRole}
            onOpenLogin={handleLoginRequired}
            onOpenRegister={() => setCurrentScreen("register")}
            onLogout={handleLogout}
            onOpenAdminPortal={() => {
              setAdminRoute("dashboard");
              setCurrentScreen("admin");
            }}
            onOpenChat={() => {
              if (userRole === "guest") handleLoginRequired();
              else if (isExpertPending()) requireExpertOnboarding();
              else {
                setOpenChatAppointmentId(null);
                setCurrentScreen("chat");
              }
            }}
            currentUser={currentUser}
            onGoToLogin={() => setCurrentScreen("login")}
          />
        )}
      {renderScreen()}
      {showLoginPrompt && (
        <div
          className="login-prompt-overlay"
          ref={overlayRef}
          onClick={() => closeLoginPrompt()}
        >
          <div
            className="login-prompt-modal"
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="login-prompt-icon">
              <i className="bx bx-lock-alt"></i>
            </div>
            <h3 className="login-prompt-title">Yêu cầu đăng nhập</h3>
            <p className="login-prompt-message">
              Vui lòng đăng nhập để sử dụng tính năng này của ReMind.
            </p>
            <div className="login-prompt-buttons">
              <button
                type="button"
                className="login-prompt-btn login-prompt-btn-secondary"
                onClick={() => closeLoginPrompt()}
              >
                Để sau
              </button>
              <button
                type="button"
                className="login-prompt-btn login-prompt-btn-primary"
                onClick={() => {
                  closeLoginPrompt(() => setCurrentScreen("login"));
                }}
              >
                Đăng nhập ngay
              </button>
            </div>
          </div>
        </div>
      )}
      {showOnboardingPrompt && (
        <div
          className="login-prompt-overlay"
          ref={onboardingOverlayRef}
          onClick={() => setShowOnboardingPrompt(false)}
        >
          <div
            className="login-prompt-modal"
            ref={onboardingModalRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="login-prompt-icon">
              <i className="bx bx-id-card"></i>
            </div>
             <h3 className="login-prompt-title">Hoàn tất hồ sơ chuyên gia</h3>
             <p className="login-prompt-message">
               Bạn cần tải lên tài liệu và hoàn tất hồ sơ chuyên gia trong mục Cài đặt trước khi sử dụng các tính năng dành cho chuyên gia.
             </p>
             <div className="login-prompt-buttons">
               <button
                 type="button"
                 className="login-prompt-btn login-prompt-btn-primary"
                 onClick={() => {
                   setShowOnboardingPrompt(false);
                   setCurrentScreen("settings");
                 }}
               >
                 Đi tới Cài đặt
               </button>
             </div>
          </div>
        </div>
      )}
    </Suspense>
  );
}

export default App;
