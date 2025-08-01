import { Button, Typography, Card, CircularProgress, Box, Fade, Stack, CardActions } from '@mui/material';
import { CheckCircle, NfcRounded } from '@mui/icons-material';
import { useNfcReader } from '../nfc/useNfcReader';
import { useEffect, useState } from 'react';

export const NfcReaderUI = ({ title, description, onScanSuccess, footerActions }) => {
    const [isScanning, setIsScanning] = useState(false);
    const { studentId, error, reset } = useNfcReader(isScanning, setIsScanning);

    useEffect(() => {
        if (studentId && onScanSuccess) {
            onScanSuccess(studentId);
        }
    }, [studentId, onScanSuccess]);

    const handleStartScan = () => {
        reset();
        setIsScanning(true);
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100dvh', bgcolor: '#f6f8fb' }}>
            <Card sx={{ p: 4, maxWidth: 420, width: '100%', mx: 'auto', borderRadius: 4, boxShadow: 8, textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, pb: 1, borderBottom: '2px solid #e0e3e7' }}>
                    {title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {description}
                </Typography>
                <Box sx={{ minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isScanning ? (
                        <CircularProgress />
                    ) : studentId ? (
                        <Fade in={true}>
                            <Box>
                                <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                                <Typography color="text.secondary">認証が完了しました</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>{studentId}</Typography>
                            </Box>
                        </Fade>
                    ) : (
                        <Button variant="contained" size="large" onClick={handleStartScan} sx={{ minWidth: 300 }}>
                            <NfcRounded sx={{ mr: 1.5 }} />
                            スキャン開始
                        </Button>
                    )}
                </Box>
                <Typography color="error" sx={{ minHeight: 24, mt: 1 }}>{error || ' '}</Typography>
                {footerActions && (
                    <CardActions sx={{ justifyContent: 'center', pt: 2, mt: 1, borderTop: '1px solid #e0e3e7' }}>
                        {footerActions}
                    </CardActions>
                )}
            </Card>
        </Box>
    );
};