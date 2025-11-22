/**
 * Navigation Workflow Module
 *
 * Implements navigation workflows from Bubble.io:
 * - crkhG5: Navigate to Search page
 * - crkgi5: Navigate to Messaging page
 * - crkeo5: Navigate to View-split-lease or House-manual
 * - ctdDG: Dropdown change navigation
 * - crpMU2: Navigate to Initial Payment page
 * - crkca5: Navigate to View-split-lease listing page
 *
 * Handles all page navigation and URL generation for the guest proposals page.
 */

/**
 * Navigate to search page
 * Implements workflow crkhG5: "B: Explore Rentals is clicked"
 *
 * @param {Object} options - Optional search parameters
 */
export function navigateToSearch(options = {}) {
  const searchParams = new URLSearchParams();

  // Add any search filters if provided
  if (options.borough) {
    searchParams.set('borough', options.borough);
  }
  if (options.neighborhood) {
    searchParams.set('neighborhood', options.neighborhood);
  }
  if (options.moveInDate) {
    searchParams.set('moveIn', options.moveInDate);
  }

  const url = searchParams.toString()
    ? `/search?${searchParams.toString()}`
    : '/search';

  console.log('🔍 Navigating to search:', url);
  window.location.href = url;
}

/**
 * Navigate to messaging page with host
 * Implements workflow crkgi5: "B: Guest Info Awaiting Guest Response copy is clicked"
 *
 * @param {string} hostId - Host user ID
 * @param {string} proposalId - Proposal ID for context
 * @param {Object} options - Additional messaging options
 */
export function navigateToMessaging(hostId, proposalId, options = {}) {
  if (!hostId) {
    console.error('❌ Host ID is required for messaging navigation');
    return;
  }

  const params = new URLSearchParams({
    recipient: hostId,
    context: 'proposal'
  });

  if (proposalId) {
    params.set('proposalId', proposalId);
  }

  if (options.subject) {
    params.set('subject', options.subject);
  }

  if (options.template) {
    params.set('template', options.template);
  }

  const url = `/messaging?${params.toString()}`;
  console.log('💬 Navigating to messaging:', url);
  window.location.href = url;
}

/**
 * Navigate to listing or house manual based on payment status
 * Implements workflow crkeo5: "B: View Listing is clicked"
 *
 * Decision logic:
 * - If initial payment submitted → Navigate to house-manual (guest has access)
 * - Otherwise → Navigate to view-split-lease (public listing view)
 *
 * @param {Object} proposal - Proposal object with status and listing info
 */
export function navigateToListing(proposal) {
  if (!proposal || !proposal.Listing) {
    console.error('❌ Invalid proposal data for navigation');
    return;
  }

  const status = proposal.Status || proposal.status;
  const listingId = proposal.Listing;

  // Check if lease is activated (initial payment submitted)
  const initialPaymentSubmitted =
    status === 'Initial Payment Submitted / Lease activated';

  if (initialPaymentSubmitted) {
    // Guest has paid - show house manual
    console.log('🏠 Navigating to house manual (payment submitted)');
    window.location.href = `/house-manual/${listingId}`;
  } else {
    // Guest hasn't paid yet - show public listing
    console.log('🏠 Navigating to listing (no payment yet)');
    window.location.href = `/view-split-lease/${listingId}`;
  }
}

/**
 * Navigate to view-split-lease page directly
 * Implements workflow crkca5: "T: Parent group's Listing is clicked"
 *
 * @param {string} listingId - Listing ID
 */
export function navigateToViewSplitLease(listingId) {
  if (!listingId) {
    console.error('❌ Listing ID is required');
    return;
  }

  console.log('🏠 Navigating to view-split-lease:', listingId);
  window.location.href = `/view-split-lease/${listingId}`;
}

/**
 * Navigate to house manual page
 *
 * @param {string} listingId - Listing ID
 */
export function navigateToHouseManual(listingId) {
  if (!listingId) {
    console.error('❌ Listing ID is required');
    return;
  }

  console.log('📖 Navigating to house manual:', listingId);
  window.location.href = `/house-manual/${listingId}`;
}

/**
 * Navigate to initial payment page
 * Implements workflow crpMU2: "T: Initial Payment Original Terms(title) is clicked"
 *
 * @param {string} proposalId - Proposal ID
 * @param {string} termsType - 'original' or 'counteroffer'
 */
export function navigateToInitialPayment(proposalId, termsType = 'original') {
  if (!proposalId) {
    console.error('❌ Proposal ID is required');
    return;
  }

  const params = new URLSearchParams({
    proposal: proposalId,
    terms: termsType
  });

  const url = `/initial-payment?${params.toString()}`;
  console.log('💳 Navigating to initial payment:', url);
  window.location.href = url;
}

/**
 * Navigate to rental application page
 * Used by "Submit Rental Application" button
 *
 * @param {string} proposalId - Proposal ID
 */
export function navigateToRentalApplication(proposalId) {
  if (!proposalId) {
    console.error('❌ Proposal ID is required');
    return;
  }

  const url = `/rental-application?proposal=${proposalId}`;
  console.log('📋 Navigating to rental application:', url);
  window.location.href = url;
}

/**
 * Navigate to document review page
 * Used by "Review Documents" button
 *
 * @param {string} proposalId - Proposal ID
 * @param {string} documentType - Optional document type filter
 */
