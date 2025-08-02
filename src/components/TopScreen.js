import { useEffect, useRef } from 'react';
import {
    Button,
    Typography,
    Stack,
    Card,
    CardContent,
    CardActions,
    Box
} from '@mui/material';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import { SCREENS } from '../constants';

const TopScreen = ({ setScreen, setNextScreen }) => {
    // スクロール禁止
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const timeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);


    const handleNavigate = (targetScreen) => {
        setNextScreen(targetScreen); // 行き先をApp.jsに保存
        setScreen(SCREENS.AUTH_SCREEN);     // 認証画面へ遷移
    };

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
                    bgcolor: 'white'
                }}
            >
                <CardContent>
                    <Box sx={{ mb: 2 }}>
                        <Inventory2RoundedIcon
                            sx={{ fontSize: 48, color: 'primary.main' }}
                        />
                    </Box>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            mb: 1,
                            pb: 1,
                            borderBottom: '2px solid #e0e3e7'
                        }}
                    >
                        研究室統合管理システム v1.0
                    </Typography>
                    <Typography sx={{ mb: 1, mt: 1 }} color="text.secondary">
                        操作には学生証が必要です
                    </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', mt: 1 }}>
                    <Stack spacing={2} direction="column">
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => handleNavigate(SCREENS.ATTENDANCE)}
                            fullWidth
                            sx={{
                                borderRadius: 3,
                                px: 4,
                                minWidth: 300,
                                fontWeight: 600,
                                fontSize: '1.1rem',
                                boxShadow: 3,
                                transition: 'all 0.2s',
                            }}
                        >
                            出席打刻！
                        </Button>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => setScreen(SCREENS.TODAYS_ATTENDANCE)}
                            sx={{
                                borderRadius: 3,
                                px: 4,
                                minWidth: 300,
                                fontWeight: 600,
                                fontSize: '1.1rem',
                                boxShadow: 3,
                                transition: 'all 0.2s',
                            }}
                        >
                            今日の出席状況
                        </Button>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => handleNavigate(SCREENS.ASSET_MENU)}
                            fullWidth
                            sx={{
                                borderRadius: 3,
                                px: 4,
                                minWidth: 300,
                                fontWeight: 600,
                                fontSize: '1.1rem',
                                boxShadow: 3,
                                transition: 'all 0.2s',
                            }}
                        >
                            備品管理
                        </Button>
                    </Stack>
                </CardActions>
            </Card>
        </Box >
    );
};

export default TopScreen;
