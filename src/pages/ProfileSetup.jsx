import { useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

export default function ProfileSetup({ authUser, onSavedProfile }) {
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSave = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!isSupabaseConfigured || !supabase) {
      setErrorMessage('Brak konfiguracji Supabase (.env).');
      return;
    }

    if (!displayName.trim()) {
      setErrorMessage('Podaj imię i nazwisko.');
      return;
    }

    setLoading(true);
    const payload = {
      id: authUser.id,
      email: String(authUser.email || '').toLowerCase(),
      display_name: displayName.trim(),
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select('id, email, display_name')
      .single();
    setLoading(false);

    if (error) {
      setErrorMessage('Nie udało się zapisać profilu.');
      return;
    }

    onSavedProfile(data);
  };

  return (
    <Card className="centered-card">
      <h1 className="page-title">Uzupełnij profil</h1>
      <p className="page-subtitle">
        Pierwsze logowanie. Jak masz na imię i nazwisko?
      </p>

      <form className="stack" onSubmit={handleSave}>
        <Input
          id="display-name"
          label="Imię i nazwisko"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Np. Jan Kowalski"
          required
        />

        {errorMessage && <p className="error">{errorMessage}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? 'Zapisywanie...' : 'Zapisz'}
        </Button>
      </form>
    </Card>
  );
}
