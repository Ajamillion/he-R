import { formatDistanceToNow } from 'date-fns';
import { usePlan } from '../state/PlanContext';

export const CloudSyncBanner = () => {
  const { cloudState, syncWithCloud, lastSyncedAt } = usePlan();
  const syncing = cloudState === 'syncing';
  const statusLabel = syncing
    ? 'Syncing…'
    : cloudState === 'success'
      ? 'Synced'
      : cloudState === 'error'
        ? 'Sync error'
        : 'Idle';
  const meta = lastSyncedAt
    ? `Last synced ${formatDistanceToNow(new Date(lastSyncedAt), { addSuffix: true })}`
    : 'Not yet synced';

  return (
    <div className="banner">
      <div>
        <p className="banner__title">Cloud status: {statusLabel}</p>
        <p className="banner__meta">{meta}</p>
      </div>
      <button className="button" type="button" disabled={syncing} onClick={syncWithCloud}>
        {syncing ? 'Syncing…' : 'Sync now'}
      </button>
    </div>
  );
};
