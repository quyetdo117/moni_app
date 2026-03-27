import { type_asset } from "@/types/schema.types";
import { Colors } from "./theme";

// ============================================
// TRANSACTION TYPES
// ============================================

export const TYPE_TRANSACTION = {
    IN: 1,
    OUT: 0
}

// ============================================
// EXPENSE CATEGORIES - Clean and minimal
// ============================================

export const categories_expense = [
    {
        title: 'Thu nhập',
        type: TYPE_TRANSACTION.IN
    },
    {
        title: 'Cố định',
        type: TYPE_TRANSACTION.OUT
    },
    {
        title: 'Ăn uống',
        type: TYPE_TRANSACTION.OUT
    },
    {
        title: 'Di chuyển',
        type: TYPE_TRANSACTION.OUT
    },
    {
        title: 'Cá nhân',
        type: TYPE_TRANSACTION.OUT
    },
    {
        title: 'Khác',
        type: TYPE_TRANSACTION.OUT
    },
]

export const types_expense = [
    {
        id: '1',
        title: 'Chi tiêu',
        type: TYPE_TRANSACTION.OUT
    },
    {
        id: '2',
        title: 'Thu nhập',
        type: TYPE_TRANSACTION.IN
    }
]

// ============================================
// ASSET KEYS
// ============================================

export const key_assets: Record<type_asset, type_asset> = {
    expense: 'expense',
    invest: 'invest',
    save: 'save'
}

// ============================================
// COLOR APP - Modern Minimalist palette
// ============================================

export const COLOR_APP = {
    // Primary colors
    primary: Colors.primary,
    primaryLight: Colors.primaryLight,
    secondary: Colors.secondary,

    // Semantic colors
    blue: Colors.accent,
    green: Colors.success,
    yellow: Colors.warning,
    red: Colors.error,
    gray: Colors.textSecondary,

    // Background colors
    background: Colors.background,
    surface: Colors.surface,
    surfaceElevated: Colors.surfaceElevated,

    // Text colors
    text: Colors.text,
    textSecondary: Colors.textSecondary,
    textTertiary: Colors.textTertiary,

    // Border
    border: Colors.border,
    divider: Colors.divider,
}

// ============================================
// CATEGORY COLORS - Modern muted palette
// ============================================

export const getColorCategory = (type: number): string => {
    const categoryColors: Record<number, string> = {
        1: '#4F46E5',    // Indigo - Income
        2: '#F59E0B',   // Amber - Fixed
        3: '#EF4444',   // Red - Food
        4: '#8B5CF6',   // Purple - Transport
        5: '#10B981',   // Green - Personal
        6: '#6B7280',   // Gray - Other
        7: '#F59E0B',   // Amber - Invest
        8: '#3B82F6',   // Blue - Save
    };
    return categoryColors[type] || Colors.textSecondary;
}

// ============================================
// TRANSACTION COLORS - Soft, muted tones
// ============================================

export const getColorTransaction = (type: number): string => {
    const transactionColors: Record<number, string> = {
        1: '#E0E7FF',   // Light indigo
        2: '#FEF3C7',   // Light amber
        3: '#FEE2E2',   // Light red
        4: '#F3E8FF',   // Light purple
        5: '#D1FAE5',   // Light green
        6: '#F3F4F6',   // Light gray
    };
    return transactionColors[type] || Colors.divider;
}

export const colors_chart = {
    income: '#10B981',     // Success green
    expense: '#EF4444',   // Error red
    invest: '#8B5CF6',    // Purple
    save: '#3B82F6',      // Blue
    inCircle: Colors.surface  // White/light background
};

// ============================================
// DATABASE TABLES
// ============================================

export const tables_name = {
    USER: 'Users',
    ASSET: 'Assets',
    CATEGORY: 'Categories',
    TRANSACTION: 'Transactions'
}

// ============================================
// DISPLAY TYPES
// ============================================

export const types_display = {
    move: 1,
    personal: 2,
    fixed: 3,
    food: 4,
    income: 5,
    other_expense: 6,
    invest: 7,
    save: 8
}

export const key_status = {
    active: 'active',
    lock: 'lock',
    completed: 'completed'
}

