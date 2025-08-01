import React, { useState, useEffect, useMemo, toast } from 'react';
import { Box, Card, Typography, Button, Stack, Chip, LinearProgress, CircularProgress, } from '@mui/material';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { SCREENS } from '../../constants';
import { API_BASE_URL } from '../../config';

// --- ヘルパー関数 ---

// 時間に応じて挨拶を返す
const getGreeting = (date) => {
    const hour = date.getHours();
    if (hour >= 5 && hour < 11) {
        return 'おはようございます！';
    } else if (hour >= 11 && hour < 18) {
        return 'こんにちは！';
    } else {
        return 'こんばんは！';
    }
};

// ランダムな一言を返す
const getRandomMessage = () => {
    const messages = [
        '今日も一日頑張りましょう！',
        '良いスタートですね！',
        'お疲れ様です。一休みも大切に。',
        '研究、応援しています！',
        '集中できる環境を整えましょう。',
        'ナイス打刻です！'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
};


// --- コンポーネント本体 ---
const AttendanceCompleteScreen = ({ setScreen, authInfo }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timestamp, setTimestamp] = useState(null);
    const [countdown, setCountdown] = useState(100);

    //useMemoで初回実行結果をメモ化する
    const message = useMemo(() => getRandomMessage(), []);
    const formattedTime = useMemo(() => {
        if (!timestamp) return '';
        return format(timestamp, 'HH:mm:ss');
    }, [timestamp]);

    const formattedDate = useMemo(() => {
        if (!timestamp) return '';
        return format(timestamp, 'yyyy年 M月 d日 (E)', { locale: ja });
    }, [timestamp]);

    const greeting = useMemo(() => {
        if (!timestamp) return 'ようこそ！';
        return getGreeting(timestamp);
    }, [timestamp]);



    const handleBackToTop = () => {
        setScreen(SCREENS.TOP);
    };

    // 画面表示時に打刻処理を実行
    useEffect(() => {
        if (!authInfo?.studentId) {
            toast.error('認証情報がありません。TOPに戻ります。');
            setScreen(SCREENS.TOP);
            return;
        }

        const executeAttendance = async () => {
            const now = new Date();
            const jstISOStringWithTZ = new Date(now.getTime() + 9 * 60 * 60 * 1000)
                .toISOString().replace('Z', '+09:00');

            try {
                const payload = {
                    timestamp: jstISOStringWithTZ,
                    student_number: authInfo.studentId,
                };
                const response = await fetch(`${API_BASE_URL}/api/v1/attendances`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) throw new Error('打刻に失敗しました');

                setTimestamp(now);

            } catch (err) {
                setError(err.message);
                toast.error(err.message);
                setTimeout(() => setScreen(SCREENS.TOP), 2000);
            } finally {
                setIsLoading(false);
            }
        };

        executeAttendance();
    }, []);

    // 自動でTOP画面に戻る
    useEffect(() => {
        if (!timestamp) return;
        const progressTimer = setInterval(() => {
            setCountdown(prev => (prev > 0 ? prev - 1 : 0));
        }, 50); // 50msごとに1%減らす (50ms * 100 = 5000ms = 5秒)

        const redirectTimer = setTimeout(() => {
            handleBackToTop();
        }, 5000);

        return () => {
            clearInterval(progressTimer);
            clearTimeout(redirectTimer);
        };
    }, [timestamp, setScreen]);

    // --- 表示部分の切り替え ---
    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100dvh' }}>
                <Card sx={{ p: 4, textAlign: 'center' }}>
                    <CircularProgress sx={{ mb: 2 }} />
                    <Typography>打刻処理を実行中...</Typography>
                </Card>
            </Box>
        );
    }
    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100dvh' }}>
                <Card sx={{ p: 4, textAlign: 'center', borderColor: 'error.main', borderWidth: 2, borderStyle: 'solid' }}>
                    <Typography color="error">{error}</Typography>
                </Card>
            </Box>
        );
    }
    if (!timestamp) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100dvh' }}>
                <Card sx={{ p: 4, textAlign: 'center', borderColor: 'error.main', borderWidth: 2, borderStyle: 'solid' }}>
                    <Typography color="error">打刻時刻を取得できませんでした。</Typography>
                </Card>
            </Box>
        )
    }
    // 成功時の表示
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100dvh', bgcolor: '#f6f8fb' }}>
            <Card sx={{ p: 4, maxWidth: 450, width: '100%', mx: 'auto', borderRadius: 4, boxShadow: 8, textAlign: 'center' }}>
                <TaskAltIcon
                    sx={{ fontSize: 48, color: 'success.main', mb: 2 }}
                />
                <Typography
                    variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    {getGreeting(timestamp)}
                </Typography>
                <Typography
                    color="text.secondary" sx={{ mb: 3 }}>
                    {message}
                </Typography>

                <Box
                    sx={{ bgcolor: 'grey.100', borderRadius: 3, p: 2, mb: 4, border: '1px solid', borderColor: 'grey.200' }}>
                    <Typography
                        variant="caption" color="text.secondary">{format(timestamp, 'yyyy年 M月 d日 (E)', { locale: ja })}
                    </Typography>
                    <Typography
                        variant="h3" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'primary.main', letterSpacing: 2 }}>
                        {format(timestamp, 'HH:mm:ss')}
                    </Typography>
                    <Chip label="打刻完了" color="success" size="small" />
                </Box>

                <Stack spacing={2} direction="column" sx={{ mb: 3 }}>
                    <Button variant="contained" size="large" onClick={() => setScreen(SCREENS.ATTENDANCE_HISTORY)} sx={{ borderRadius: 3 }}>
                        出席履歴を表示
                    </Button>
                    <Button variant="outlined" size="large" onClick={() => setScreen(SCREENS.TOP)} sx={{ borderRadius: 3 }}>
                        TOPへ戻る
                    </Button>
                </Stack>

                <Box>
                    <Typography variant="caption" color="text.secondary">5秒後に自動でTOPへ戻ります...</Typography>
                    <LinearProgress variant="determinate" value={countdown} sx={{ mt: 0.5 }} />
                </Box>
            </Card>
        </Box>
    );
};

export default AttendanceCompleteScreen;