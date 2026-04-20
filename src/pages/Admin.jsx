import { useEffect, useMemo, useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import Select from '../components/Select';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

function escapeCsv(value) {
  const stringValue = value == null ? '' : String(value);
  return `"${stringValue.replace(/"/g, '""')}"`;
}

function createCsv(entries) {
  const headers = [
    'created_at',
    'author',
    'partner',
    'question',
    'answer',
    'fact',
    'reflection',
    'is_public',
    'is_highlighted',
    'is_private',
  ];
  const rows = entries.map((entry) =>
    headers.map((header) => escapeCsv(entry[header])).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

export default function Admin() {
  const [pinInput, setPinInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [authError, setAuthError] = useState('');

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [partnerFilter, setPartnerFilter] = useState('');
  const [questionFilter, setQuestionFilter] = useState('');
  const [searchText, setSearchText] = useState('');

  const adminPin = import.meta.env.VITE_ADMIN_PIN || '1234';

  const fetchEntries = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setErrorMessage('Brak konfiguracji Supabase (.env).');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .order('created_at', { ascending: false });

    setLoading(false);
    if (error) {
      setErrorMessage('Nie udało się pobrać wpisów.');
      return;
    }

    setEntries(data || []);
  };

  useEffect(() => {
    if (unlocked) {
      fetchEntries();
    }
  }, [unlocked]);

  const filteredEntries = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();
    return entries.filter((entry) => {
      if (partnerFilter && entry.partner !== partnerFilter) {
        return false;
      }
      if (questionFilter && entry.question !== questionFilter) {
        return false;
      }
      if (!normalizedSearch) {
        return true;
      }

      const bag = `${entry.partner} ${entry.question} ${entry.answer} ${entry.fact} ${entry.reflection || ''}`.toLowerCase();
      return bag.includes(normalizedSearch);
    });
  }, [entries, partnerFilter, questionFilter, searchText]);

  const partnerOptions = useMemo(() => {
    const partners = Array.from(new Set(entries.map((entry) => entry.partner))).sort();
    return [{ value: '', label: 'Wszyscy rozmówcy' }, ...partners.map((partner) => ({ value: partner, label: partner }))];
  }, [entries]);

  const questionOptions = useMemo(() => {
    const questions = Array.from(new Set(entries.map((entry) => entry.question))).sort();
    return [{ value: '', label: 'Wszystkie pytania' }, ...questions.map((question) => ({ value: question, label: question }))];
  }, [entries]);

  const toggleFlag = async (entryId, flag, currentValue) => {
    if (!supabase) {
      return;
    }

    const { error } = await supabase
      .from('entries')
      .update({ [flag]: !currentValue })
      .eq('id', entryId);

    if (error) {
      setErrorMessage('Nie udało się zaktualizować flagi.');
      return;
    }

    setEntries((previous) =>
      previous.map((entry) =>
        entry.id === entryId ? { ...entry, [flag]: !currentValue } : entry
      )
    );
  };

  const handlePinSubmit = (event) => {
    event.preventDefault();
    if (pinInput === adminPin) {
      setUnlocked(true);
      setAuthError('');
      return;
    }
    setAuthError('Niepoprawny PIN.');
  };

  const handleExportCsv = () => {
    const csv = createCsv(filteredEntries);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `entries-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!unlocked) {
    return (
      <Card>
        <h1 className="page-title">Panel admina</h1>
        <p className="page-subtitle">Podaj PIN, aby zobaczyć autorów i zarządzać wpisami.</p>
        <form className="stack" onSubmit={handlePinSubmit}>
          <Input
            id="admin-pin"
            label="PIN"
            type="password"
            value={pinInput}
            onChange={(event) => setPinInput(event.target.value)}
            required
          />
          {authError && <p className="error">{authError}</p>}
          <Button type="submit">Wejdź</Button>
        </form>
      </Card>
    );
  }

  return (
    <Card>
      <h1 className="page-title">Panel admina</h1>
      <p className="page-subtitle">Filtruj, oznaczaj wpisy i eksportuj CSV.</p>

      <div className="stack">
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <Select
            id="admin-partner"
            label="Filtr rozmówcy"
            value={partnerFilter}
            onChange={(event) => setPartnerFilter(event.target.value)}
            options={partnerOptions}
          />
          <Select
            id="admin-question"
            label="Filtr pytania"
            value={questionFilter}
            onChange={(event) => setQuestionFilter(event.target.value)}
            options={questionOptions}
          />
          <Input
            id="admin-search"
            label="Szukaj tekstu"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Szukaj po odpowiedzi / fakcie / refleksji"
          />
        </div>

        <div className="actions">
          <Button variant="secondary" onClick={fetchEntries} disabled={loading}>
            {loading ? 'Odświeżanie...' : 'Odśwież'}
          </Button>
          <Button onClick={handleExportCsv}>Eksport CSV</Button>
        </div>

        {errorMessage && <p className="error">{errorMessage}</p>}

        <div className="entry-list">
          {filteredEntries.map((entry) => (
            <Card key={entry.id}>
              <div className="entry-meta">
                <span>
                  <strong>Data:</strong> {new Date(entry.created_at).toLocaleString()}
                </span>
                <span>
                  <strong>Autor:</strong> {entry.author}
                </span>
                <span>
                  <strong>Rozmówca:</strong> {entry.partner}
                </span>
              </div>
              <p>
                <strong>Pytanie:</strong> {entry.question}
              </p>
              <p>
                <strong>Odpowiedź:</strong> {entry.answer}
              </p>
              <p>
                <strong>Fakt:</strong> {entry.fact}
              </p>
              {entry.reflection && (
                <p>
                  <strong>Refleksja:</strong> {entry.reflection}
                </p>
              )}
              <div className="actions">
                <Button
                  variant={entry.is_public ? 'primary' : 'secondary'}
                  onClick={() => toggleFlag(entry.id, 'is_public', entry.is_public)}
                >
                  Public: {entry.is_public ? 'TAK' : 'NIE'}
                </Button>
                <Button
                  variant={entry.is_highlighted ? 'primary' : 'secondary'}
                  onClick={() => toggleFlag(entry.id, 'is_highlighted', entry.is_highlighted)}
                >
                  Highlighted: {entry.is_highlighted ? 'TAK' : 'NIE'}
                </Button>
                <Button
                  variant={entry.is_private ? 'danger' : 'secondary'}
                  onClick={() => toggleFlag(entry.id, 'is_private', entry.is_private)}
                >
                  Private: {entry.is_private ? 'TAK' : 'NIE'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Card>
  );
}
