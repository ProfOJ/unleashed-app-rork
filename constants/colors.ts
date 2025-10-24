export const colors = {
  primary: '#0B1C45',
  secondary: '#E3342F',
  accent: '#FFD700',
  white: '#FFFFFF',
  background: '#F8F9FA',
  text: {
    primary: '#0B1C45',
    secondary: '#6B7280',
    light: '#9CA3AF',
  },
  border: '#E5E7EB',
  success: '#10B981',
  error: '#EF4444',
} as const;

export default {
  light: {
    text: colors.text.primary,
    background: colors.white,
    tint: colors.primary,
    tabIconDefault: '#ccc',
    tabIconSelected: colors.primary,
  },
};
