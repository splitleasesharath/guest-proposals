// App-wide constants for Guest Proposals Page

export const SIGNUP_LOGIN_URL = '/signup-login.html';
export const SEARCH_URL = '/search.html';
export const REFERRAL_API_ENDPOINT = '/api/referrals';

export const AUTH_STORAGE_KEYS = {
  TOKEN: 'sl_auth_token',
  USER_TYPE: 'sl_user_type',
  USER_DATA: 'sl_user_data'
};

export const PROGRESS_STAGES = [
  { id: 1, label: 'Proposal Submitted' },
  { id: 2, label: 'Rental App Submitted' },
  { id: 3, label: 'Host Review' },
  { id: 4, label: 'Review Documents' },
  { id: 5, label: 'Lease Documents' },
  { id: 6, label: 'Initial Payment' }
];

export const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
