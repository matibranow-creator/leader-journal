import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import { supabase } from '../lib/supabaseClient';

export default function Testimony({ selectedUser }) {
  const navigate = useNavigate();
  const [testimony, setTestimony] = useState('');
  const [savedMessage, setSavedMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingId, setExistingId] = useState(null);

  useEffect(() => {
    if (!selectedUser) return;

    const loadTestimony = async () => {
      setLoading(true);
      setSavedMessage('');
      setErrorMessage('');

      const { data, error } = await supabase
        .from('entries')
        .select('id, testimony')
        .eq('author', selectedUser)
        .not('testimony', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        setErrorMessage('Nie udało się wczytać świadectwa.');
        setLoading(false);
        return;
      }

      if (data) {
        setExistingId(data.id);
        setTestimony(data.testimony || '');
      } else {
        setExistingId(null);
        setTestimony('');
      }

      setLoading(false);
    };

    loadTestimony();
  }, [selectedUser]);

  if (!selectedUser) {
    return <Navigate to="/" replace />;
  }

  const handleSave = async () => {
    setSavedMessage('');
    setErrorMessage('');
    setLoading(true);

    if (existingId) {
      const { error } = await supabase
        .from('entries')
        .update({
          testimony,
        })
        .eq('id', existingId);

      if (error) {
        setErrorMessage('Nie udało się zapisać świadectwa.');
        setLoading(false);
        return;
      }

      setSavedMessage('Twoje świadectwo zostało zapisane');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('entries')
      .insert({
        author: selectedUser,
        partner: selectedUser,
        testimony,
      })
      .select('id')
      .single();

    if (error) {
      setErrorMessage('Nie udało się zapisać świadectwa.');
      setLoading(false);
      return;
    }

    setExistingId(data.id);
    setSavedMessage('Twoje świadectwo zostało zapisane');
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!existingId) return;

    const confirmed = window.confirm('Na pewno usunąć świadectwo?');
    if (!confirmed) return;

    setSavedMessage('');
    setErrorMessage('');
    setLoading(true);

    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', existingId);

    if (error) {
      setErrorMessage('Nie udało się usunąć świadectwa.');
      setLoading(false);
      return;
    }

    setExistingId(null);
    setTestimony('');
    setSavedMessage('Świadectwo zostało usunięte');
    setLoading(false);
  };

  const handleBack = () => {
    navigate('/mode');
  };

  return (
    <Card>
      <h1 className="page-title">Moje świadectwo</h1>
      <p className="page-subtitle">
  Użytkownik:{' '}
  <strong>
    {selectedUser === 'Magdalena Łabaj'
      ? 'Magdalena Łabaj — KCM ~K'
      : selectedUser}
  </strong>
</p>

      <div className="stack">
        <p className="muted">
          Jeśli masz krótkie świadectwo, którym chciałbyś się podzielić możesz to zrobić tutaj.
        </p>
        <p className="muted">
          Nie jest to obowiązkowe, jeśli nie czujesz potrzeby po prostu pomiń ten krok.
        </p>
        <p className="muted">
          Jeśli jednak chcesz się tym podzielić napisz tak jak czujesz, własnymi słowami, bez spiny, nie musi to być idealne.
        </p>
        <p className="muted">Czasem łatwiej coś napisać niż powiedzieć 🐺</p>

        <Input
          id="testimony"
          label="Treść świadectwa"
          multiline
          rows={8}
          value={testimony}
          onChange={(event) => setTestimony(event.target.value)}
          placeholder="Napisz kilka zdań o tym, co jest dla Ciebie ważne."
        />

        {errorMessage && <p className="error">{errorMessage}</p>}
        {savedMessage && <p className="success">{savedMessage}</p>}
        {loading && <p className="muted">Ładowanie...</p>}

        <div className="actions">
          <Button onClick={handleSave} disabled={loading}>
            {existingId ? 'Zapisz zmiany' : 'Zapisz świadectwo'}
          </Button>

          {existingId ? (
            <Button variant="secondary" onClick={handleDelete} disabled={loading}>
              Usuń świadectwo
            </Button>
          ) : null}

          <Button variant="secondary" onClick={handleBack} disabled={loading}>
            Powrót
          </Button>
        </div>
      </div>
    </Card>
  );
}
