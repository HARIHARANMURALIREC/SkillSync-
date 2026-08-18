import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getApiErrorMessage } from '../services/api';
import { CardSkeleton } from '../components/LoadingSkeleton';

const MCQTest = () => {
  const { skillName } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [skillName]);

  const fetchQuestions = async () => {
    try {
      const response = await api.get(`/api/assessment/questions/${skillName}`);
      setQuestions(response.data);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, optionId) => {
    setAnswers({
      ...answers,
      [questionId]: optionId,
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await api.post('/api/assessment/submit', {
        skill_name: skillName,
        answers: answers,
      });
      navigate('/assessment-result', { state: { result: response.data } });
    } catch (error) {
      console.error('Failed to submit assessment:', error);
      alert(getApiErrorMessage(error, 'Failed to submit assessment. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <CardSkeleton />;
  }

  if (questions.length === 0) {
    return (
      <div className="card text-center py-16">
        <p className="text-muted">No questions available for this skill.</p>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-2xl mx-auto">
      <p className="page-kicker">{skillName}</p>
      <div className="card">
        <div className="mb-8">
          <div className="flex justify-between text-xs uppercase tracking-wider text-muted mb-3">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{answeredCount} answered</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1">
            <div
              className="bg-gold h-1 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <h2 className="font-serif text-2xl mb-6 leading-snug">{question.question_text}</h2>
        <div className="space-y-3 mb-10">
          {question.options.map((option) => {
            const selected = answers[question.id] === option.id;
            return (
              <button
                key={option.id}
                onClick={() => handleAnswer(question.id, option.id)}
                className={`w-full text-left p-4 rounded-xl border transition-colors ${
                  selected
                    ? 'border-gold bg-gold-faint text-cream'
                    : 'border-white/10 hover:border-white/20 text-cream/90'
                }`}
              >
                {option.text}
              </button>
            );
          })}
        </div>

        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="btn-secondary"
          >
            Previous
          </button>
          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting || answeredCount < questions.length}
              className="btn-primary"
            >
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          ) : (
            <button onClick={handleNext} className="btn-primary">
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MCQTest;
