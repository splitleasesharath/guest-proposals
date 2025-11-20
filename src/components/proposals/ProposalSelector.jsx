/**
 * ProposalSelector Component
 * Dropdown selector for switching between user's proposals
 *
 * Display format: "{host name} - {listing name}"
 */

import { getProposalDisplayText } from '../../lib/supabase/dataTransformers.js';

export default function ProposalSelector({
  proposals,
  selectedProposalId,
  onSelect
}) {
  // Generate dropdown option text: "Host - Listing Name"
  function getOptionText(proposal) {
    const hostName = proposal.host?.firstName;
    const listingName = proposal.listing?.name;
    return `${hostName} - ${listingName}`;
  }

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
            {getOptionText(proposal)}
          </option>
        ))}
      </select>
    </div>
  );
}
