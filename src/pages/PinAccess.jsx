import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

export default function PinAccess({ selectedUser, onUnlock, onChangeUser }) {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!selectedUser) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!isSupabaseConfigured || !supabase) {
      setErrorMessage('Brak konfiguracji Supabase.');
      return;
    }

    if (!pin.trim()) {
      setErrorMessage('Podaj PIN.');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from('user_access')
      .select('id, name')
      .eq('name', selectedUser)
      .eq('pin', pin.trim())
      .maybeSingle();

    setLoading(false);

    if (error || !data) {
      setErrorMessage('Niepoprawny PIN.');
      return;
    }

    localStorage.setItem('selectedUser', selectedUser);
    localStorage.setItem('isUnlocked', 'true');

    if (onUnlock) {
      onUnlock(selectedUser);
    }

    navigate('/mode');
  };

  return (
    <Card>
      <h1 className="page-title">Wejście PIN</h1>
      <p className="page-subtitle">
        Użytkownik: <strong>{selectedUser}</strong>
      </p>

      <form className="stack" onSubmit={handleSubmit}>
        <Input
          id="pin-access"
          label="PIN"
          type="password"
          value={pin}
          onChange={(event) => setPin(event.target.value)}
          placeholder="Wpisz swój PIN"
          required
        />

        {errorMessage && <p className="error">{errorMessage}</p>}

        <div className="actions">
          <Button type="submit" disabled={loading}>
            {loading ? 'Sprawdzanie...' : 'Wejdź'}
          </Button>
          <Button type="button" variant="secondary" onClick={onChangeUser}>
            Zmień użytkownika
          </Button>
        </div>
      </form>
    </Card>
  );
}