import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Input from '../components/Input';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

function statusLabel(count) {
  if (!count) {
    return 'brak wpisów';
  }
  if (count === 1) {
    return '1 wpis';
  }
  return `${count} wpisy`;
}

export default function SelectPartner({ users, selectedUser }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [statusByPartner, setStatusByPartner] = useState({});

  const partners = useMemo(() => {
    const base = users.filter((user) => user !== selectedUser);
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return base;
    }
    return base.filter((partner) => partner.toLowerCase().includes(normalized));
  }, [users, selectedUser, query]);

  useEffect(() => {
    if (!selectedUser || !isSupabaseConfigured || !supabase) {
      setStatusByPartner({});
      return;
    }

    let ignore = false;

    const loadStatuses = async () => {
      const { data, error } = await supabase
        .from('entries')
        .select('partner')
        .eq('author', selectedUser);

      if (ignore || error) {
        return;
      }

      const counts = {};
      (data || []).forEach((entry) => {
        counts[entry.partner] = (counts[entry.partner] || 0) + 1;
      });
      setStatusByPartner(counts);
    };

    loadStatuses();

    return () => {
      ignore = true;
    };
  }, [selectedUser]);

  if (!selectedUser) {
    return <Navigate to="/" replace />;
  }

  const handlePick = (partner) => {
    navigate(`/questions?partner=${encodeURIComponent(partner)}`);
  };

  return (
    <Card>
      <h1 className="page-title">Wybierz rozmówcę</h1>
      <p className="page-subtitle">Wybieraj osoby spoza swojej bańki i uzupełniaj wpisy po rozmowie.</p>

      <div className="stack">
        <Input
          id="partner-search"
          label="Szukaj rozmówcy"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Wpisz imię i nazwisko"
        />

        <div className="grid partners-grid">
          {partners.map((partner) => (
            <button
              key={partner}
              type="button"
              className="question-card"
              onClick={() => handlePick(partner)}
            >
              <strong>{partner}</strong>
              <br />
              <span className="muted">Status: {statusLabel(statusByPartner[partner] || 0)}</span>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
