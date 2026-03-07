
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

export const key_assets = {
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