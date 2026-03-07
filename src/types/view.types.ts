
export interface PopupRef<T = any>{
    onShow: (data?: T, isEdit?: boolean) => void;
    onClose: () => void;
    snapTo?: (index: number, data?: T) => void;
}

export interface RefreshableRef {
  onRefresh: (id?: string, category_type?: number) => void
}
