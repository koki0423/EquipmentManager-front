// 画面の状態を定義
export const SCREENS = {
  TOP: 'top',
  REGISTER_FORM: 'register_form',
  REGISTER_CONFIRM: 'register_confirm',
  REGISTER_EXECUTE: 'register_execute',
  COMPLETE: 'complete',
  DELETE_ASSETS: 'DeleteAssetScreen',
  ASSET_LIST: 'asset_list',
  LEND_LIST: 'lend_list',
};

// 初期フォームデータ
export const initialFormData = {
  type: 'required', // 'required' (区別が必要) or 'not_required' (不必要)
  name: '',
  quantity: 1,
  genre: '',
  remarks: '',
};