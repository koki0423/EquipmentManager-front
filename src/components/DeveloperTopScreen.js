import React, { useEffect } from 'react';
import { format } from 'date-fns/format';
import {
    Button,
    Typography,
    Stack,
    Card,
    Box,
} from '@mui/material';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import { SCREENS } from '../constants';

const DeveloperTopScreen = ({ setScreen }) => {
    // スクロール禁止
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

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
                    <BuildRoundedIcon sx={{ fontSize: 44, color: 'primary.main' }} />
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
                    開発者モード
                </Typography>

                {/* 開発者ボタン */}
                <Stack direction="column" spacing={2} sx={{ my: 3 }}>
                    <Button
                        variant="contained"
                        color="info"
                        onClick={() => setScreen(SCREENS.DELETE_ASSETS)}
                    >
                        備品マスタ編集
                    </Button>
                    <Button
                        variant="contained"
                        color="info"
                        onClick={() => alert("ログ出力")}
                    >
                        ログ出力
                    </Button>
                </Stack>

                <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mt: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={() => setScreen(SCREENS.TOP)}
                        sx={{
                            borderRadius: 3,
                            px: 4,
                            fontWeight: 600,
                            fontSize: '1.05rem',
                            color: 'primary.main',
                            borderColor: 'primary.main',
                            bgcolor: 'white',
                            '&:hover': { bgcolor: '#f1f7fb', borderColor: 'primary.dark' },
                        }}
                    >
                        戻る
                    </Button>
                </Stack>
            </Card>
        </Box>
    );


};

export default DeveloperTopScreen;
