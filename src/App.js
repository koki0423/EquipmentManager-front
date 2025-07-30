import React, { useState, useEffect } from 'react';
import { Container, Box } from '@mui/material';
import { Toaster } from 'react-hot-toast';

// 定数とコンポーネントをインポート
import { SCREENS, initialFormData } from './constants';
import TopScreen from './components/TopScreen';
import RegisterFormScreen from './components/registerAssetScreen/RegisterFormScreen';
import RegisterConfirmScreen from './components/registerAssetScreen/RegisterConfirmScreen';
import RegisterExecuteScreen from './components/registerAssetScreen/RegisterExecuteScreen';
import DeveloperTopScreen from './components/DeveloperTopScreen';
import DeleteAssetsScreen from './components/developerScreens/DeleteAssetScreen';
import CompleteScreen from './components/registerAssetScreen/CompleteScreen';
import AssetListScreen from './components/assetListScreen/AssetListScreen';
import LendListScreen from './components/lendList/LendList';
import MenueScreen from './components/MenueScreen';

function App() {
  const [screen, setScreen] = useState(SCREENS.TOP);
  const [formData, setFormData] = useState(initialFormData);
  const [inputJson, setInputJson] = useState(null);
  const [authInfo, setAuthInfo] = useState(null);

  // TOPに戻ったときにフォームデータをリセットする
  useEffect(() => {
    if (screen === SCREENS.TOP) {
      setFormData(initialFormData);
    }
  }, [screen]);

  const renderScreen = () => {
    switch (screen) {
      case SCREENS.TOP:
        return <TopScreen setScreen={setScreen} setAuthInfo={setAuthInfo} />;
      case SCREENS.MENU_SCREEN:
        return <MenueScreen setScreen={setScreen} authInfo={authInfo} />;
      case SCREENS.DEVELOPER_TOP:
        return <DeveloperTopScreen setScreen={setScreen} authInfo={authInfo}/>;
      case SCREENS.DELETE_ASSETS:
        return <DeleteAssetsScreen setScreen={setScreen}authInfo={authInfo} />;
      case SCREENS.ASSET_LIST:
        return <AssetListScreen setScreen={setScreen}authInfo={authInfo} />;
      case SCREENS.LEND_LIST:
        return <LendListScreen setScreen={setScreen} authInfo={authInfo}/>;
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
        return <TopScreen setScreen={setScreen} />;
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