import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

function draftStorageKey(authorEmail, partner) {
  return `entryDraft:${authorEmail}:${partner}`;
}

function createEmptyDraft() {
  return {
    questionAnswers: {},
    fact: '',
    reflection: '',
    custom_question: '',
    custom_answer: '',
  };
}

function readDraft(authorEmail, partner) {
  if (!authorEmail || !partner) {
    return createEmptyDraft();
  }

  try {
    const raw = localStorage.getItem(draftStorageKey(authorEmail, partner));
    if (!raw) {
      return createEmptyDraft();
    }
    const parsed = JSON.parse(raw);
    return {
      questionAnswers: parsed?.questionAnswers || {},
      fact: parsed?.fact || '',
      reflection: parsed?.reflection || '',
      custom_question: parsed?.custom_question || '',
      custom_answer: parsed?.custom_answer || '',
    };
  } catch {
    return createEmptyDraft();
  }
}

function hasQuestionDraft(draft, question) {
  return Object.prototype.hasOwnProperty.call(draft.questionAnswers || {}, question);
}

function shortPreview(value) {
  const text = String(value || '').trim();
  if (!text) {
    return '';
  }
  return text.length > 56 ? `${text.slice(0, 56)}...` : text;
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function questionEmoji(question) {
  const normalized = normalizeText(question);
  if (normalized.includes('muzyk') || normalized.includes('utwor') || normalized.includes('sluchasz')) {
    return '🎧';
  }
  if (normalized.includes('rozw') || normalized.includes('inspir') || normalized.includes('motyw')) {
    return '🌱';
  }
  if (normalized.includes('rozbaw') || normalized.includes('smiesz') || normalized.includes('lez')) {
    return '😂';
  }
  if (
    normalized.includes('wiara') ||
    normalized.includes('wdziecz') ||
    normalized.includes('nadziej') ||
    normalized.includes('pokoj')
  ) {
    return '🙏';
  }
  return '💭';
}

function parseSavedEntries(records) {
  const parsed = {
    questionAnswers: {},
    fact: '',
    reflection: '',
    custom_question: '',
    custom_answer: '',
    questionRowsByText: {},
    factRow: null,
    reflectionRow: null,
    customRow: null,
    raw: records,
  };

  (records || []).forEach((entry) => {
    if (entry.question && entry.answer && !parsed.questionRowsByText[entry.question]) {
      parsed.questionRowsByText[entry.question] = entry;
      parsed.questionAnswers[entry.question] = entry.answer;
    }
    if (entry.fact && !parsed.factRow) {
      parsed.factRow = entry;
      parsed.fact = entry.fact;
    }
    if (entry.reflection && !parsed.reflectionRow) {
      parsed.reflectionRow = entry;
      parsed.reflection = entry.reflection;
    }
    if ((entry.custom_question || entry.custom_answer) && !parsed.customRow) {
      parsed.customRow = entry;
      parsed.custom_question = entry.custom_question || '';
      parsed.custom_answer = entry.custom_answer || '';
    }
  });

  return parsed;
}

export default function QuestionsList({ selectedUser, questions, authorEmail }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const partner = searchParams.get('partner') || '';

  const [draft, setDraft] = useState(createEmptyDraft());
  const [savedData, setSavedData] = useState(parseSavedEntries([]));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadSavedEntries = async () => {
    if (!isSupabaseConfigured || !supabase || !authorEmail || !partner) {
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('author', authorEmail)
      .eq('partner', partner)
      .order('created_at', { ascending: false });
    setLoading(false);

    if (error) {
      setErrorMessage('Nie udało się pobrać zapisanych wpisów.');
      return;
    }

    setSavedData(parseSavedEntries(data || []));
  };

  useEffect(() => {
    setDraft(readDraft(authorEmail, partner));
    setErrorMessage('');
    setSuccessMessage('');
  }, [authorEmail, partner]);

  useEffect(() => {
    loadSavedEntries();
  }, [authorEmail, partner]);

  if (!selectedUser || !authorEmail) {
    return <Navigate to="/" replace />;
  }

  if (!partner) {
    return <Navigate to="/partner" replace />;
  }

  const openForm = (type, question = '') => {
    const params = new URLSearchParams({ partner, type });
    if (question) {
      params.set('question', question);
    }
    navigate(`/form?${params.toString()}`);
  };

  const effectiveQuestionAnswer = (question) => {
    if (hasQuestionDraft(draft, question)) {
      return draft.questionAnswers[question] || '';
    }
    return savedData.questionAnswers[question] || '';
  };

  const effectiveFact = draft.fact.trim() || savedData.fact || '';
  const effectiveReflection = draft.reflection.trim() || savedData.reflection || '';
  const effectiveCustomQuestion = draft.custom_question.trim() || savedData.custom_question || '';
  const effectiveCustomAnswer = draft.custom_answer.trim() || savedData.custom_answer || '';

  const completedQuestionsCount = useMemo(() => {
    return questions.filter((question) => String(effectiveQuestionAnswer(question)).trim()).length;
  }, [questions, draft, savedData]);

  const handleSaveAll = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!isSupabaseConfigured || !supabase) {
      setErrorMessage('Brak konfiguracji Supabase (.env).');
      return;
    }

    const updates = [];
    const inserts = [];

    Object.entries(draft.questionAnswers || {}).forEach(([question, answer]) => {
      const normalizedAnswer = String(answer || '').trim();
      if (!normalizedAnswer) {
        return;
      }

      const existing = savedData.questionRowsByText[question];
      const payload = {
        author: authorEmail,
        partner,
        question,
        answer: normalizedAnswer,
        fact: null,
        reflection: null,
        custom_question: null,
        custom_answer: null,
      };

      if (existing) {
        updates.push({ id: existing.id, payload });
      } else {
        inserts.push(payload);
      }
    });

    if (draft.fact.trim()) {
      const payload = {
        author: authorEmail,
        partner,
        question: null,
        answer: null,
        fact: draft.fact.trim(),
        reflection: null,
        custom_question: null,
        custom_answer: null,
      };

      if (savedData.factRow) {
        updates.push({ id: savedData.factRow.id, payload });
      } else {
        inserts.push(payload);
      }
    }

    if (draft.reflection.trim()) {
      const payload = {
        author: authorEmail,
        partner,
        question: null,
        answer: null,
        fact: null,
        reflection: draft.reflection.trim(),
        custom_question: null,
        custom_answer: null,
      };

      if (savedData.reflectionRow) {
        updates.push({ id: savedData.reflectionRow.id, payload });
      } else {
        inserts.push(payload);
      }
    }

    if (draft.custom_question.trim() || draft.custom_answer.trim()) {
      const payload = {
        author: authorEmail,
        partner,
        question: null,
        answer: null,
        fact: null,
        reflection: null,
        custom_question: draft.custom_question.trim() || null,
        custom_answer: draft.custom_answer.trim() || null,
      };

      if (savedData.customRow) {
        updates.push({ id: savedData.customRow.id, payload });
      } else {
        inserts.push(payload);
      }
    }

    if (!updates.length && !inserts.length) {
      setErrorMessage('Brak nowych zmian do zapisania.');
      return;
    }

    setSaving(true);

    for (const updateItem of updates) {
      const { error } = await supabase
        .from('entries')
        .update(updateItem.payload)
        .eq('id', updateItem.id);

      if (error) {
        setSaving(false);
        setErrorMessage('Nie udało się zapisać zmian.');
        return;
      }
    }

    if (inserts.length) {
      const { error } = await supabase.from('entries').insert(inserts);
      if (error) {
        setSaving(false);
        setErrorMessage('Nie udało się zapisać nowych wpisów.');
        return;
      }
    }

    setSaving(false);
    localStorage.removeItem(draftStorageKey(authorEmail, partner));
    setDraft(createEmptyDraft());
    setSuccessMessage('Wszystkie wpisy zostały zapisane.');
    loadSavedEntries();
  };

  const factPreview = shortPreview(effectiveFact);
  const reflectionPreview = shortPreview(effectiveReflection);
  const customPreview = shortPreview(effectiveCustomQuestion) || shortPreview(effectiveCustomAnswer);

  return (
    <Card>
      <h1 className="page-title">Lista opcji wpisu</h1>
      <p className="page-subtitle">
        Rozmowa z: <strong>{partner}</strong>
      </p>

      <div className="stack">
        <div className="grid users-grid">
          <button type="button" className="question-card section-card" onClick={() => openForm('fact')}>
            <strong>✨ Zaskakujący fakt</strong>
            <br />
            <span className="muted">{factPreview ? `Uzupełniono: ${factPreview}` : 'Nie uzupełniono'}</span>
          </button>
          <button type="button" className="question-card section-card" onClick={() => openForm('reflection')}>
            <strong>💭 Refleksja</strong>
            <br />
            <span className="muted">
              {reflectionPreview ? `Uzupełniono: ${reflectionPreview}` : 'Nie uzupełniono'}
            </span>
          </button>
          <button type="button" className="question-card section-card" onClick={() => openForm('custom')}>
            <strong>✍️ Własne pytanie / własna odpowiedź</strong>
            <br />
            <span className="muted">{customPreview ? `Uzupełniono: ${customPreview}` : 'Nie uzupełniono'}</span>
          </button>
        </div>

        <div className="stack">
          <h2 className="page-title section-title">Pytania z listy</h2>
          <p className="muted">Uzupełnione pytania: {completedQuestionsCount}</p>
          <div className="question-list">
            {questions.map((question) => {
              const answerPreview = shortPreview(effectiveQuestionAnswer(question));
              return (
                <button
                  key={question}
                  type="button"
                  className={`question-card ${answerPreview ? 'question-card-selected' : ''}`.trim()}
                  onClick={() => openForm('question', question)}
                >
                  <strong>
                    {questionEmoji(question)} {question}
                  </strong>
                  <br />
                  <span className="muted">{answerPreview ? `Uzupełniono: ${answerPreview}` : 'Nie uzupełniono'}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="stack">
          <h2 className="page-title section-title">Dotychczas zapisane</h2>
          {loading ? <p className="muted">Ładowanie zapisanych wpisów...</p> : null}
          {!loading && !savedData.raw.length ? (
            <p className="muted">Nie ma jeszcze zapisanych wpisów dla tej osoby.</p>
          ) : null}
          {!loading && savedData.raw.length ? (
            <div className="entry-list">
              {Object.entries(savedData.questionAnswers).map(([question, answer]) => (
                <Card key={`saved-question-${question}`}>
                  <p>
                    <strong>Pytanie:</strong> {question}
                  </p>
                  <p>
                    <strong>Odpowiedź:</strong> {answer}
                  </p>
                </Card>
              ))}
              {savedData.fact ? (
                <Card>
                  <p>
                    <strong>Zaskakujący fakt:</strong> {savedData.fact}
                  </p>
                </Card>
              ) : null}
              {savedData.reflection ? (
                <Card>
                  <p>
                    <strong>Refleksja:</strong> {savedData.reflection}
                  </p>
                </Card>
              ) : null}
              {savedData.custom_question || savedData.custom_answer ? (
                <Card>
                  {savedData.custom_question ? (
                    <p>
                      <strong>Własne pytanie:</strong> {savedData.custom_question}
                    </p>
                  ) : null}
                  {savedData.custom_answer ? (
                    <p>
                      <strong>Własna odpowiedź:</strong> {savedData.custom_answer}
                    </p>
                  ) : null}
                </Card>
              ) : null}
            </div>
          ) : null}
        </div>

        {errorMessage && <p className="error">{errorMessage}</p>}
        {successMessage && <p className="success">{successMessage}</p>}

        <div className="actions">
          <Button onClick={handleSaveAll} disabled={saving}>
            {saving ? 'Zapisywanie...' : 'Zapisz wszystko'}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/partner')}>
            Powrót
          </Button>
        </div>
      </div>
    </Card>
  );
}
