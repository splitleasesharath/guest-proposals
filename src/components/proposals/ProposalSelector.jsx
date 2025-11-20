/**
 * ProposalSelector Component
 * Dropdown selector for switching between user's proposals
 *
 * Display format: "{guest name} - {listing name}"
 * Shows the guest who made the proposal, not the host
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
        <h2>My Proposals</h2>
        <span className="proposal-count">{proposals.length}</span>
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
