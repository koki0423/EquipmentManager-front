import React, { useState } from 'react';
import { Box, Card, Typography, Button, Badge, CircularProgress, Tooltip } from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';
import { LocalizationProvider, DateCalendar, PickersDay } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ja } from 'date-fns/locale';
import { format, isSameDay, getHours, getMinutes } from 'date-fns';

import { useAttendance } from './useAttendance';
import { SCREENS } from '../../constants';

// --- 表示用コンポーネント ---
const BadgeDay = (props) => {
    const { day, highlightedDays, ...other } = props;
    const hasAttendance = highlightedDays.has(format(day, 'yyyy-MM-dd'));
    return (
        <Badge
            key={day.toString()}
            overlap="circular"
            variant="dot"
            color="primary"
            invisible={!hasAttendance} // highlightedDaysに含まれない日はバッジを非表示
        >
            <PickersDay {...other} day={day} />
        </Badge>
    );
};

// --- 日別タイムライン表示コンポーネント ---
const DailyTimelineView = ({ date, records }) => {
    return (
        <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TimelineIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {format(date, 'M月d日 (E)', { locale: ja })} の活動タイムライン
                </Typography>
            </Box>
            <Box sx={{ position: 'relative', height: '40px', bgcolor: 'grey.300', borderRadius: '4px', overflow: 'hidden' }}>
                {records.map((record, index) => {
                    const hour = getHours(record.timestamp);
                    const minute = getMinutes(record.timestamp);
                    const leftPercentage = ((hour * 60 + minute) / (24 * 60)) * 100;
                    return (
                        <Tooltip key={index} title={format(record.timestamp, 'HH:mm:ss')} placement="top">
                            <Box
                                sx={{
                                    position: 'absolute',
                                    left: `${leftPercentage}%`,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '10px',
                                    height: '10px',
                                    bgcolor: 'primary.main',
                                    borderRadius: '50%',
                                    border: '2px solid white',
                                }}
                            />
                        </Tooltip>
                    );
                })}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography variant="caption">0:00</Typography>
                <Typography variant="caption">6:00</Typography>
                <Typography variant="caption">12:00</Typography>
                <Typography variant="caption">18:00</Typography>
                <Typography variant="caption">24:00</Typography>
            </Box>
        </Box>
    );
};

const AttendanceHistoryScreen = ({ setScreen, authInfo }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const { isLoading, error, highlightedDays, getRecordsForDate } = useAttendance(authInfo);

    const recordsForSelectedDate = getRecordsForDate(selectedDate);

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Typography color="error" sx={{ textAlign: 'center', mt: 5 }}>{error}</Typography>;
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
            <Card sx={{ p: 4, maxWidth: '90vw', width: 1000, mx: 'auto', borderRadius: 4, boxShadow: 8 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>出席履歴</Typography>
                <Box sx={{ display: 'flex', gap: 4 }}>
                    <Box sx={{ flex: 1, border: '1px solid #ddd', borderRadius: 2 }}>
                        <DateCalendar
                            value={selectedDate}
                            onChange={(newDate) => setSelectedDate(newDate)}
                            slots={{ day: BadgeDay }}
                            slotProps={{ day: { highlightedDays } }}
                        />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        {selectedDate ? (
                            <DailyTimelineView date={selectedDate} records={recordsForSelectedDate} />
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                <Typography color="text.secondary">
                                    カレンダーの日付を選択してください。
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Button variant="outlined" onClick={() => setScreen(SCREENS.TOP)}>TOPへ戻る</Button>
                </Box>
            </Card>
        </LocalizationProvider>
    );
};


export default AttendanceHistoryScreen;