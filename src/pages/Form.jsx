import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import Select from '../components/Select';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

export default function Form({ selectedUser, questions }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const partner = searchParams.get('partner') || '';

  const [question, setQuestion] = useState(questions[0] || '');
  const [answer, setAnswer] = useState('');
  const [fact, setFact] = useState('');
  const [reflection, setReflection] = useState('');

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!selectedUser) {
    return <Navigate to="/" replace />;
  }

  if (!partner) {
    return <Navigate to="/partner" replace />;
  }

  const resetForm = () => {
    setAnswer('');
    setFact('');
    setReflection('');
    setQuestion(questions[0] || '');
    setSaved(false);
    setErrorMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!answer.trim() || !fact.trim()) {
      setErrorMessage('Wypełnij wymagane pola: odpowiedź i zaskakujący fakt.');
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setErrorMessage('Brak konfiguracji Supabase (.env).');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('entries').insert({
      author: selectedUser,
      partner,
      question,
      answer: answer.trim(),
      fact: fact.trim(),
      reflection: reflection.trim() || null,
    });
    setLoading(false);

    if (error) {
      setErrorMessage('Nie udało się zapisać wpisu. Sprawdź połączenie z Supabase.');
      return;
    }

    setSaved(true);
  };

  if (saved) {
    return (
      <Card>
        <h1 className="page-title">Wpis zapisany</h1>
        <p className="page-subtitle">
          Rozmówca: <strong>{partner}</strong>
        </p>
        <div className="actions">
          <Button onClick={resetForm}>Dodaj kolejny wpis</Button>
          <Button variant="secondary" onClick={() => navigate('/partner')}>
            Wróć do wyboru rozmówcy
          </Button>
        </div>
      </Card>
    );
  }

  const questionOptions = questions.map((item) => ({ value: item, label: item }));

  return (
    <Card>
      <h1 className="page-title">Nowy wpis</h1>
      <p className="page-subtitle">
        Rozmówca: <strong>{partner}</strong>
      </p>

      <form className="stack" onSubmit={handleSubmit}>
        <Select
          id="question"
          label="Pytanie"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          options={questionOptions}
          required
        />

        <Input
          id="answer"
          label="Odpowiedź"
          multiline
          required
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          placeholder="Wpisz odpowiedź rozmówcy"
        />

        <Input
          id="fact"
          label="Zaskakujący fakt"
          required
          value={fact}
          onChange={(event) => setFact(event.target.value)}
          placeholder="Np. Biega ultramaratony"
        />

        <Input
          id="reflection"
          label="Twoja refleksja (opcjonalnie)"
          multiline
          rows={3}
          value={reflection}
          onChange={(event) => setReflection(event.target.value)}
          placeholder="Co Cię zaskoczyło w tej rozmowie?"
        />

        {errorMessage && <p className="error">{errorMessage}</p>}

        <div className="actions">
          <Button type="submit" disabled={loading}>
            {loading ? 'Zapisywanie...' : 'Zapisz wpis'}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/partner')}>
            Anuluj
          </Button>
        </div>
      </form>
    </Card>
  );
}
