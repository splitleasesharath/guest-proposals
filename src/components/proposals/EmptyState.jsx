/**
 * EmptyState Component
 * Displays when user has no proposals
 */

export default function EmptyState({ userName }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">📋</div>
      <h2>No Proposals Yet</h2>
      <p>
        {userName ? `${userName}, you` : 'You'} don't have any proposals at the moment.
      </p>
      <p className="empty-subtext">
        Proposals will appear here once you've submitted interest in a listing.
      </p>
    </div>
  );
}
