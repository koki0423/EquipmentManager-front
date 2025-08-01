import { NfcReaderUI } from './NfcReaderUI';
import { SCREENS } from '../constants';
import toast from 'react-hot-toast';

const AuthScreen = ({ setScreen, setAuthInfo }) => {

    const handleLogin = (id) => {
        toast.success(`ようこそ、${id}さん！`);
        // 1.5秒後にメニュー画面へ遷移
        setTimeout(() => {
            // 親コンポーネントに認証情報を渡す
            setAuthInfo({ studentId: id });
            // メニュー画面へ遷移
            setScreen(SCREENS.MENU_SCREEN);
        }, 1500);
    };

    return (
        <NfcReaderUI
            title="備品管理システム"
            description="学生証をリーダーにかざしてください"
            onScanSuccess={handleLogin}
        />
    );
};

export default AuthScreen;