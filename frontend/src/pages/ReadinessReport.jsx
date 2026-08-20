import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Copy, Printer, Share2 } from 'lucide-react';
import {
  createReadinessReport,
  getLatestReadinessReport,
  getPublicReadinessReport,
  getApiErrorMessage,
  publicReportUrl,
} from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function ReadinessReportView({ snapshot, publicView = false }) {
  if (!snapshot) return null;

  const fresh = snapshot.freshness_summary || {};

  return (
    <article className="readiness-report mx-auto max-w-3xl space-y-8 print:max-w-none print:space-y-6">
      <header className="border-b border-line pb-6 print:border-black/20">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent print:text-black">
          Job-readiness report
        </p>
        <h1 className="mt-2 text-3xl font-bold print:text-black">{snapshot.display_name}</h1>
        {snapshot.career_goal && (
          <p className="mt-2 text-muted print:text-black/70">Goal: {snapshot.career_goal}</p>
        )}
        <p className="mt-1 text-sm text-muted print:text-black/60">
          Generated {formatDate(snapshot.generated_at)}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3 print:grid-cols-3">
        <div className="card print:border print:border-black/15 print:shadow-none">
          <p className="section-label">Readiness</p>
          <p className="mt-2 text-4xl font-bold tabular text-accent print:text-black">
            {snapshot.readiness_score}%
          </p>
          <p className="mt-1 text-sm text-muted print:text-black/60">
            {snapshot.completed_skills}/{snapshot.total_skills} skills
          </p>
        </div>
        <div className="card print:border print:border-black/15 print:shadow-none">
          <p className="section-label">Path progress</p>
          <p className="mt-2 text-4xl font-bold tabular print:text-black">
            {snapshot.path_completion_pct}%
          </p>
          <p className="mt-1 text-sm text-muted print:text-black/60">
            {snapshot.resources_completed}/{snapshot.total_resources} resources
          </p>
        </div>
        <div className="card print:border print:border-black/15 print:shadow-none">
          <p className="section-label">Streak</p>
          <p className="mt-2 text-4xl font-bold tabular print:text-black">{snapshot.streak_days}</p>
          <p className="mt-1 text-sm text-muted print:text-black/60">day streak</p>
        </div>
      </section>

      {(snapshot.top_gaps || []).length > 0 && (
        <section className="card print:border print:border-black/15 print:shadow-none">
          <p className="section-label">Top skill gaps</p>
          <ul className="mt-4 space-y-3">
            {snapshot.top_gaps.map((gap) => (
              <li key={gap.skill_name} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-medium">{gap.skill_name}</span>
                <span className="text-muted print:text-black/70">
                  {gap.current_level?.toFixed?.(1) ?? gap.current_level} →{' '}
                  {gap.target_level?.toFixed?.(1) ?? gap.target_level}
                  {gap.priority ? ` · ${gap.priority}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(snapshot.top_skills || []).length > 0 && (
        <section className="card print:border print:border-black/15 print:shadow-none">
          <p className="section-label">Strongest skills</p>
          <ul className="mt-4 space-y-2">
            {snapshot.top_skills.map((skill) => (
              <li key={skill.skill_name} className="flex justify-between text-sm">
                <span>{skill.skill_name}</span>
                <span className="text-muted print:text-black/70">
                  {skill.score?.toFixed?.(1) ?? skill.score}/10 · {skill.level}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2 print:grid-cols-2">
        <div className="card print:border print:border-black/15 print:shadow-none">
          <p className="section-label">Skill freshness</p>
          <p className="mt-3 text-sm text-muted print:text-black/70">
            {fresh.fresh ?? 0} fresh · {fresh.aging ?? 0} aging · {fresh.stale ?? 0} stale
          </p>
        </div>
        <div className="card print:border print:border-black/15 print:shadow-none">
          <p className="section-label">Teach-back proofs</p>
          <p className="mt-3 text-2xl font-bold print:text-black">{snapshot.teachback_passed}</p>
          <p className="text-sm text-muted print:text-black/60">passed explanations</p>
        </div>
      </section>

      {snapshot.fork_message && (
        <section className="card print:border print:border-black/15 print:shadow-none">
          <p className="section-label">Career insight</p>
          <p className="mt-3 text-sm text-muted print:text-black/80">{snapshot.fork_message}</p>
        </section>
      )}

      <footer className="border-t border-line pt-6 text-center text-xs text-muted print:border-black/20 print:text-black/50">
        Powered by SkillSync
        {!publicView && ' · Share this link to showcase your progress'}
      </footer>
    </article>
  );
}

function ReadinessReportPrivate() {
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getLatestReadinessReport()
      .then(setReport)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const generate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const data = await createReadinessReport();
      setReport(data);
      success('Share link ready');
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Could not generate report.');
      setError(msg);
      toastError(msg);
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = async () => {
    if (!report?.share_path) return;
    const url = publicReportUrl(report.share_path);
    try {
      await navigator.clipboard.writeText(url);
      success('Link copied');
    } catch {
      toastError('Could not copy link');
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div>
          <p className="page-kicker">Portfolio</p>
          <h1 className="page-title">Readiness report</h1>
          <p className="mt-2 text-muted">Generate a shareable snapshot for mentors and interviews.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary inline-flex items-center gap-2" disabled={generating} onClick={generate}>
            <Share2 size={16} />
            {generating ? 'Generating…' : report ? 'Regenerate' : 'Generate share link'}
          </button>
          {report?.share_path && (
            <>
              <button className="btn-secondary inline-flex items-center gap-2" onClick={copyLink}>
                <Copy size={16} />
                Copy link
              </button>
              <button className="btn-secondary inline-flex items-center gap-2" onClick={() => window.print()}>
                <Printer size={16} />
                Print / PDF
              </button>
            </>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-danger print:hidden">{error}</p>}

      {report?.snapshot ? (
        <ReadinessReportView snapshot={report.snapshot} />
      ) : (
        <EmptyState
          title="No report yet"
          body="Generate a snapshot of your readiness, gaps, and learning progress."
          action={
            <button className="btn-primary" disabled={generating} onClick={generate}>
              Generate report
            </button>
          }
        />
      )}
    </div>
  );
}

function ReadinessReportPublic() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPublicReadinessReport(token)
      .then(setReport)
      .catch((err) => setError(getApiErrorMessage(err, 'Report not found.')))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <LoadingSkeleton />;
  if (error) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <EmptyState title="Report unavailable" body={error} action={<Link className="btn-primary" to="/">Go home</Link>} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg px-4 py-10 print:bg-white print:py-0">
      <ReadinessReportView snapshot={report.snapshot} publicView />
    </div>
  );
}

export { ReadinessReportPrivate, ReadinessReportPublic };
export default ReadinessReportPrivate;
