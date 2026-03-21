import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import ChatToggle from './components/ChatToggle';

function App() {
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';

  return (
      <div className="flex flex-col min-h-screen font-sans">
        <Header />

        <main className="grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>

        {!isChatPage && <ChatToggle />}
        {!isChatPage && <Footer />}
      </div>
  );
}

export default App;