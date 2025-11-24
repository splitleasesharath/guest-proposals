/**
 * ProposalsIsland - Main Interactive Component
 * Implements the complete user-centric proposal flow using Method 1
 *
 * Flow (Method 1 - Recommended):
 * 1. Extract user ID from URL path
 * 2. Fetch user with "Proposals List" JSONB array
 * 3. Extract proposal IDs from array
 * 4. Fetch all proposals with joins
 * 5. Display in dropdown selector
 * 6. Show selected proposal in card
 */

import { useState, useEffect } from 'react';
import { fetchUserProposalsFromUrl } from '../../lib/supabase/userProposalQueries.js';
import { updateUrlWithProposal } from '../../lib/utils/urlParser.js';
import { transformProposalData } from '../../lib/supabase/dataTransformers.js';
import ProposalSelector from '../../components/proposals/ProposalSelector.jsx';
import ProposalCard from '../../components/proposals/ProposalCard.jsx';
import VirtualMeetingsSection from '../../components/proposals/VirtualMeetingsSection.jsx';
import FloatingProposalSummary from '../../components/proposals/FloatingProposalSummary.jsx';
import LoadingState from '../../components/proposals/LoadingState.jsx';
import ErrorState from '../../components/proposals/ErrorState.jsx';
import EmptyState from '../../components/proposals/EmptyState.jsx';

export default function ProposalsIsland() {
  const [currentUser, setCurrentUser] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data on mount
  useEffect(() => {
    loadProposals();
  }, []);

  async function loadProposals() {
    try {
      setLoading(true);
      setError(null);

      // This fetches everything in one go using Method 1:
      // 1. User from URL path
      // 2. User's "Proposals List" JSONB array
      // 3. Full proposal data with joins
      // 4. Preselected proposal (if in query param)
      const { user, proposals: rawProposals, selectedProposal: rawSelected } =
        await fetchUserProposalsFromUrl();

      // Transform proposals for cleaner data structure
      const transformedProposals = rawProposals.map(transformProposalData);
      const transformedSelected = rawSelected ? transformProposalData(rawSelected) : null;

      setCurrentUser(user);
      setProposals(transformedProposals);
      setSelectedProposal(transformedSelected);

      console.log('✅ Loaded proposals for user:', user['Name - First'] || user['Name - Full']);
      console.log('📋 Proposal count:', transformedProposals.length);
      console.log('👆 Selected proposal:', transformedSelected?.id);

    } catch (err) {
      console.error('❌ Error loading proposals:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  function handleProposalSelect(proposalId) {
    const proposal = proposals.find(p => p.id === proposalId);

    if (proposal) {
      setSelectedProposal(proposal);

      // Update URL without page reload
      updateUrlWithProposal(currentUser._id, proposalId);

      console.log('✅ Switched to proposal:', proposalId);
    }
  }


  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={loadProposals} />;
  }

  // Empty state (no proposals)
  if (proposals.length === 0) {
    return <EmptyState userName={currentUser?.['Name - First']} />;
  }

  // Main view
  return (
    <div className="proposals-page">
      {/* Proposal Selector Dropdown */}
      <ProposalSelector
        proposals={proposals}
        selectedProposalId={selectedProposal?.id}
        onSelect={handleProposalSelect}
      />

      {/* Selected Proposal Card */}
      {selectedProposal && (
        <ProposalCard
          proposal={selectedProposal}
          currentUserId={currentUser?._id}
          onUpdate={loadProposals}  // Refresh after actions
        />
      )}

      {/* Virtual Meetings Section */}
      {selectedProposal && (
        <VirtualMeetingsSection
          proposal={selectedProposal}
          onUpdate={loadProposals}
        />
      )}

      {/* Floating Proposal Summary - Desktop only */}
      {selectedProposal && (
        <FloatingProposalSummary proposal={selectedProposal} />
      )}
    </div>
  );
}
