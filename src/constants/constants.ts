import { type_asset } from "@/types/schema.types"

export const TYPE_TRANSACTION = {
    IN: 1,
    OUT: 0
}

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

export const key_assets: Record<string, type_asset> = {
    expense: 'expense',
    invest: 'invest',
    save: 'save'
}

export const COLOR_APP = {
    blue: '#1a73e8',
    green: '#009900',
    yellow: '#f9ab00',
    red: '#d93025',
    gray: '#2f3030'
}

export const Colors = {
    primary: '#1a73e8',
    background: '#ffffff',
    surface: '#f5f5f5',
    text: '#1a1a1a',
    textSecondary: '#666666',
    border: '#e0e0e0',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
}

export const getColorCategory = (type: number): string => {
    let result = ''
    if (type === 1) {
        result = '#1a73e8'
    } else if (type === 2) {
        result = '#f9ab00'
    } else if (type === 3) {
        result = '#d93025'
    } else if (type === 4) {
        result = '#b90e77'
    } else if (type === 5) {
        result = '#06a101'
    } else if (type === 6) {
        result = '#2f3030'
    }else if (type === 7) {
        result = '#e0dd02'
    } else if (type === 8) {
        result = '#01ec3c'
    }
    return result
}

export const getColorTransaction = (type: number): string => {
    let result = ''
    if (type === 1) {
        result = '#b3c9e6'
    } else if (type === 2) {
        result = '#f0dcb1'
    } else if (type === 3) {
        result = '#d89f9b'
    } else if (type === 4) {
        result = '#b682a2'
    } else if (type === 5) {
        result = '#7a9779'
    } else if (type === 6) {
        result = '#9da1a1'
    }
    return result
}

export const tables_name = {
    USER: 'Users',
    ASSET: 'Assets',
    CATEGORY: 'Categories',
    TRANSACTION: 'Transactions'
}

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