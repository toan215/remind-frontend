import { useState } from 'react'
import Login from './components/Login/Login'
import Home from './components/Home/Home'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />
  }

  return <Home />
}

export default App
