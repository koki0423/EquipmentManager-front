import React, { useState, useEffect, use } from 'react';
import { Container, Box } from '@mui/material';
import { Toaster } from 'react-hot-toast';

// 定数とコンポーネントをインポート
import { SCREENS, initialFormData } from './constants';
import TopScreen from './components/TopScreen';// トップ画面(出席か資産管理画面かを選択する画面)
import AuthScreen from './components/AuthScreen';//学生証読み取り画面
import AssetMenuScreen from './components/assetManagement/AssetMenueScreen';//資産管理メニュー画面
import RegisterFormScreen from './components/assetManagement/registerAssetScreen/RegisterFormScreen';// 資産新規登録フォーム画面
import RegisterConfirmScreen from './components/assetManagement/registerAssetScreen/RegisterConfirmScreen';// 資産新規登録確認画面
import RegisterExecuteScreen from './components/assetManagement/registerAssetScreen/RegisterExecuteScreen';// 資産新規登録実行画面
import DeveloperTopScreen from './components/assetManagement/DeveloperTopScreen';//開発者用トップ画面
import DeleteAssetsScreen from './components/assetManagement/developerScreens/DeleteAssetScreen';//資産削除画面
import CompleteScreen from './components/assetManagement/registerAssetScreen/CompleteScreen';//資産新規登録完了画面
import AssetListScreen from './components/assetManagement/assetListScreen/AssetListScreen'; //資産一覧画面
import LendListScreen from './components/assetManagement/lendList/LendList';//貸出一覧画面
import AttendanceCompleteScreen from './components/attendanceManagement/AttendanceCompleteScreen';// 打刻完了画面
import AttendanceHistoryScreen from './components/attendanceManagement/AttendanceHistoryScreen';// 打刻履歴画面



function App() {
  const [screen, setScreen] = useState(SCREENS.TOP);
  const [formData, setFormData] = useState(initialFormData);
  const [inputJson, setInputJson] = useState(null);
  const [authInfo, setAuthInfo] = useState(null);
  const [nextScreen, setNextScreen] = useState(null);
  const [timestamp, setTimestamp] = useState(new Date());

  // TOPに戻ったときにフォームデータをリセットする
  // useEffect(実行したい処理, [監視対象のリスト]);
  useEffect(() => {
    if (screen === SCREENS.TOP) {
      setFormData(initialFormData);
    }
  }, [screen]);

  useEffect(() => {
    if (screen === SCREENS.ATTENDANCE) {
      setTimestamp(new Date());
    }
  }, [screen]);

  const renderScreen = () => {
    switch (screen) {
      case SCREENS.TOP:
        return <TopScreen setScreen={setScreen} setNextScreen={setNextScreen} />;
      case SCREENS.AUTH_SCREEN:
        return <AuthScreen
          setScreen={setScreen}
          setAuthInfo={setAuthInfo}
          nextScreen={nextScreen}
          setNextScreen={setNextScreen}
        />;
      case SCREENS.ATTENDANCE:
        return <AttendanceCompleteScreen setScreen={setScreen} authInfo={authInfo} />;
      case SCREENS.ATTENDANCE_HISTORY:
        return <AttendanceHistoryScreen setScreen={setScreen} authInfo={authInfo} />;
      case SCREENS.ASSET_MENU:
        return <AssetMenuScreen setScreen={setScreen} authInfo={authInfo} />;
      case SCREENS.DEVELOPER_TOP:
        return <DeveloperTopScreen setScreen={setScreen} authInfo={authInfo} />;
      case SCREENS.DELETE_ASSETS:
        return <DeleteAssetsScreen setScreen={setScreen} authInfo={authInfo} />;
      case SCREENS.ASSET_LIST:
        return <AssetListScreen setScreen={setScreen} authInfo={authInfo} />;
      case SCREENS.LEND_LIST:
        return <LendListScreen setScreen={setScreen} authInfo={authInfo} />;
      case SCREENS.REGISTER_FORM:
        return <RegisterFormScreen
          formData={formData}
          setFormData={setFormData}
          setInputJson={setInputJson}
          setScreen={setScreen}
          authInfo={authInfo}
        />;
      case SCREENS.REGISTER_CONFIRM:
        return <RegisterConfirmScreen inputJson={inputJson} setScreen={setScreen} authInfo={authInfo} />;
      case SCREENS.REGISTER_EXECUTE:
        return <RegisterExecuteScreen inputJson={inputJson} setScreen={setScreen} authInfo={authInfo} />;
      case SCREENS.COMPLETE:
        return <CompleteScreen setScreen={setScreen} />;
      default:
        return <TopScreen setScreen={setScreen} setNextScreen={setNextScreen} />;
    }
  };

  return (
    <Container sx={{ mt: 5 }}>
      <Toaster position="top-center" />
      <Box>
        {renderScreen()}
      </Box>
    </Container>
  );
}

export default App;