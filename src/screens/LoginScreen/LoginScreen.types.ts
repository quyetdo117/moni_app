export interface BoxRef<T> {
    getDataForm: () => T | undefined
}

export interface LoginForm {
    email: string;
    password: string;
}

export interface RegisterForm extends LoginForm {
    name: string;
    rePassword: string;
}