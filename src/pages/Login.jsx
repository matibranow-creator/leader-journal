import { useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!isSupabaseConfigured || !supabase) {
      setErrorMessage('Brak konfiguracji Supabase (.env).');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Podaj adres email.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);

    if (error) {
      setErrorMessage('Nie udało się wysłać kodu logowania.');
      return;
    }

    setSuccessMessage('Kod logowania został wysłany na podany email.');
  };

  return (
    <Card className="centered-card">
      <h1 className="page-title">Logowanie</h1>
      <p className="page-subtitle">Zaloguj się mailem i kodem, aby przejść do swoich wpisów.</p>

      <form className="stack" onSubmit={handleSubmit}>
        <Input
          id="auth-email"
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="twoj.email@example.com"
          required
        />

        {errorMessage && <p className="error">{errorMessage}</p>}
        {successMessage && <p className="success">{successMessage}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? 'Wysyłanie...' : 'Wyślij kod'}
        </Button>
      </form>
    </Card>
  );
}
