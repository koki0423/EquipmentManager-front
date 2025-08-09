import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Box, Card, Typography, Table, TableHead, TableRow, TableCell,
    TableBody, TableContainer, Paper, Button, Stack, Dialog,
    DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import { API_BASE_URL } from '../../../config';

function DeleteAssetScreen({ setScreen }) {
    const [assets, setAssets] = useState([]);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // 初回データ取得
    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/v1/assets/master/all`)
            .then(res => {
                setAssets(res.data.masters || []);
            })
            .catch(err => {
                console.error('APIエラー:', err);
            });
    }, []);

    // 削除ダイアログを開く
    const handleDeleteOpen = (asset) => {
        setDeleteTarget(asset);
        setDeleteOpen(true);
    };

    // 削除ダイアログを閉じる
    const handleDeleteClose = () => {
        setDeleteTarget(null);
        setDeleteOpen(false);
    };

    // 削除を実行する
    const handleDeleteConfirm = () => {
        if (!deleteTarget) return;

        axios.delete(`${API_BASE_URL}/api/v1/assets/master/${deleteTarget.id}`)
            .then(() => {
                // APIでの再取得は行わず、フロントのstateを直接更新する
                setAssets(prevAssets => prevAssets.filter(asset => asset.id !== deleteTarget.id));
                handleDeleteClose();
            })
            .catch(err => {
                console.error('削除エラー:', err);
                // ここでユーザーにエラー通知を行うのが望ましい
            });
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
                    maxWidth: '90vw',
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
                    備品一覧（編集・削除）
                </Typography>

                <TableContainer component={Paper} sx={{ mt: 3, mb: 2 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>名前</TableCell>
                                <TableCell>メーカー</TableCell>
                                <TableCell>型番</TableCell>
                                <TableCell align="center">操作</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {assets.map((asset) => (
                                <TableRow key={asset.id}>
                                    <TableCell>{asset.id}</TableCell>
                                    <TableCell>{asset.name}</TableCell>
                                    {/* Goの構造体 `*string` はnullになりうるため、フォールバック表示を用意 */}
                                    <TableCell>{asset.manufacturer || '－'}</TableCell>
                                    <TableCell>{asset.model_number || '－'}</TableCell>
                                    <TableCell align="center">
                                        {/* 編集ボタンを削除 */}
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            color="error"
                                            onClick={() => handleDeleteOpen(asset)}
                                        >
                                            削除
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                    <Button variant="outlined" onClick={() => setScreen('TOP')} sx={{ /* ...スタイルは省略... */ }}>
                        戻る
                    </Button>
                </Stack>
            </Card>

            {/* 編集モーダル */}
            {/* <Dialog open={editOpen} onClose={handleEditClose}>
                <DialogTitle>備品情報を編集</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <TextField
                        label="名前"
                        value={selectedAsset?.name || ''}
                        onChange={(e) => handleChange('name', e.target.value)}
                        fullWidth
                        margin="dense"
                    />
                    <TextField
                        label="メーカー"
                        value={selectedAsset?.manufacturer || ''}
                        onChange={(e) => handleChange('manufacturer', e.target.value)}
                        fullWidth
                        margin="dense"
                    />
                    <TextField
                        label="型番"
                        value={selectedAsset?.model_number || ''}
                        onChange={(e) => handleChange('model_number', e.target.value)}
                        fullWidth
                        margin="dense"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditClose}>キャンセル</Button>
                    <Button
                        variant="contained"
                        // onClick={handleEditSave}
                        onClick={() => alert("バックエンド未実装です")}
                    >
                        保存
                    </Button>
                </DialogActions>
            </Dialog> */}

            {/* 削除確認ダイアログ */}
            <Dialog open={deleteOpen} onClose={handleDeleteClose}>
                <DialogTitle>削除の確認</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Typography>
                        「{deleteTarget?.name}」を本当に削除しますか？
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteClose}>キャンセル</Button>
                    <Button color="error" variant="contained" onClick={handleDeleteConfirm}>
                        削除する
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default DeleteAssetScreen;
