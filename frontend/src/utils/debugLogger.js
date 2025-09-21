// Centralized debug logger utility
let DEBUG_ENABLED = true;

export const setDebugEnabled = (enabled) => {
  DEBUG_ENABLED = enabled;
};

export function debugLog({ message, context = '', component = '', func = '' }) {
  if (!DEBUG_ENABLED) return;
  const timestamp = new Date().toISOString();
  const parts = [timestamp];
  if (component) parts.push(`[${component}]`);
  if (func) parts.push(`[${func}]`);
  if (context) parts.push(`[${context}]`);
  parts.push(message);
  // eslint-disable-next-line no-console
  console.log(parts.join(' '));
}
