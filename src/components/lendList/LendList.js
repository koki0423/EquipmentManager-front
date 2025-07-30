import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Box, Card, Typography, Table, TableHead, TableRow, TableCell,
    TableBody, TableContainer, Paper, Button, Stack, Dialog,
    DialogTitle, DialogContent, DialogActions, CircularProgress
} from '@mui/material';
import AssignmentReturnRoundedIcon from '@mui/icons-material/AssignmentReturnRounded';
import { format } from 'date-fns';
import { API_BASE_URL } from '../../config';
import { SCREENS } from '../../constants';

function LendListScreen({ setScreen }) {
    const [lendings, setLendings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [returnOpen, setReturnOpen] = useState(false);
    const [selectedLending, setSelectedLending] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // 1. 貸出情報と備品情報が結合されたデータを一括で取得
            const response = await axios.get(`${API_BASE_URL}/api/v1/lend/all/with-name`);

            // 2. レスポンスのデータをそのままstateにセット
            setLendings(response.data.lends || []);

        } catch (err) {
            console.error('APIエラー:', err);
            // エラー発生時はリストを空にする
            setLendings([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 返却処理の関数
    const handleReturnOpen = (lending) => {
        setSelectedLending(lending);
        setReturnOpen(true);
    };

    const handleReturnClose = () => {
        setReturnOpen(false);
        setSelectedLending(null);
    };

    const handleReturnConfirm = () => {
        if (!selectedLending) return;

        // 1. バックエンドが要求する形式でリクエストボディを作成する
        const requestBody = {
            // `selectedLending` オブジェクトに貸出数量が含まれていると想定
            quantity: selectedLending.quantity,

            // 返却日時には現在時刻をISO 8601形式の文字列で指定
            actual_return_date: format(new Date(), 'yyyy-MM-dd'),

            // 備考は任意なので、今回は含めない (必要なら追加)
            notes: selectedLending.notes || ''
        };

        const url = `${API_BASE_URL}/api/v1/lend/return/${selectedLending.id}`;

        // 2. axios.putの第2引数に、作成したリクエストボディを渡す
        axios.post(url, requestBody)
            .then(() => {
                alert(`${selectedLending.name} を返却しました。`);
                handleReturnClose();
                fetchData(); // リストを再取得
            })
            .catch(err => {
                console.error('返却処理エラー:', err.response); // エラーレスポンスの詳細を見る
                alert('返却処理中にエラーが発生しました。');
            });
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100dvh', bgcolor: '#f6f8fb' }}>
            <Card sx={{ p: 4, maxWidth: '90vw', width: '100%', mx: 'auto', borderRadius: 4, boxShadow: 8, textAlign: 'center', bgcolor: 'white' }}>
                <Box sx={{ mb: 2 }}>
                    <AssignmentReturnRoundedIcon sx={{ fontSize: 44, color: 'primary.main' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, pb: 1, borderBottom: '2px solid #e0e3e7' }}>
                    貸出中一覧
                </Typography>

                {isLoading ? (
                    <Box sx={{ my: 5, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
                ) : (
                    <TableContainer component={Paper} sx={{ mt: 3, mb: 2 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>備品名</TableCell>
                                    <TableCell>貸出先</TableCell>
                                    <TableCell>貸出日</TableCell>
                                    <TableCell>返却予定日</TableCell>
                                    <TableCell>備考</TableCell>
                                    <TableCell align="center">操作</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {lendings.map((lending) => (
                                    <TableRow key={lending.id}>
                                        <TableCell>{lending.name || '（名称不明）'}</TableCell>
                                        <TableCell>{lending.borrower || '－'}</TableCell>
                                        <TableCell>{lending.lend_date ? format(new Date(lending.lend_date), 'yyyy-MM-dd') : '－'}</TableCell>
                                        <TableCell>{lending.expected_return_date ? format(new Date(lending.expected_return_date), 'yyyy-MM-dd') : '－'}</TableCell>
                                        <TableCell>{lending.notes || '－'}</TableCell>
                                        <TableCell align="center">
                                            <Button variant="contained" size="small" onClick={() => handleReturnOpen(lending)}>
                                                返却
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                    <Button variant="outlined" onClick={() => setScreen(SCREENS.MENU_SCREEN)} sx={{ borderRadius: 3, px: 4, fontWeight: 600 }}>
                        戻る
                    </Button>
                </Stack>
            </Card>

            {/* 返却確認モーダル*/}
            <Dialog open={returnOpen} onClose={handleReturnClose} fullWidth maxWidth="xs">
                <DialogTitle>備品を返却済みしますか？</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        <strong>備品名:</strong> {selectedLending?.name}
                    </Typography>
                    <Typography variant="body1">
                        <strong>貸出先:</strong> {selectedLending?.borrower}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleReturnClose}>キャンセル</Button>
                    <Button variant="contained" color="primary" onClick={handleReturnConfirm}>
                        YES
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default LendListScreen;