import React, { useState, useEffect } from 'react';
import {
    Typography,
    Card,
    Box,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { SCREENS } from '../../../constants';

const CompleteScreen = ({ setScreen }) => {
    const [countdown, setCountdown] = useState(5);

    // スクロール禁止
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    useEffect(() => {
        if (countdown === 0) {
            setScreen(SCREENS.TOP);
            return;
        }
        const timerId = setTimeout(() => {
            setCountdown(countdown - 1);
        }, 1000);
        return () => clearTimeout(timerId);
    }, [countdown, setScreen]);

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100dvh',
                bgcolor: '#f6f8fb',
            }}
        >
            <Card
                sx={{
                    p: 4,
                    maxWidth: 420,
                    width: '100%',
                    mx: 'auto',
                    borderRadius: 4,
                    boxShadow: 8,
                    textAlign: 'center',
                    bgcolor: 'white',
                }}
            >
                <Box sx={{ mb: 2 }}>
                    <CheckCircleRoundedIcon sx={{ fontSize: 56, color: 'success.main' }} />
                </Box>
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 700,
                        mb: 1,
                        pb: 1,
                        borderBottom: '2px solid #e0e3e7',
                    }}
                >
                    登録完了しました
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    QRコードが発行されます。忘れずに貼付してください。
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {countdown}秒後にTOPへ戻ります...
                </Typography>
            </Card>
        </Box>
    );
};

export default CompleteScreen;
