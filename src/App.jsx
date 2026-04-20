import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Button from './components/Button';
import Card from './components/Card';
import { QUESTIONS } from './data/questions';
import { USERS } from './data/users';
import { isSupabaseConfigured, supabase } from './lib/supabaseClient';
import Admin from './pages/Admin';
import Form from './pages/Form';
import Login from './pages/Login';
import ModeSelect from './pages/ModeSelect';
import ProfileSetup from './pages/ProfileSetup';
import QuestionsList from './pages/QuestionsList';
import SelectPartner from './pages/SelectPartner';
import Testimony from './pages/Testimony';

function Topbar({ displayName, onSignOut, showAdmin }) {
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
        <span className="badge">Jesteś zalogowany jako: {displayName}</span>
        <div className="topbar-actions">
          {showAdmin ? (
            <Link to="/admin">
              <Button variant="ghost">Admin</Button>
            </Link>
          ) : null}
          <Button onClick={onSignOut}>Wyloguj</Button>
        </div>
      </div>
    </header>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authHashError, setAuthHashError] = useState(false);

  const [profile, setProfile] = useState(null);
  const [profileReady, setProfileReady] = useState(false);

  useEffect(() => {
    const hash = window.location.hash || '';
    if (!hash) {
      return;
    }

    const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
    const hasAuthError =
      Boolean(params.get('error')) ||
      Boolean(params.get('error_code')) ||
      Boolean(params.get('error_description'));

    if (hasAuthError) {
      setAuthHashError(true);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthReady(true);
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return;
      }
      setSession(data.session || null);
      setAuthReady(true);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession || null);
      setAuthReady(true);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user?.id || !supabase) {
      setProfile(null);
      setProfileReady(true);
      return;
    }

    let ignore = false;
    setProfileReady(false);

    const loadProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, display_name')
        .eq('id', session.user.id)
        .maybeSingle();

      if (ignore) {
        return;
      }

      if (error) {
        setProfile(null);
        setProfileReady(true);
        return;
      }

      setProfile(data || null);
      setProfileReady(true);
    };

    loadProfile();

    return () => {
      ignore = true;
    };
  }, [session?.user?.id]);

  const handleSignOut = async () => {
    if (!supabase) {
      return;
    }
    await supabase.auth.signOut();
  };

  const handleBackToLogin = () => {
    window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    setAuthHashError(false);
    setSession(null);
    navigate('/');
  };

  if (!isSupabaseConfigured || !supabase) {
    return (
      <div className="app">
        <div className="container">
          <Card>
            <h1 className="page-title">Brak konfiguracji Supabase</h1>
            <p className="page-subtitle">Uzupełnij `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY`.</p>
          </Card>
        </div>
      </div>
    );
  }

  if (authHashError) {
    return (
      <div className="app">
        <div className="container">
          <Card className="centered-card">
            <h1 className="page-title">Problem z logowaniem</h1>
            <p className="page-subtitle">Link do logowania wygasł. Spróbuj zalogować się ponownie.</p>
            <div className="actions" style={{ justifyContent: 'center' }}>
              <Button onClick={handleBackToLogin}>Wróć do logowania</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!authReady) {
    return (
      <div className="app">
        <div className="container">
          <Card>
            <p className="page-subtitle">Sprawdzanie sesji...</p>
          </Card>
        </div>
      </div>
    );
  }

  const authUser = session?.user || null;
  const userEmail = authUser?.email?.toLowerCase() || '';

  if (!userEmail) {
    return (
      <div className="app">
        <div className="container">
          <Login />
        </div>
      </div>
    );
  }

  if (!profileReady) {
    return (
      <div className="app">
        <div className="container">
          <Card>
            <p className="page-subtitle">Ładowanie profilu...</p>
          </Card>
        </div>
      </div>
    );
  }

  if (!profile?.display_name) {
    return (
      <div className="app">
        <div className="container">
          <ProfileSetup authUser={authUser} onSavedProfile={setProfile} />
        </div>
      </div>
    );
  }

  const selectedUser = profile.display_name;
  const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const isAdminEmail = adminEmails.includes(userEmail);
  const partners = USERS.filter((user) => user !== selectedUser);

  return (
    <div className="app">
      <div className="container">
        <Topbar displayName={selectedUser} onSignOut={handleSignOut} showAdmin={isAdminEmail} />
        <Routes>
          <Route path="/" element={<ModeSelect selectedUser={selectedUser} />} />
          <Route path="/mode" element={<ModeSelect selectedUser={selectedUser} />} />
          <Route
            path="/testimony"
            element={<Testimony selectedUser={selectedUser} authorEmail={userEmail} />}
          />
          <Route
            path="/partner"
            element={<SelectPartner users={partners} selectedUser={selectedUser} authorEmail={userEmail} />}
          />
          <Route
            path="/questions"
            element={
              <QuestionsList
                selectedUser={selectedUser}
                questions={QUESTIONS}
                authorEmail={userEmail}
              />
            }
          />
          <Route path="/form" element={<Form selectedUser={selectedUser} authorEmail={userEmail} />} />
          <Route path="/admin" element={<Admin isAdminEmail={isAdminEmail} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
