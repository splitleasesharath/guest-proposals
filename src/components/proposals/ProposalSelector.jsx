/**
 * ProposalSelector Component
 * Dropdown selector for switching between user's proposals
 *
 * Display format: "{host name} - {listing name}"
 * Shows the host who owns the listing, allowing guests to identify proposals by host
 */

import { getProposalDisplayText } from '../../lib/supabase/dataTransformers.js';

export default function ProposalSelector({
  proposals,
  selectedProposalId,
  onSelect
}) {
  return (
    <div className="proposal-selector">
      <div className="selector-header">
        <h2>My Proposals ({proposals.length})</h2>
      </div>

      <select
        className="proposal-dropdown"
        value={selectedProposalId || ''}
        onChange={(e) => onSelect(e.target.value)}
      >
        {proposals.map(proposal => (
          <option
            key={proposal.id}
            value={proposal.id}
          >
            {getProposalDisplayText(proposal)}
          </option>
        ))}
      </select>
    </div>
  );
}
