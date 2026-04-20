import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import Button from './components/Button';
import { QUESTIONS } from './data/questions';
import { USERS } from './data/users';
import Admin from './pages/Admin';
import Form from './pages/Form';
import ModeSelect from './pages/ModeSelect';
import PinAccess from './pages/PinAccess';
import QuestionsList from './pages/QuestionsList';
import SelectPartner from './pages/SelectPartner';
import SelectUser from './pages/SelectUser';
import Testimony from './pages/Testimony';

const SELECTED_USER_KEY = 'selectedUser';
const PIN_VERIFIED_KEY = 'pinVerified';

function Topbar({ selectedUser, onChangeUser }) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="logo-mark" aria-hidden="true">
          🔥
        </div>
        <h1 className="brand-title">Miesięczny Dziennik Relacji</h1>
        <p className="brand-subtitle">spokojny szkic rozmów i odkryć</p>
      </div>

      <div className="topbar-meta">
        {selectedUser ? (
          <span className="badge">Jesteś zalogowany jako: {selectedUser}</span>
        ) : (
          <span className="badge">Wybierz użytkownika</span>
        )}
        <div className="topbar-actions">
          <Link to="/admin">
            <Button variant="ghost">Admin</Button>
          </Link>
          {selectedUser ? <Button onClick={onChangeUser}>Zmień użytkownika</Button> : null}
        </div>
      </div>
    </header>
  );
}

function AppContent() {
  const [selectedUser, setSelectedUser] = useState(
    () => localStorage.getItem(SELECTED_USER_KEY) || ''
  );

  const [pinVerified, setPinVerified] = useState(
    () => localStorage.getItem(PIN_VERIFIED_KEY) === 'true'
  );

  useEffect(() => {
    if (selectedUser) {
      localStorage.setItem(SELECTED_USER_KEY, selectedUser);
    } else {
      localStorage.removeItem(SELECTED_USER_KEY);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (pinVerified) {
      localStorage.setItem(PIN_VERIFIED_KEY, 'true');
    } else {
      localStorage.removeItem(PIN_VERIFIED_KEY);
    }
  }, [pinVerified]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setPinVerified(false);
    localStorage.setItem(SELECTED_USER_KEY, user);
    localStorage.removeItem(PIN_VERIFIED_KEY);
  };

  const handlePinVerified = () => {
    setPinVerified(true);
    localStorage.setItem(PIN_VERIFIED_KEY, 'true');
  };

  const handleChangeUser = () => {
    setSelectedUser('');
    setPinVerified(false);
    localStorage.removeItem(SELECTED_USER_KEY);
    localStorage.removeItem(PIN_VERIFIED_KEY);
  };

  const guardedRoute = (element) => {
    if (!selectedUser) {
      return <Navigate to="/" replace />;
    }

    if (!pinVerified) {
      return <Navigate to="/pin" replace />;
    }

    return element;
  };

  return (
    <div className="app">
      <div className="container">
        <Topbar selectedUser={selectedUser} onChangeUser={handleChangeUser} />

        <Routes>
          <Route
            path="/"
            element={<SelectUser users={USERS} onSelectUser={handleSelectUser} />}
          />

          <Route
            path="/pin"
            element={
              <PinAccess
                selectedUser={selectedUser}
                onPinVerified={handlePinVerified}
                onChangeUser={handleChangeUser}
              />
            }
          />

          <Route
            path="/mode"
            element={guardedRoute(<ModeSelect selectedUser={selectedUser} />)}
          />

          <Route
            path="/testimony"
            element={guardedRoute(<Testimony selectedUser={selectedUser} />)}
          />

          <Route
            path="/partner"
            element={guardedRoute(<SelectPartner users={USERS} selectedUser={selectedUser} />)}
          />

          <Route
            path="/questions"
            element={guardedRoute(<QuestionsList selectedUser={selectedUser} questions={QUESTIONS} />)}
          />

          <Route
            path="/form"
            element={guardedRoute(<Form selectedUser={selectedUser} />)}
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