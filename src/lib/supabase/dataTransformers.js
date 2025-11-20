/**
 * Data Transformation Utilities
 * Transforms Bubble.io data structure to cleaner, more usable format
 *
 * Handles:
 * - Field name normalization (removes spaces, special characters)
 * - Nested object flattening
 * - Type conversions
 * - Default values for missing data
 */

/**
 * Transform user data from Bubble.io format
 *
 * @param {Object} rawUser - Raw user object from Supabase
 * @returns {Object} Transformed user object
 */
export function transformUserData(rawUser) {
  if (!rawUser) return null;

  return {
    id: rawUser._id,
    firstName: rawUser['Name - First'] || '',
    lastName: rawUser['Name - Last'] || '',
    fullName: rawUser['Name - Full'] || '',
    profilePhoto: rawUser['Profile Photo'] || null,
    proposalsList: rawUser['Proposals List'] || []
  };
}

/**
 * Transform listing data from Bubble.io format
 *
 * @param {Object} rawListing - Raw listing object from Supabase
 * @returns {Object} Transformed listing object
 */
export function transformListingData(rawListing) {
  if (!rawListing) return null;

  return {
    id: rawListing._id,
    name: rawListing.Name || 'Unknown Listing',
    description: rawListing.Description || '',
    address: rawListing['Location - Address'] || {},
    borough: rawListing['Location - Borough'] || '',
    hood: rawListing['Location - Hood'] || '',
    photos: rawListing['Features - Photos'] || [],
    houseRules: rawListing['Features - House Rules'] || '',
    checkInTime: rawListing['NEW Date Check-in Time'] || '',
    checkOutTime: rawListing['NEW Date Check-out Time'] || ''
  };
}

/**
 * Transform host data from Bubble.io format
 *
 * @param {Object} rawHost - Raw host object from Supabase
 * @returns {Object} Transformed host object
 */
export function transformHostData(rawHost) {
  if (!rawHost) return null;

  return {
    id: rawHost._id,
    firstName: rawHost['Name - First'] || 'Unknown',
    lastName: rawHost['Name - Last'] || '',
    fullName: rawHost['Name - Full'] || 'Unknown Host',
    profilePhoto: rawHost['Profile Photo'] || null,
    bio: rawHost['About Me / Bio'] || '',
    linkedInVerified: rawHost['Verify - Linked In ID'] || false,
    phoneVerified: rawHost['Verify - Phone'] || false,
    userVerified: rawHost['user verified?'] || false
  };
}

/**
 * Transform virtual meeting data from Bubble.io format
 *
 * @param {Object} rawVirtualMeeting - Raw virtual meeting object from Supabase
 * @returns {Object} Transformed virtual meeting object
 */
export function transformVirtualMeetingData(rawVirtualMeeting) {
  if (!rawVirtualMeeting) return null;

  return {
    id: rawVirtualMeeting.id,
    bookedDate: rawVirtualMeeting.booked_date || null,
    confirmedBySplitlease: rawVirtualMeeting.confirmed_by_splitlease || false,
    meetingLink: rawVirtualMeeting.meeting_link || null,
    meetingDeclined: rawVirtualMeeting.meeting_declined || false
  };
}

/**
 * Transform complete proposal data from Bubble.io format
 * Includes nested transformations for listing, host, and virtual meeting
 *
 * @param {Object} rawProposal - Raw proposal object from Supabase
 * @returns {Object} Transformed proposal object
 */
export function transformProposalData(rawProposal) {
  if (!rawProposal) return null;

  // Extract nested data
  const rawListing = rawProposal.listing;
  const rawHost = rawListing?.host;
  const rawVirtualMeeting = rawProposal.virtual_meeting;

  return {
    id: rawProposal._id,
    status: rawProposal.Status || 'unknown',
    deleted: rawProposal.Deleted || false,
    daysSelected: rawProposal['Days Selected'] || [],
    nightsSelected: rawProposal['Nights Selected (Nights list)'] || [],
    reservationWeeks: rawProposal['Reservation Span (Weeks)'] || 0,
    nightsPerWeek: rawProposal['nights per week (num)'] || 0,
    checkInDay: rawProposal['check in day'] || '',
    checkOutDay: rawProposal['check out day'] || '',
    moveInStart: rawProposal['Move in range start'] || '',
    moveInEnd: rawProposal['Move in range end'] || '',
    totalPrice: rawProposal['Total Price for Reservation (guest)'] || 0,
    nightlyPrice: rawProposal['proposal nightly price'] || 0,
    cleaningFee: rawProposal['cleaning fee'] || 0,
    damageDeposit: rawProposal['damage deposit'] || 0,
    counterOfferHappened: rawProposal['counter offer happened'] || false,
    hcDaysSelected: rawProposal['hc days selected'] || [],
    hcReservationWeeks: rawProposal['hc reservation span (weeks)'] || 0,
    hcTotalPrice: rawProposal['hc total price'] || 0,
    hcNightlyPrice: rawProposal['hc nightly price'] || 0,
    createdDate: rawProposal['Created Date'] || null,
    modifiedDate: rawProposal['Modified Date'] || null,
    aboutYourself: rawProposal.about_yourself || '',
    specialNeeds: rawProposal.special_needs || '',
    reasonForCancellation: rawProposal['reason for cancellation'] || null,
    proposalStage: rawProposal['Proposal Stage'] || null,
    rentalApplicationId: rawProposal['rental application'] || null,
    virtualMeetingId: rawProposal['virtual meeting'] || null,

    // Nested transformed data
    listing: transformListingData(rawListing),
    host: transformHostData(rawHost),
    virtualMeeting: transformVirtualMeetingData(rawVirtualMeeting)
  };
}

/**
 * Get display text for proposal in dropdown
 * Format: "{host name} - {listing name}"
 *
 * @param {Object} proposal - Transformed proposal object
 * @returns {string} Display text for dropdown option
 */
export function getProposalDisplayText(proposal) {
  if (!proposal) return 'Unknown Proposal';

  const hostName = proposal.host?.firstName || 'Unknown Host';
  const listingName = proposal.listing?.name || 'Unknown Listing';

  return `${hostName} - ${listingName}`;
}

/**
 * Format price for display
 *
 * @param {number} price - Price value
 * @param {boolean} includeCents - Whether to include cents
 * @returns {string} Formatted price string
 */
export function formatPrice(price, includeCents = true) {
  if (price === null || price === undefined) return '$0';

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: includeCents ? 2 : 0,
    maximumFractionDigits: includeCents ? 2 : 0
  });

  return formatter.format(price);
}

/**
 * Format date for display
 *
 * @param {string|Date} date - Date value
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '';

  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