export function navigateToDocumentReview(proposalId, documentType = null) {
  if (!proposalId) {
    console.error('❌ Proposal ID is required');
    return;
  }

  const params = new URLSearchParams({ proposal: proposalId });

  if (documentType) {
    params.set('type', documentType);
  }

  const url = `/review-documents?${params.toString()}`;
  console.log('📄 Navigating to document review:', url);
  window.location.href = url;
}

/**
 * Navigate to lease documents page
 * Used by "Review Lease Documents" button
 *
 * @param {string} proposalId - Proposal ID
 */
export function navigateToLeaseDocuments(proposalId) {
  if (!proposalId) {
    console.error('❌ Proposal ID is required');
    return;
  }

  const url = `/lease-documents?proposal=${proposalId}`;
  console.log('📜 Navigating to lease documents:', url);
  window.location.href = url;
}

/**
 * Navigate to identity verification page
 * Used by "Verify Identity" button
 *
 * @param {Object} options - Verification options
 */
export function navigateToIdentityVerification(options = {}) {
  const params = new URLSearchParams();

  if (options.returnUrl) {
    params.set('return', options.returnUrl);
  }

  if (options.verificationType) {
    params.set('type', options.verificationType);
  }

  const url = params.toString()
    ? `/identity-verification?${params.toString()}`
    : '/identity-verification';

  console.log('🔐 Navigating to identity verification:', url);
  window.location.href = url;
}

/**
 * Navigate to current guest proposals page with specific proposal selected
 * Implements workflow ctdDG: "D: Choose Proposal's value is changed"
 *
 * @param {string} userId - User ID
 * @param {string} proposalId - Proposal ID to select
 * @param {boolean} replace - Whether to replace history instead of push
 */
export function navigateToProposal(userId, proposalId, replace = false) {
  if (!userId) {
    console.error('❌ User ID is required');
    return;
  }

  const baseUrl = `/guest-proposals/${userId}`;
  const url = proposalId
    ? `${baseUrl}?proposal=${proposalId}`
    : baseUrl;

  console.log('📋 Navigating to proposal:', url);

  if (replace) {
    window.history.replaceState({}, '', url);
  } else {
    window.location.href = url;
  }
}

/**
 * Update URL to reflect selected proposal without full page reload
 * Useful for dropdown selection changes
 *
 * @param {string} userId - User ID
 * @param {string} proposalId - Proposal ID to select
 */
export function updateProposalInUrl(userId, proposalId) {
  const baseUrl = `/guest-proposals/${userId}`;
  const url = proposalId
    ? `${baseUrl}?proposal=${proposalId}`
    : baseUrl;

  console.log('🔄 Updating URL to:', url);
  window.history.pushState({ proposalId }, '', url);
}

/**
 * Navigate to guest leases page
 * Used when guest wants to view active leases
 */
export function navigateToGuestLeases() {
  console.log('🏢 Navigating to guest leases');
  window.location.href = '/guest-leases';
}

/**
 * Navigate to guest dashboard
 * General dashboard navigation
 */
export function navigateToGuestDashboard() {
  console.log('🏠 Navigating to guest dashboard');
  window.location.href = '/guest-dashboard';
}

/**
 * Navigate to help/support page
 *
 * @param {string} topic - Optional help topic
 */
export function navigateToHelp(topic = null) {
  const url = topic
    ? `/help?topic=${encodeURIComponent(topic)}`
    : '/help';

  console.log('❓ Navigating to help:', url);
  window.location.href = url;
}

/**
 * Navigate back to previous page
 * Safe navigation with fallback to dashboard
 */
export function navigateBack() {
  if (window.history.length > 1) {
    console.log('← Navigating back');
    window.history.back();
  } else {
    console.log('← No history, going to dashboard');
    navigateToGuestDashboard();
  }
}

/**
 * Open external link in new tab
 *
 * @param {string} url - URL to open
 * @param {string} context - Context for logging (e.g., 'listing', 'support')
 */
export function openExternalLink(url, context = 'link') {
  if (!url) {
    console.error('❌ URL is required');
    return;
  }

  console.log(`🔗 Opening external ${context}:`, url);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Generate deep link to specific proposal
 * Useful for sharing or bookmarking
 *
 * @param {string} userId - User ID
 * @param {string} proposalId - Proposal ID
 * @returns {string} Full URL to proposal
 */
export function generateProposalDeepLink(userId, proposalId) {
  const baseUrl = window.location.origin;
  return `${baseUrl}/guest-proposals/${userId}?proposal=${proposalId}`;
}

/**
 * Copy proposal link to clipboard
 *
 * @param {string} userId - User ID
 * @param {string} proposalId - Proposal ID
 * @param {Function} onSuccess - Callback on successful copy
 * @param {Function} onError - Callback on error
 */
export function copyProposalLinkToClipboard(userId, proposalId, onSuccess, onError) {
  const link = generateProposalDeepLink(userId, proposalId);

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(link)
      .then(() => {
        console.log('✅ Proposal link copied to clipboard');
        if (onSuccess) {
          onSuccess(link);
        }
      })
      .catch((err) => {
        console.error('❌ Failed to copy link:', err);
        if (onError) {
          onError(err);
        }
      });
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = link;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand('copy');
      console.log('✅ Proposal link copied to clipboard (fallback)');
      if (onSuccess) {
        onSuccess(link);
      }
    } catch (err) {
      console.error('❌ Failed to copy link (fallback):', err);
      if (onError) {
        onError(err);
      }
    } finally {
      document.body.removeChild(textArea);
    }
  }
}
