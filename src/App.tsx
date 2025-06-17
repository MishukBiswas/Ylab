import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ToastProvider } from './contexts/ToastContext';
import AdminDashboard from './pages/AdminDashboard';
import Home from './pages/Home';
import About from './pages/About';
import Team from './pages/Team';
import Research from './pages/Research';
import Publications from './pages/Publications';
import Resources from './pages/Resources';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Header from './components/Header';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <HelmetProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ToastProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/*" element={
                <>
                  <Header />
                  <main className="pt-16 -mt-0.09">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/team" element={<Team />} />
                      <Route path="/research" element={<Research />} />
                      <Route path="/publications" element={<Publications />} />
                      <Route path="/resources" element={<Resources />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/login" element={<Login />} />
                    </Routes>
                  </main>
                  <Footer />
                </>
              } />
            </Routes>
          </div>
        </ToastProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;