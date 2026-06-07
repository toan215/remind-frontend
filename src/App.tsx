import { useState } from "react";
import Login from "./components/Login/Login";
import Home from "./components/Home/Home";
import AIChat from "./components/AIChat/AIChat";
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

  return (
    <Home onOpenAIChat={() => setCurrentScreen("aichat")} />
  );
}

export default App;
