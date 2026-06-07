import { useState } from "react";
import Login from "./components/Login/Login";
import Home from "./components/Home/Home";
import AIChat from "./components/AIChat/AIChat";
import ExpertDirectory from "./components/ExpertDirectory/ExpertDirectory";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentScreen, setCurrentScreen] = useState("home");

  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  if (currentScreen === "aichat") {
    return <AIChat onBack={() => setCurrentScreen("home")} />;
  }

  if (currentScreen === "expert") {
    return <ExpertDirectory onBack={() => setCurrentScreen("home")} />;
  }

  return (
    <Home
      onOpenAIChat={() => setCurrentScreen("aichat")}
      onOpenExpertDirectory={() => setCurrentScreen("expert")}
    />
  );
}

export default App;
