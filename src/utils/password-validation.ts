// Utility functions for password validation

export const isNumber = (value: string): boolean => {
  return /\d/.test(value);
};

export const isLowercaseChar = (value: string): boolean => {
  return /[a-z]/.test(value);
};

export const isUppercaseChar = (value: string): boolean => {
  return /[A-Z]/.test(value);
};

export const isSpecialChar = (value: string): boolean => {
  return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
};

export const minLength = (value: string, length: number): boolean => {
  return value.length >= length;
};
