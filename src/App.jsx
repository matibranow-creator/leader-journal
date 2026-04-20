import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Button from './components/Button';
import { QUESTIONS } from './data/questions';
import { USERS } from './data/users';
import Admin from './pages/Admin';
import Form from './pages/Form';
import SelectPartner from './pages/SelectPartner';
import SelectUser from './pages/SelectUser';

const STORAGE_KEY = 'selectedUser';

function Topbar({ selectedUser, onChangeUser }) {
  return (
    <header className="topbar">
      <div>
        {selectedUser ? (
          <span className="badge">Jesteś zalogowany jako: {selectedUser}</span>
        ) : (
          <span className="badge">Wybierz użytkownika</span>
        )}
      </div>
      <div className="topbar-actions">
        <Link to="/admin">
          <Button variant="ghost">Admin</Button>
        </Link>
        {selectedUser && <Button onClick={onChangeUser}>Zmień użytkownika</Button>}
      </div>
    </header>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(() => localStorage.getItem(STORAGE_KEY) || '');

  useEffect(() => {
    if (selectedUser) {
      localStorage.setItem(STORAGE_KEY, selectedUser);
      return;
    }
    localStorage.removeItem(STORAGE_KEY);
  }, [selectedUser]);

  const handleChangeUser = () => {
    setSelectedUser('');
    navigate('/');
  };

  return (
    <div className="app">
      <div className="container">
        <Topbar selectedUser={selectedUser} onChangeUser={handleChangeUser} />
        <Routes>
          <Route path="/" element={<SelectUser users={USERS} onSelectUser={setSelectedUser} />} />
          <Route path="/partner" element={<SelectPartner users={USERS} selectedUser={selectedUser} />} />
          <Route
            path="/form"
            element={<Form selectedUser={selectedUser} questions={QUESTIONS} />}
          />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
