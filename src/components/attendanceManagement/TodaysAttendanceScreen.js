import React, { useState, useEffect } from 'react';
import { Box, Card, Typography, Button, CircularProgress, Paper } from '@mui/material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineOppositeContent, TimelineDot } from '@mui/lab';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { API_BASE_URL } from '../../config';
import { SCREENS } from '../../constants';

const TodaysAttendanceScreen = ({ setScreen, authInfo }) => {
    const [todaysData, setTodaysData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTodaysData = async () => {
            try {
                // バックエンドに「今日の」データを要求するAPIを想定
                const response = await fetch(`${API_BASE_URL}/api/v1/attendances/today`);
                if (!response.ok) throw new Error('データの取得に失敗しました');

                const data = await response.json();
                const formattedData = data.map(record => ({
                    ...record,
                    timestamp: new Date(record.timestamp)
                })).sort((a, b) => a.timestamp - b.timestamp); // 時刻順にソート

                setTodaysData(formattedData);

            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTodaysData();
    }, []);

    const todayString = format(new Date(), 'yyyy年 M月 d日 (E)', { locale: ja });

    const renderTimeline = () => {
        if (todaysData.length === 0) {
            return (
                <Typography sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>
                    まだ誰も出席していません。
                </Typography>
            );
        }

        return (
            <Timeline position="alternate">
                {todaysData.map((record, index) => (
                    <TimelineItem key={index}>
                        <TimelineOppositeContent color="text.secondary">
                            {format(record.timestamp, 'HH:mm:ss')}
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                            <TimelineDot color="primary" />
                            <TimelineConnector />
                        </TimelineSeparator>
                        <TimelineContent>
                            <Paper elevation={3} sx={{ p: '6px 16px' }}>
                                <Typography variant="h6" component="h1">
                                    {record.student_number}
                                </Typography>
                                {/* APIが名前を返すならここに表示 */}
                                {/* <Typography>山田 太郎</Typography> */}
                            </Paper>
                        </TimelineContent>
                    </TimelineItem>
                ))}
            </Timeline>
        );
    };
    return (
        <Card sx={{
            p: 3,
            maxWidth: 600,
            width: '100%',
            mx: 'auto',
            borderRadius: 4,
            boxShadow: 8,
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* --- ヘッダー部分 (固定) --- */}
            <Box sx={{ flexShrink: 0, pb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center' }}>
                    今日の出席状況
                </Typography>
                <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                    {todayString}
                </Typography>
            </Box>

            {/* --- タイムライン部分 (スクロール) --- */}
            <Box sx={{
                flex: 1,                // 3. このBoxが残りのスペースをすべて使うように指定
                overflowY: 'auto',      // 4. 縦方向のコンテンツがはみ出たらスクロールバーを表示
                minHeight: 0,           // Flexboxでoverflowを正しく機能させるためのおまじない
                // スクロールバー用の少しの余白
                pr: 1,
            }}>
                {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>}
                {error && <Typography color="error" sx={{ textAlign: 'center' }}>{error}</Typography>}
                {!isLoading && !error && renderTimeline()}
            </Box>

            {/* --- フッター部分 (固定) --- */}
            <Box sx={{ textAlign: 'center', flexShrink: 0, pt: 2, mt: 2, borderTop: '1px solid #eee' }}>
                <Button variant="outlined" onClick={() => setScreen(SCREENS.TOP)}>TOPへ戻る</Button>
            </Box>
        </Card>
    );
};

export default TodaysAttendanceScreen;