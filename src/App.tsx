import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import GraphPage from './pages/GraphPage'; // Импортируем новую страницу
import ChatToggle from './components/ChatToggle';

function App() {
  const location = useLocation();
  
  const isChatPage = location.pathname === '/chat';
  const isGraphPage = location.pathname === '/graph';
  
  // Флаг для скрытия общих элементов (Header, Footer, Кнопка чата)
  const hideLayout = isChatPage || isGraphPage;

  return (
      <div className="flex flex-col min-h-screen font-sans">
        {/* Скрываем Header на графе, чтобы освободить весь экран */}
        {!isGraphPage && <Header />}

        <main className="grow flex flex-col">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/graph" element={<GraphPage />} />
            {/* Редирект для всех неопознанных путей на главную */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>

        {!hideLayout && <ChatToggle />}
        {!hideLayout && <Footer />}
      </div>
  );
}

export default App;