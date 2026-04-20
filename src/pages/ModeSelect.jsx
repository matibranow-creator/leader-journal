import { Navigate, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';

export default function ModeSelect({ selectedUser }) {
  const navigate = useNavigate();

  if (!selectedUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <Card>
      <h1 className="page-title">Wybierz tryb</h1>
      <p className="page-subtitle">
        Aktualny użytkownik: <strong>{selectedUser}</strong>
      </p>

      <div className="stack">
        <button type="button" className="question-card mode-option" onClick={() => navigate('/testimony')}>
          <strong>Moje świadectwo</strong>
          <span className="muted">
            Jeśli masz krótkie świadectwo, którym chciałbyś się podzielić możesz to zrobić tutaj.
          </span>
          <span className="muted">
            Nie jest to obowiązkowe, jeśli nie czujesz potrzeby po prostu pomiń ten krok.
          </span>
          <span className="muted">
            Jeśli jednak chcesz się tym podzielić napisz tak jak czujesz, własnymi słowami, bez spiny, nie musi to być idealne.
          </span>
          <span className="muted">Czasem łatwiej coś napisać niż powiedzieć 🐺</span>
        </button>

        <button type="button" className="question-card mode-option" onClick={() => navigate('/partner')}>
          <strong>Rozmowa z liderem</strong>
          <span className="muted">
            Przejdź do wyboru rozmówcy i uzupełniania wpisów po rozmowie.
          </span>
        </button>

        <div className="actions">
          <Button variant="ghost" onClick={() => navigate('/partner')}>
            Pomiń świadectwo na razie
          </Button>
        </div>
      </div>
    </Card>
  );
}
