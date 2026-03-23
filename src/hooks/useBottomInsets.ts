import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing } from '../constants/theme';

/**
 * Hook to get bottom insets with minimum padding
 * Ensures bottom padding is at least Spacing.md
 */
export const useBottomInsets = () => {
    const insets = useSafeAreaInsets();

    const insets_bottom = insets.bottom < Spacing.md
        ? insets.bottom + Spacing.md
        : insets.bottom;

    const insets_padding = insets_bottom + 60;

    return {
        insets_bottom,
        bottom: insets.bottom,
        insets_padding
    };
};
