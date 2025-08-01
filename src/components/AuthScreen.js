import { useCallback } from 'react';
import { Box, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { NfcReaderUI } from './NfcReaderUI';
import { SCREENS } from '../constants';
import toast from 'react-hot-toast';

const AuthScreen = ({ setScreen, setAuthInfo, nextScreen, setNextScreen }) => {
    const handleLogin = useCallback((id) => {
        toast.success(`ようこそ、${id}さん！`);

        setAuthInfo({ studentId: id });

        setTimeout(() => {
            setScreen(nextScreen || 'TopScreen');
            setNextScreen(null);
        }, 1500);
    }, [setAuthInfo, setScreen, nextScreen, setNextScreen]);

    const handleBackToTop = () => {
        setNextScreen(null);
        setScreen(SCREENS.TOP);
    };

    return (
        <NfcReaderUI
            title="学生証認証"
            description="操作を続けるには学生証をかざしてください"
            onScanSuccess={handleLogin}
            footerActions={
                <Button
                    variant="outlined"
                    onClick={handleBackToTop}
                    startIcon={<ArrowBackIcon />}
                >
                    TOPへ戻る
                </Button>
            }
        />
    );
};

export default AuthScreen;