import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

const ENTRY_TYPES = new Set(['question', 'fact', 'reflection', 'custom']);

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

function writeDraft(authorEmail, partner, draft) {
  localStorage.setItem(draftStorageKey(authorEmail, partner), JSON.stringify(draft));
}

function hasQuestionDraft(draft, question) {
  return Object.prototype.hasOwnProperty.call(draft.questionAnswers || {}, question);
}

export default function Form({ selectedUser, authorEmail }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const partner = searchParams.get('partner') || '';
  const selectedQuestion = searchParams.get('question') || '';
  const rawType = searchParams.get('type') || (selectedQuestion ? 'question' : 'custom');
  const entryType = ENTRY_TYPES.has(rawType) ? rawType : 'question';

  const [answer, setAnswer] = useState('');
  const [fact, setFact] = useState('');
  const [reflection, setReflection] = useState('');
  const [customQuestion, setCustomQuestion] = useState('');
  const [customAnswer, setCustomAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authorEmail || !partner) {
      return;
    }

    let ignore = false;

    const load = async () => {
      const draft = readDraft(authorEmail, partner);

      if (entryType === 'question') {
        if (hasQuestionDraft(draft, selectedQuestion)) {
          setAnswer(draft.questionAnswers[selectedQuestion] || '');
          return;
        }

        if (!isSupabaseConfigured || !supabase) {
          setAnswer('');
          return;
        }

        setLoading(true);
        const { data } = await supabase
          .from('entries')
          .select('answer')
          .eq('author', authorEmail)
          .eq('partner', partner)
          .eq('question', selectedQuestion)
          .order('created_at', { ascending: false })
          .limit(1);
        setLoading(false);
        if (!ignore) {
          setAnswer(data?.[0]?.answer || '');
        }
        return;
      }

      if (entryType === 'fact') {
        if (draft.fact.trim()) {
          setFact(draft.fact);
          return;
        }

        if (!isSupabaseConfigured || !supabase) {
          setFact('');
          return;
        }

        setLoading(true);
        const { data } = await supabase
          .from('entries')
          .select('fact')
          .eq('author', authorEmail)
          .eq('partner', partner)
          .not('fact', 'is', null)
          .order('created_at', { ascending: false })
          .limit(1);
        setLoading(false);
        if (!ignore) {
          setFact(data?.[0]?.fact || '');
        }
        return;
      }

      if (entryType === 'reflection') {
        if (draft.reflection.trim()) {
          setReflection(draft.reflection);
          return;
        }

        if (!isSupabaseConfigured || !supabase) {
          setReflection('');
          return;
        }

        setLoading(true);
        const { data } = await supabase
          .from('entries')
          .select('reflection')
          .eq('author', authorEmail)
          .eq('partner', partner)
          .not('reflection', 'is', null)
          .order('created_at', { ascending: false })
          .limit(1);
        setLoading(false);
        if (!ignore) {
          setReflection(data?.[0]?.reflection || '');
        }
        return;
      }

      if (draft.custom_question.trim() || draft.custom_answer.trim()) {
        setCustomQuestion(draft.custom_question || '');
        setCustomAnswer(draft.custom_answer || '');
        return;
      }

      if (!isSupabaseConfigured || !supabase) {
        setCustomQuestion('');
        setCustomAnswer('');
        return;
      }

      setLoading(true);
      const { data } = await supabase
        .from('entries')
        .select('custom_question, custom_answer')
        .eq('author', authorEmail)
        .eq('partner', partner)
        .or('custom_question.not.is.null,custom_answer.not.is.null')
        .order('created_at', { ascending: false })
        .limit(1);
      setLoading(false);
      if (!ignore) {
        setCustomQuestion(data?.[0]?.custom_question || '');
        setCustomAnswer(data?.[0]?.custom_answer || '');
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [authorEmail, partner, entryType, selectedQuestion]);

  if (!selectedUser || !authorEmail) {
    return <Navigate to="/" replace />;
  }

  if (!partner) {
    return <Navigate to="/partner" replace />;
  }

  if (entryType === 'question' && !selectedQuestion) {
    return <Navigate to={`/questions?partner=${encodeURIComponent(partner)}`} replace />;
  }

  const formTitle = useMemo(() => {
    if (entryType === 'question') {
      return 'Pytanie z listy';
    }
    if (entryType === 'fact') {
      return 'Zaskakujący fakt';
    }
    if (entryType === 'reflection') {
      return 'Refleksja';
    }
    return 'Własne pytanie / własna odpowiedź';
  }, [entryType]);

  const handleBack = () => {
    const draft = readDraft(authorEmail, partner);

    if (entryType === 'question') {
      draft.questionAnswers = draft.questionAnswers || {};
      draft.questionAnswers[selectedQuestion] = answer;
    } else if (entryType === 'fact') {
      draft.fact = fact;
    } else if (entryType === 'reflection') {
      draft.reflection = reflection;
    } else if (entryType === 'custom') {
      draft.custom_question = customQuestion;
      draft.custom_answer = customAnswer;
    }

    writeDraft(authorEmail, partner, draft);
    navigate(`/questions?partner=${encodeURIComponent(partner)}`);
  };

  return (
    <Card>
      <h1 className="page-title">{formTitle}</h1>
      <p className="page-subtitle">
        Rozmowa z: <strong>{partner}</strong>
      </p>

      <div className="stack">
        {loading ? <p className="muted">Ładowanie wcześniejszych danych...</p> : null}

        {entryType === 'question' && (
          <>
            <div className="field">
              <span className="field-label">Wybrane pytanie z listy</span>
              <div className="question-card question-card-selected">{selectedQuestion}</div>
            </div>
            <Input
              id="answer"
              label="Odpowiedź rozmówcy"
              multiline
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Wpisz odpowiedź rozmówcy"
            />
          </>
        )}

        {entryType === 'fact' && (
          <Input
            id="fact"
            label="Zaskakujący fakt"
            multiline
            rows={4}
            value={fact}
            onChange={(event) => setFact(event.target.value)}
            placeholder="Wpisz zaskakujący fakt o rozmówcy"
          />
        )}

        {entryType === 'reflection' && (
          <Input
            id="reflection"
            label="Refleksja"
            multiline
            rows={4}
            value={reflection}
            onChange={(event) => setReflection(event.target.value)}
            placeholder="Wpisz swoją refleksję po rozmowie"
          />
        )}

        {entryType === 'custom' && (
          <>
            <Input
              id="custom-question"
              label="Własne pytanie"
              multiline
              rows={4}
              value={customQuestion}
              onChange={(event) => setCustomQuestion(event.target.value)}
              placeholder="Wpisz własne pytanie"
            />
            <Input
              id="custom-answer"
              label="Własna odpowiedź"
              multiline
              rows={4}
              value={customAnswer}
              onChange={(event) => setCustomAnswer(event.target.value)}
              placeholder="Wpisz własną odpowiedź"
            />
          </>
        )}

        <div className="actions">
          <Button onClick={handleBack}>Powrót</Button>
        </div>
      </div>
    </Card>
  );
}
