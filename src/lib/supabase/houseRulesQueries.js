/**
 * House Rules Queries Module
 *
 * This module handles fetching and resolving house rules from the database.
 * It transforms raw JSONB arrays of rule IDs into complete rule objects
 * with names and icons.
 *
 * Database Table: zat_features_houserule
 * Fields:
 * - _id (text) - Primary key
 * - Name (text) - Rule name (e.g., "No Smoking Inside")
 * - Icon (text) - URL to icon image
 */

import { supabase } from './supabase.js';

/**
 * Fetch house rule details by IDs
 * @param {Array<string>} ruleIds - Array of house rule IDs from JSONB
 * @returns {Promise<Array<Object>>} Array of house rule objects with id, name, icon
 */
export async function fetchHouseRulesByIds(ruleIds) {
  // Handle empty or invalid input
  if (!ruleIds || !Array.isArray(ruleIds) || ruleIds.length === 0) {
    return [];
  }

  // Filter out null/undefined values and ensure strings
  const validIds = ruleIds.filter(id => id != null && String(id).trim() !== '');

  if (validIds.length === 0) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('zat_features_houserule')
      .select('_id, "Name", "Icon"')
      .in('_id', validIds);

    if (error) {
      console.error('❌ Error fetching house rules:', error);
      return [];
    }

    // Transform to consistent camelCase format
    return (data || []).map(rule => ({
      id: rule._id,
      name: rule.Name || 'Unknown Rule',
      icon: rule.Icon || null
    }));
  } catch (err) {
    console.error('❌ Exception fetching house rules:', err);
    return [];
  }
}

/**
 * Resolve house rules for a proposal
 * Priority order:
 * 1. Counteroffer house rules (if counteroffer happened)
 * 2. Original proposal house rules
 * 3. Listing house rules
 *
 * @param {Object} proposal - Proposal object with nested listing data
 * @returns {Promise<Array<Object>>} Resolved house rule objects
 */
export async function resolveProposalHouseRules(proposal) {
  if (!proposal) {
    return [];
  }

  let ruleIds = [];

  // Priority 1: Counteroffer house rules
  if (proposal['counter offer happened'] && proposal['hc house rules']) {
    ruleIds = proposal['hc house rules'];
  }
  // Priority 2: Original proposal house rules
  else if (proposal['House Rules']) {
    ruleIds = proposal['House Rules'];
  }
  // Priority 3: Listing house rules
  else if (proposal.listing?.['Features - House Rules']) {
    ruleIds = proposal.listing['Features - House Rules'];
  }

  // If no rules at any level, return empty array
  if (!ruleIds || ruleIds.length === 0) {
    return [];
  }

  // Fetch and return rule details
  return await fetchHouseRulesByIds(ruleIds);
}

/**
 * Resolve house rules for a listing
 * @param {Object} listing - Listing object
 * @returns {Promise<Array<Object>>} Resolved house rule objects
 */
export async function resolveListingHouseRules(listing) {
  if (!listing || !listing['Features - House Rules']) {
    return [];
  }

  return await fetchHouseRulesByIds(listing['Features - House Rules']);
}

/**
 * Compare house rules between original proposal and counteroffer
 * @param {Object} proposal - Proposal object
 * @returns {Promise<Object>} Comparison object with original, counteroffer, added, removed
 */
export async function compareHouseRules(proposal) {
  if (!proposal || !proposal['counter offer happened']) {
    return {
      original: [],
      counteroffer: [],
      added: [],
      removed: [],
      hasChanges: false
    };
  }

  // Fetch both sets of rules
  const originalIds = proposal['House Rules'] || [];
  const counterofferIds = proposal['hc house rules'] || [];

  const [originalRules, counterofferRules] = await Promise.all([
    fetchHouseRulesByIds(originalIds),
    fetchHouseRulesByIds(counterofferIds)
  ]);

  // Find added and removed rules
  const originalIdSet = new Set(originalIds);
  const counterofferIdSet = new Set(counterofferIds);

  const addedIds = counterofferIds.filter(id => !originalIdSet.has(id));
  const removedIds = originalIds.filter(id => !counterofferIdSet.has(id));

  const [addedRules, removedRules] = await Promise.all([
    fetchHouseRulesByIds(addedIds),
    fetchHouseRulesByIds(removedIds)
  ]);

  return {
    original: originalRules,
    counteroffer: counterofferRules,
    added: addedRules,
    removed: removedRules,
    hasChanges: addedIds.length > 0 || removedIds.length > 0
  };
}

/**
 * Fetch all available house rules (for dropdown/selection)
 * @returns {Promise<Array<Object>>} All house rules in the system
 */
export async function fetchAllHouseRules() {
  try {
    const { data, error } = await supabase
      .from('zat_features_houserule')
      .select('_id, "Name", "Icon"')
      .order('Name', { ascending: true });

    if (error) {
      console.error('❌ Error fetching all house rules:', error);
      return [];
    }

    return (data || []).map(rule => ({
      id: rule._id,
      name: rule.Name || 'Unknown Rule',
      icon: rule.Icon || null
    }));
  } catch (err) {
    console.error('❌ Exception fetching all house rules:', err);
    return [];
  }
}

/**
 * Group house rules by category (if category data exists)
 * Note: Current schema doesn't have categories, but this is future-ready
 * @param {Array<Object>} rules - Array of house rule objects
 * @returns {Object} Rules grouped by category
 */
export function groupHouseRulesByCategory(rules) {
  if (!rules || rules.length === 0) {
    return {};
  }

  // For now, return a single "All Rules" category
  // This can be enhanced when category data is added to the schema
  return {
    'All Rules': rules
  };
}

/**
 * Format house rules for display
 * @param {Array<Object>} rules - Array of house rule objects
 * @returns {Array<Object>} Formatted rules with display properties
 */
export function formatHouseRulesForDisplay(rules) {
  if (!rules || rules.length === 0) {
    return [];
  }

  return rules.map((rule, index) => ({
    ...rule,
    index: index + 1,
    displayName: rule.name,
    hasIcon: Boolean(rule.icon)
  }));
}
