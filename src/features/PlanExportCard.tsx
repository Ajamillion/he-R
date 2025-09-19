import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { usePlan } from '../state/PlanContext';
import { buildPlanExportSnapshot } from '../state/planLogic';
import { formatDateFriendly } from '../utils/date';

type PlanExportCardProps = {
  date: string;
};

type ExportStatus = 'idle' | 'copied' | 'downloaded' | 'error';

export const PlanExportCard = ({ date }: PlanExportCardProps) => {
  const { logs, profile, pegCaps, lastSyncedAt, truth } = usePlan();
  const [status, setStatus] = useState<ExportStatus>('idle');

  const snapshot = useMemo(
    () =>
      buildPlanExportSnapshot({
        logs,
        profile,
        pegCaps,
        lastSyncedAt,
        truthVersion: truth.version
      }),
    [logs, profile, pegCaps, lastSyncedAt, truth.version]
  );

  const exportJson = useMemo(() => JSON.stringify(snapshot, null, 2), [snapshot]);

  const preview = useMemo(() => {
    const lines = exportJson.split('\n');
    const limit = 14;
    return lines.length > limit ? `${lines.slice(0, limit).join('\n')}\n…` : exportJson;
  }, [exportJson]);

  useEffect(() => {
    if (status === 'idle' || typeof window === 'undefined') {
      return undefined;
    }
    const timer = window.setTimeout(() => setStatus('idle'), 4000);
    return () => window.clearTimeout(timer);
  }, [status]);

  const handleCopy = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      setStatus('error');
      return;
    }
    try {
      await navigator.clipboard.writeText(exportJson);
      setStatus('copied');
    } catch (error) {
      setStatus('error');
    }
  };

  const handleDownload = () => {
    if (typeof window === 'undefined') {
      setStatus('error');
      return;
    }
    try {
      const blob = new Blob([exportJson], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `her-plan-${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setStatus('downloaded');
    } catch (error) {
      setStatus('error');
    }
  };

  let statusMessage = '';
  if (status === 'copied') {
    statusMessage = 'Copied export JSON to clipboard.';
  } else if (status === 'downloaded') {
    statusMessage = 'Download started—check your browser downloads tray.';
  } else if (status === 'error') {
    statusMessage = 'Unable to access clipboard or downloads in this environment.';
  }

  const lastSyncedFriendly = lastSyncedAt ? formatDateFriendly(lastSyncedAt.slice(0, 10)) : undefined;

  return (
    <Card title="Plan export" tag="Share or archive" className="span-4">
      <p className="helper-text">
        Generate a JSON snapshot for {snapshot.logs.length} logged day{snapshot.logs.length === 1 ? '' : 's'}.
        File name uses {date}.
      </p>
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-card__label">Hydration entries</span>
          <span className="stat-card__value">{snapshot.totals.hydrationEntries}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Stool entries</span>
          <span className="stat-card__value">{snapshot.totals.stoolEntries}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Medication entries</span>
          <span className="stat-card__value">{snapshot.totals.medicationEntries}</span>
        </div>
      </div>
      <div className="export-actions">
        <button className="button" type="button" onClick={handleDownload}>
          Download JSON
        </button>
        <button className="button button--ghost" type="button" onClick={handleCopy}>
          Copy JSON
        </button>
      </div>
      {statusMessage ? <p className="helper-text export-status">{statusMessage}</p> : null}
      <pre className="code-block" aria-label="Plan export preview">
        {preview}
      </pre>
      <p className="helper-text">
        Snapshot uses truth source {truth.version}.{' '}
        {lastSyncedFriendly ? `Last simulated sync ${lastSyncedFriendly}.` : 'No cloud sync yet.'}
      </p>
    </Card>
  );
};
