import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';

function testimonyKey(authorEmail) {
  return `testimonyDraft:${authorEmail}`;
}

export default function Testimony({ selectedUser, authorEmail }) {
  const navigate = useNavigate();
  const [testimony, setTestimony] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    if (!authorEmail) {
      return;
    }
    setTestimony(localStorage.getItem(testimonyKey(authorEmail)) || '');
  }, [authorEmail]);

  if (!selectedUser || !authorEmail) {
    return <Navigate to="/" replace />;
  }

  const handleSave = () => {
    localStorage.setItem(testimonyKey(authorEmail), testimony);
    setSavedMessage('Twoje świadectwo zostało zapisane');
  };

  const handleBack = () => {
    navigate('/mode');
  };

  return (
    <Card>
      <h1 className="page-title">Moje świadectwo</h1>
      <p className="page-subtitle">
        Użytkownik: <strong>{selectedUser}</strong>
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

        {savedMessage && <p className="success">{savedMessage}</p>}

        <div className="actions">
          <Button onClick={handleSave}>Zapisz świadectwo</Button>
          <Button variant="secondary" onClick={handleBack}>
            Powrót
          </Button>
        </div>
      </div>
    </Card>
  );
}
