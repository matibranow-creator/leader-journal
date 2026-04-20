import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';

export default function SelectPartner({ users, selectedUser }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const partners = useMemo(() => {
    const base = users.filter((user) => user !== selectedUser);
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return base;
    }
    return base.filter((partner) => partner.toLowerCase().includes(normalized));
  }, [users, selectedUser, query]);

  if (!selectedUser) {
    return <Navigate to="/" replace />;
  }

  const handlePick = (partner) => {
    navigate(`/form?partner=${encodeURIComponent(partner)}`);
  };

  return (
    <Card>
      <h1 className="page-title">Wybierz rozmówcę</h1>
      <p className="page-subtitle">Wybieraj osoby spoza swojej bańki i uzupełniaj wpis po rozmowie.</p>

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
            <Button key={partner} variant="secondary" onClick={() => handlePick(partner)}>
              {partner}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}
