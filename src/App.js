import React, { useState, useEffect } from 'react';
import { Container, Box } from '@mui/material';
import { Toaster } from 'react-hot-toast';

// 定数とコンポーネントをインポート
import { SCREENS, initialFormData } from './constants';
import TopScreen from './components/TopScreen';
import RegisterFormScreen from './components/RegisterFormScreen';
import RegisterConfirmScreen from './components/RegisterConfirmScreen';
import RegisterExecuteScreen from './components/RegisterExecuteScreen';
import DeveloperTopScreen from './components/DeveloperTopScreen';
import DeleteAssetsScreen from './components/developerScreens/DeleteAssetScreen';
import CompleteScreen from './components/CompleteScreen';
import AssetListScreen from './components/assetListScreen/AssetListScreen';
import LendListScreen from './components/lendList/LendList';

function App() {
  const [screen, setScreen] = useState(SCREENS.TOP);
  const [formData, setFormData] = useState(initialFormData);
  const [inputJson, setInputJson] = useState(null);

  // TOPに戻ったときにフォームデータをリセットする
  useEffect(() => {
    if (screen === SCREENS.TOP) {
      setFormData(initialFormData);
    }
  }, [screen]);

  const renderScreen = () => {
    switch (screen) {
      case SCREENS.TOP:
        return <TopScreen setScreen={setScreen} />;
      case SCREENS.DEVELOPER_TOP:
        return <DeveloperTopScreen setScreen={setScreen} />;
      case SCREENS.DELETE_ASSETS:
        return <DeleteAssetsScreen setScreen={setScreen} />;
      case SCREENS.ASSET_LIST:
        return <AssetListScreen setScreen={setScreen} />;
      case SCREENS.LEND_LIST:
        return <LendListScreen setScreen={setScreen} />;
      case SCREENS.REGISTER_FORM:
        return <RegisterFormScreen
          formData={formData}
          setFormData={setFormData}
          setInputJson={setInputJson}
          setScreen={setScreen}
        />;
      case SCREENS.REGISTER_CONFIRM:
        return <RegisterConfirmScreen inputJson={inputJson} setScreen={setScreen} />;
      case SCREENS.REGISTER_EXECUTE:
        return <RegisterExecuteScreen inputJson={inputJson} setScreen={setScreen} />;
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