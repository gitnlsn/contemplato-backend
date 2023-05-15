/**
 * Utility to parse environment variables from process env
 */
export const env = {
  JWT_SECRET: String(process.env.JWT_SECRET),
};
