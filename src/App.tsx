import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import GraphPage from './pages/GraphPage';
import ChatToggle from './components/ChatToggle';

function App() {
  const location = useLocation();
  
  const isChatPage = location.pathname === '/chat';
  const isGraphPage = location.pathname === '/graph';
  
  const hideLayout = isChatPage || isGraphPage;

  return (
      <div className="flex flex-col min-h-screen font-sans">
        {!isGraphPage && <Header />}

        <main className="flex flex-col grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/graph" element={<GraphPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>

        {!hideLayout && <ChatToggle />}
        {!hideLayout && <Footer />}
      </div>
  );
}

export default App;