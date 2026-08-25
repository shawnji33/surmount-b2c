export type PasswordRequirement = {
  id: string;
  label: string;
  test: (password: string) => boolean;
};

// Mirrors the sign-up password rules in LoginPage so the whole app validates identically.
export const PASSWORD_REQS: PasswordRequirement[] = [
  { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'uppercase', label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { id: 'number', label: 'One number', test: (p) => /[0-9]/.test(p) },
  { id: 'special', label: 'One special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export const passwordMeetsAll = (p: string) => PASSWORD_REQS.every((r) => r.test(p));

export const unmetRequirements = (p: string) => PASSWORD_REQS.filter((r) => !r.test(p));
