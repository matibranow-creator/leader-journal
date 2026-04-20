import { useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!isSupabaseConfigured || !supabase) {
      setErrorMessage('Brak konfiguracji Supabase (.env).');
      return;
    }

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Podaj email i hasło.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage('Niepoprawny email lub hasło.');
      return;
    }

    setSuccessMessage('Zalogowano.');
  };

  const handleSignup = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Podaj email i hasło.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage('Nie udało się utworzyć konta.');
      return;
    }

    setSuccessMessage('Konto utworzone. Możesz się zalogować.');
  };

  return (
    <Card className="centered-card">
      <h1 className="page-title">Logowanie</h1>
      <p className="page-subtitle">Zaloguj się mailem i hasłem.</p>

      <form className="stack" onSubmit={handleLogin}>
        <Input
          id="auth-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="twoj.email@example.com"
          required
        />

        <Input
          id="auth-password"
          label="Hasło"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Twoje hasło"
          required
        />

        {errorMessage && <p className="error">{errorMessage}</p>}
        {successMessage && <p className="success">{successMessage}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? 'Logowanie...' : 'Zaloguj'}
        </Button>

        <Button type="button" variant="ghost" onClick={handleSignup} disabled={loading}>
          Zarejestruj
        </Button>
      </form>
    </Card>
  );
}