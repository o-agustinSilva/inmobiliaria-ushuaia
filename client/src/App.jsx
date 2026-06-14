import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import PropertyDetails from './pages/PropertyDetails';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Nosotros from './pages/Nosotros';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Header />
          
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/property/:id" element={<PropertyDetails />} />
              <Route path="/nosotros" element={<Nosotros />} />
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin/dashboard" element={<Dashboard />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
