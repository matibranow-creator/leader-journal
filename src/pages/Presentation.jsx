import { useEffect, useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

function pickRandom(items) {
  if (!items.length) {
    return null;
  }
  const index = Math.floor(Math.random() * items.length);
  return items[index];
}

export default function Presentation() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [mode, setMode] = useState('random');
  const [randomEntry, setRandomEntry] = useState(null);

  const fetchPublicEntries = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setErrorMessage('Brak konfiguracji Supabase (.env).');
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('entries')
      .select('id, partner, question, answer, fact, is_highlighted, created_at')
      .eq('is_public', true)
      .eq('is_private', false)
      .order('created_at', { ascending: false });

    setLoading(false);
    if (error) {
      setErrorMessage('Nie udało się pobrać publicznych wpisów.');
      return;
    }

    const list = data || [];
    setEntries(list);
    setRandomEntry(pickRandom(list));
  };

  useEffect(() => {
    fetchPublicEntries();
  }, []);

  return (
    <Card>
      <h1 className="page-title">Widok prezentacyjny</h1>
      <p className="page-subtitle">Wyświetlane są tylko wpisy oznaczone jako publiczne.</p>

      <div className="stack">
        <div className="mode-switch">
          <Button variant={mode === 'random' ? 'primary' : 'secondary'} onClick={() => setMode('random')}>
            Losowy cytat
          </Button>
          <Button variant={mode === 'facts' ? 'primary' : 'secondary'} onClick={() => setMode('facts')}>
            Lista ciekawostek
          </Button>
          <Button variant={mode === 'cards' ? 'primary' : 'secondary'} onClick={() => setMode('cards')}>
            Karty
          </Button>
          <Button variant="ghost" onClick={fetchPublicEntries}>
            Odśwież
          </Button>
        </div>

        {loading && <p className="muted">Ładowanie...</p>}
        {errorMessage && <p className="error">{errorMessage}</p>}
        {!loading && !entries.length && <p className="muted">Brak publicznych wpisów.</p>}

        {!loading && mode === 'random' && randomEntry && (
          <Card>
            <p className="muted">Rozmówca: {randomEntry.partner}</p>
            <p>
              <strong>Odpowiedź:</strong> {randomEntry.answer}
            </p>
            <p>
              <strong>Fakt:</strong> {randomEntry.fact}
            </p>
            <div className="actions">
              <Button onClick={() => setRandomEntry(pickRandom(entries))}>Losuj kolejny cytat</Button>
            </div>
          </Card>
        )}

        {!loading && mode === 'facts' && (
          <div className="entry-list">
            {entries.map((entry) => (
              <Card key={entry.id}>
                <div className="entry-meta">
                  <span>{entry.partner}</span>
                  {entry.is_highlighted && <span className="chip chip-highlight">Wyróżnione</span>}
                </div>
                <p>{entry.fact}</p>
              </Card>
            ))}
          </div>
        )}

        {!loading && mode === 'cards' && (
          <div className="entry-list">
            {entries.map((entry) => (
              <Card key={entry.id}>
                <div className="entry-meta">
                  <span>
                    <strong>Osoba:</strong> {entry.partner}
                  </span>
                  {entry.is_highlighted && <span className="chip chip-highlight">Wyróżnione</span>}
                </div>
                <hr className="divider" />
                <p>
                  <strong>Pytanie:</strong> {entry.question}
                </p>
                <p>
                  <strong>Odpowiedź:</strong> {entry.answer}
                </p>
                <p>
                  <strong>Fakt:</strong> {entry.fact}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
