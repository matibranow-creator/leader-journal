import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';

export default function SelectUser({ users, onSelectUser }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return users;
    }
    return users.filter((user) => user.toLowerCase().includes(normalized));
  }, [users, query]);

  const handlePick = (user) => {
    onSelectUser(user);
    navigate('/partner');
  };

  return (
    <Card>
      <h1 className="page-title">Wybierz siebie</h1>
      <p className="page-subtitle">Ten wybór zapisuje się lokalnie na urządzeniu.</p>

      <div className="stack">
        <Input
          id="user-search"
          label="Szukaj użytkownika"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Wpisz imię i nazwisko"
        />

        <div className="grid users-grid">
          {filteredUsers.map((user) => (
            <Button key={user} variant="secondary" onClick={() => handlePick(user)}>
              {user}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}
