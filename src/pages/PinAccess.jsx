import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';

const USER_PINS_KEY = 'userPins';

function readUserPins() {
  try {
    const raw = localStorage.getItem(USER_PINS_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeUserPins(pins) {
  localStorage.setItem(USER_PINS_KEY, JSON.stringify(pins));
}

export default function PinAccess({ selectedUser, onPinVerified, onChangeUser }) {
  const navigate = useNavigate();
  const [pins, setPins] = useState(() => readUserPins());
  const [pin, setPin] = useState('');
  const [repeatPin, setRepeatPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const hasPin = useMemo(() => Boolean(pins[selectedUser]), [pins, selectedUser]);

  if (!selectedUser) {
    return <Navigate to="/" replace />;
  }

  const validatePin = (value) => /^\d{4}$/.test(value);

  const handleSetPin = (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!validatePin(pin)) {
      setErrorMessage('PIN musi mieć dokładnie 4 cyfry.');
      return;
    }

    if (pin !== repeatPin) {
      setErrorMessage('PIN-y nie są takie same.');
      return;
    }

    const nextPins = {
      ...pins,
      [selectedUser]: pin,
    };
    setPins(nextPins);
    writeUserPins(nextPins);
    onPinVerified();
    navigate('/mode');
  };

  const handleVerifyPin = (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (pin === pins[selectedUser]) {
      onPinVerified();
      navigate('/mode');
      return;
    }

    setErrorMessage('Błędny PIN.');
  };

  return (
    <Card className="centered-card">
      <h1 className="page-title">{hasPin ? 'Wpisz PIN' : 'Ustaw PIN'}</h1>
      <p className="page-subtitle">
        Użytkownik: <strong>{selectedUser}</strong>
      </p>

      {!hasPin ? (
        <form className="stack" onSubmit={handleSetPin}>
          <Input
            id="set-pin"
            label="PIN (4 cyfry)"
            type="password"
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            placeholder="1234"
            required
          />
          <Input
            id="repeat-pin"
            label="Powtórz PIN"
            type="password"
            value={repeatPin}
            onChange={(event) => setRepeatPin(event.target.value)}
            placeholder="1234"
            required
          />
          {errorMessage && <p className="error">{errorMessage}</p>}
          <div className="actions">
            <Button type="submit">Zapisz PIN</Button>
            <Button type="button" variant="secondary" onClick={onChangeUser}>
              Zmień użytkownika
            </Button>
          </div>
        </form>
      ) : (
        <form className="stack" onSubmit={handleVerifyPin}>
          <Input
            id="enter-pin"
            label="PIN"
            type="password"
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            placeholder="Wpisz PIN"
            required
          />
          {errorMessage && <p className="error">{errorMessage}</p>}
          <div className="actions">
            <Button type="submit">Wejdź</Button>
            <Button type="button" variant="secondary" onClick={onChangeUser}>
              Zmień użytkownika
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
