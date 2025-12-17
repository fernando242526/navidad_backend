export const APP_CONSTANTS = {
  JWT: {
    ACCESS_TOKEN_COOKIE: 'access_token',
    REFRESH_TOKEN_COOKIE: 'refresh_token',
  },
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
  },
  VALIDATION: {
    MIN_TITLE_LENGTH: 3,
    MAX_TITLE_LENGTH: 500,
    MAX_DESCRIPTION_LENGTH: 2000,
    MAX_URL_LENGTH: 500,
    MIN_ORDER_INDEX: 1,
    MAX_ORDER_INDEX: 1000,
  },
};

// Tipos derivados para TypeScript
export type AppConstants = typeof APP_CONSTANTS;
export type PaginationConstants = typeof APP_CONSTANTS.PAGINATION;
export type ValidationConstants = typeof APP_CONSTANTS.VALIDATION;
