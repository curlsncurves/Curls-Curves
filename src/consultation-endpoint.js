const candidate = import.meta.env.VITE_CONSULTATION_SCRIPT_URL?.trim() || '';
export const consultationEndpoint = /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(candidate) ? candidate : '';
