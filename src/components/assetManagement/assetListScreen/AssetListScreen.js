import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Box, Card, Typography, Table, TableHead, TableRow, TableCell,
    TableBody, TableContainer, Paper, Button, Stack, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField, CircularProgress,
    FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import { format } from 'date-fns';
import { API_BASE_URL } from '../../../config';
import { SCREENS } from '../../../constants';

function AssetListScreen({ setScreen, authInfo }) {
    const [assets, setAssets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [lendOpen, setLendOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [lendingInfo, setLendingInfo] = useState({ owner: '', rental_end_date: '' });
    const [disposeOpen, setDisposeOpen] = useState(false);
    const [disposalInfo, setDisposalInfo] = useState({
        reason: '',
        processed_by: '',
        quantity: 1,
        is_individual: false
    });
    const [statusFilter, setStatusFilter] = useState('');

    const statusList = [
        { id: 1, name: "正常" },
        { id: 2, name: "故障" },
        { id: 3, name: "修理中" },
        { id: 4, name: "貸出中" },
        { id: 5, name: "廃棄済み" },
        { id: 6, name: "紛失" }
    ];

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [mastersRes, assetsRes, lendRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/v1/assets/master/all`),
                axios.get(`${API_BASE_URL}/api/v1/assets/all`),
                axios.get(`${API_BASE_URL}/api/v1/lend/all`)
            ]);

            const masters = mastersRes.data.masters;
            const individualAssets = assetsRes.data.assets;
            const allLendings = lendRes.data.lends || [];

            // 1. "現在貸出中" の備品の {asset_id: 貸出中合計数} という Map を作成
            const lentQuantityMap = allLendings
                .filter(l => !l.actual_return_date) // 貸出中のレコードに絞る
                .reduce((map, currentLending) => {
                    const { asset_id, quantity } = currentLending;
                    // 既にMapにIDがあれば数量を加算、なければ新規追加
                    map.set(asset_id, (map.get(asset_id) || 0) + quantity);
                    return map;
                }, new Map()); // 初期値は空のMap

            const masterMap = new Map(masters.map(m => [m.id, m]));

            // 2. 備品情報に「貸出可能数」を追加して結合
            const combinedAssets = individualAssets.map(asset => {
                const masterInfo = masterMap.get(asset.item_master_id) || {};

                // この資産の貸出中合計数を Map から取得 (なければ0)
                const lentQuantity = lentQuantityMap.get(asset.id) || 0;

                // 貸出可能数を計算
                const availableQuantity = asset.quantity - lentQuantity;

                return {
                    ...asset,
                    name: masterInfo.name,
                    manufacturer: masterInfo.manufacturer,
                    model_number: masterInfo.model_number,
                    // 計算結果をオブジェクトに追加
                    availableQuantity: availableQuantity
                };
            });

            setAssets(combinedAssets);

        } catch (err) {
            console.error('APIエラー:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- 編集関連の関数 ---
    const handleEditOpen = (asset) => {
        setSelectedAsset(asset);
        setEditOpen(true);
    };
    const handleEditClose = () => {
        setEditOpen(false);
        setSelectedAsset(null);
    };
    const handleEditSave = () => {
        if (!selectedAsset) return;
        const sendData = {
            quantity: Number(selectedAsset.quantity),
            serial_number: selectedAsset.serial_number,
            status_id: Number(selectedAsset.status_id),
            purchase_date: selectedAsset.purchase_date
                ? format(new Date(selectedAsset.purchase_date), 'yyyy-MM-dd')
                : null,
            owner: selectedAsset.owner,
            location: selectedAsset.location,
            last_check_date: format(new Date(), 'yyyy-MM-dd'),
            last_checker: selectedAsset.last_checker,
            notes: selectedAsset.notes,
        }

        axios.put(`${API_BASE_URL}/api/v1/assets/edit/${selectedAsset.id}`, sendData)
            .then(() => {
                handleEditClose();
                fetchData();
            })
            .catch(err => console.error('更新エラー:', err));
    };
    const handleChange = (field, value) => {
        setSelectedAsset((prev) => ({ ...prev, [field]: value }));
    };


    // --- 貸出関連の関数 ---
    const handleLendOpen = (asset) => {
        setSelectedAsset(asset);
        // モーダルを開く際にstateを初期化
        setLendingInfo({
            borrower: '',
            quantity: asset.serial_number ? 1 : (asset.quantity > 0 ? 1 : 0), // シリアル番号があれば1、なければ在庫数を上限に1を初期値
            expected_return_date: '',
            notes: ''
        });
        setLendOpen(true);
    };

    const handleLendClose = () => {
        setLendOpen(false);
        setSelectedAsset(null);
    };

    const handleLendingInfoChange = (e) => {
        const { name, value } = e.target;
        setLendingInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleLendConfirm = () => {
        if (!selectedAsset || !lendingInfo.borrower) {
            alert('貸出先を入力してください。');
            return;
        }

        const lendData = {
            asset_id: selectedAsset.id,
            borrower: lendingInfo.borrower,
            quantity: Number(lendingInfo.quantity),
            lend_date: format(new Date(), 'yyyy-MM-dd'),
            expected_return_date: lendingInfo.expected_return_date || null,
            notes: lendingInfo.notes || null,
        };

        const url = `${API_BASE_URL}/api/v1/lend/${selectedAsset.id}`;

        axios.post(url, lendData)
            .then(() => {
                alert(`${selectedAsset.name} を ${lendData.borrower} に貸し出しました。`);
                handleLendClose();
                fetchData();
            })
            .catch(err => {
                console.error('貸出処理エラー:', err);
                const errMsg = err.response?.data?.error || '貸出処理中にエラーが発生しました。';
                alert(errMsg);
            });
    };

    // --- 廃棄関連の関数 ---
    const handleDisposeOpen = (asset) => {
        setSelectedAsset(asset);
        setDisposalInfo({
            reason: '',
            processed_by: '',
            quantity: asset.serial_number ? 1 : (asset.quantity > 0 ? 1 : 0),
            is_individual: !!asset.serial_number
        });
        setDisposeOpen(true);
    };

    const handleDisposeClose = () => {
        setDisposeOpen(false);
        setSelectedAsset(null);
    };

    const handleDisposeConfirm = async () => {
        if (!selectedAsset) return;
        const disposalData = {
            asset_id: selectedAsset.id,
            reason: disposalInfo.reason || '', // 廃棄理由
            processed_by: disposalInfo.processed_by || '', // 処理者の学籍番号
            quantity: Number(disposalInfo.quantity) || 1, // 廃棄する数量
            is_individual: disposalInfo.is_individual // 個別管理かどうか
        };

        const url = `${API_BASE_URL}/api/v1/disposal/${selectedAsset.id}`;
        axios.post(url, disposalData)
            .then(() => {
                alert(`${selectedAsset.name} を ${disposalData.borrower} を廃棄登録しました。`);
                handleDisposeClose();
                fetchData();
            })
            .catch(err => {
                console.error('廃棄処理エラー:', err);
                const errMsg = err.response?.data?.error || '廃棄処理中にエラーが発生しました。';
                alert(errMsg);
            });
    };


    const filteredAssets = assets.filter(asset => {
        // フィルターが空文字 '' の場合、無条件ですべて表示する
        if (statusFilter === '') {
            return true;
        }
        // フィルターが設定されている場合、そのstatus_idを持つものだけ表示
        return asset.status_id === statusFilter;
    });

    const isDisposedEditLock =
        statusFilter === 5 || (selectedAsset && Number(selectedAsset.status_id) === 5);

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100dvh', bgcolor: '#f6f8fb' }}>
            <Card sx={{ p: 4, maxWidth: '90vw', width: '100%', mx: 'auto', borderRadius: 4, boxShadow: 8, textAlign: 'center', bgcolor: 'white' }}>
                <Box sx={{ mb: 2 }}>
                    <StorageRoundedIcon sx={{ fontSize: 44, color: 'primary.main' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, pb: 1, borderBottom: '2px solid #e0e3e7' }}>
                    備品在庫一覧
                </Typography>

                <Stack direction="row" spacing={1} sx={{ my: 2, flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                    <Button
                        variant={statusFilter === '' ? 'contained' : 'outlined'}
                        onClick={() => setStatusFilter('')}
                        size="small"
                    >
                        すべて
                    </Button>
                    {statusList
                        .filter(status => status.id !== 4)
                        .map((status) => (
                            <Button
                                key={status.id}
                                variant={statusFilter === status.id ? 'contained' : 'outlined'}
                                onClick={() => setStatusFilter(status.id)}
                                size="small"
                            >
                                {status.name}
                            </Button>
                        ))}
                </Stack>


                {isLoading ? (
                    <Box sx={{ my: 5, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
                ) : (
                    <TableContainer component={Paper} sx={{ mt: 3, mb: 2 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>備品名</TableCell>
                                    <TableCell>シリアル番号</TableCell>
                                    <TableCell>数量</TableCell>
                                    <TableCell>購入日</TableCell>
                                    <TableCell>保管場所</TableCell>
                                    <TableCell>使用者</TableCell>
                                    <TableCell align="center">操作</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredAssets.map((asset) => {
                                    // 貸出ボタンの表示ロジック
                                    const isLendableStatus = asset.status_id === 1;
                                    let isDisabled = false;
                                    let buttonText = '';
                                    //console.log('asset:', asset);

                                    if (!isLendableStatus) {
                                        isDisabled = true;
                                        const currentStatus = statusList.find(s => s.id === asset.status_id);
                                        buttonText = currentStatus ? currentStatus.name : '貸出不可';
                                    } else if (asset.serial_number) {
                                        // 正常 ＋ シリアル番号あり の場合
                                        isDisabled = asset.availableQuantity <= 0;
                                        buttonText = isDisabled ? '貸出中' : '貸出';
                                    } else {
                                        // 正常 ＋ シリアル番号なし の場合
                                        isDisabled = asset.availableQuantity <= 0;
                                        buttonText = isDisabled ? '在庫なし' : `貸出 (残: ${asset.availableQuantity})`;
                                    }

                                    return (
                                        <TableRow key={asset.id}>
                                            <TableCell>{asset.name || 'N/A'}</TableCell>
                                            <TableCell>{asset.serial_number || '－'}</TableCell>
                                            <TableCell>{asset.quantity}</TableCell>
                                            <TableCell>{asset.purchase_date ? format(new Date(asset.purchase_date), 'yyyy-MM-dd') : '－'}</TableCell>
                                            <TableCell>{asset.location || '－'}</TableCell>
                                            <TableCell>{asset.owner || '－'}</TableCell>
                                            <TableCell align="center">
                                                <Stack direction="row" spacing={1} justifyContent="center">
                                                    <Button variant="outlined" size="small" onClick={() => handleEditOpen(asset)}>編集</Button>
                                                    {statusFilter === '' && (
                                                        <>
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                disabled={isDisabled}
                                                                onClick={() => handleLendOpen(asset)}
                                                            >
                                                                {buttonText}
                                                            </Button>
                                                            <Button
                                                                variant="contained"
                                                                color="error"
                                                                disabled={asset.status_id === 5}
                                                                onClick={() => handleDisposeOpen(asset)}
                                                            >
                                                                廃棄
                                                            </Button>
                                                        </>
                                                    )}
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                    <Button variant="outlined" onClick={() => setScreen(SCREENS.ASSET_MENU)} sx={{ borderRadius: 3, px: 4, fontWeight: 600 }}>
                        戻る
                    </Button>
                </Stack>
            </Card>

            {/* 編集ダイアログ */}
            <Dialog open={editOpen} onClose={handleEditClose} fullWidth maxWidth="xs">
                <DialogTitle>
                    {isDisposedEditLock
                        ? '個別資産の編集（備考のみ変更可）'
                        : '個別資産の編集'}
                </DialogTitle>
                <DialogContent sx={{ pt: '10px !important' }}>
                    <Typography variant="subtitle1" gutterBottom>
                        {selectedAsset?.name} ({selectedAsset?.model_number})
                    </Typography>
                    <TextField
                        label="シリアル番号 (編集不可)"
                        value={selectedAsset?.serial_number || ''}
                        fullWidth margin="dense"
                        disabled
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                    <TextField
                        label="購入日 (編集不可)"
                        value={selectedAsset?.purchase_date ? format(new Date(selectedAsset.purchase_date), 'yyyy-MM-dd') : '－'}
                        fullWidth
                        disabled
                        margin="dense"
                        InputProps={{
                            readOnly: true,
                        }}
                    />

                    <FormControl fullWidth margin="dense" disabled={isDisposedEditLock}>
                        <InputLabel id="status-select-label">状態</InputLabel>
                        <Select
                            labelId="status-select-label"
                            label="状態"
                            value={selectedAsset?.status_id || ''}
                            onChange={(e) => {
                                if (!isDisposedEditLock) {
                                    handleChange('status_id', e.target.value);
                                }
                            }}
                        >
                            {statusList.map((status) => {
                                // 貸出中・廃棄済みは選択不可（現在その状態のときのみ表示）
                                const isExcluded = status.id === 4 || status.id === 5;
                                const isCurrent = selectedAsset?.status_id === status.id;
                                if (isExcluded && !isCurrent) return null;
                                return (
                                    <MenuItem key={status.id} value={status.id} disabled={isExcluded}>
                                        {status.name}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>


                    <TextField
                        label="保管場所"
                        value={selectedAsset?.location || ''}
                        onChange={(e) => handleChange('location', e.target.value)}
                        fullWidth margin="dense"
                        disabled={isDisposedEditLock}
                    />
                    <TextField
                        label="使用者"
                        value={selectedAsset?.owner || ''}
                        onChange={(e) => handleChange('owner', e.target.value)}
                        fullWidth margin="dense"
                        disabled={isDisposedEditLock}
                    />
                    <TextField
                        label="個数(追加の場合は&quot;既存＋追加数&quot;)"
                        value={selectedAsset?.quantity || ''}
                        disabled={isDisposedEditLock || !!selectedAsset?.serial_number}
                        onChange={(e) => handleChange('quantity', e.target.value)}
                        fullWidth margin="dense"
                    />
                    <TextField
                        label="備考"
                        value={selectedAsset?.notes || ''}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        multiline rows={3}
                        fullWidth margin="dense"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditClose}>キャンセル</Button>
                    <Button variant="contained" onClick={handleEditSave}>
                        保存
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 貸出ダイアログ */}
            <Dialog open={lendOpen} onClose={handleLendClose} fullWidth maxWidth="xs">
                <DialogTitle>備品を貸出</DialogTitle>
                <DialogContent sx={{ pt: '10px !important' }}>
                    <Typography variant="subtitle1" gutterBottom>
                        {selectedAsset?.name} ({selectedAsset?.model_number})
                    </Typography>
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        name="borrower"
                        label="貸出先 (Borrower)"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={lendingInfo.borrower}
                        onChange={handleLendingInfoChange}
                    />
                    <TextField
                        required
                        margin="dense"
                        name="quantity"
                        label="数量 (Quantity)"
                        type="number"
                        fullWidth
                        variant="outlined"
                        // シリアル番号がある資産は数量1で固定
                        disabled={!!selectedAsset?.serial_number}
                        value={lendingInfo.quantity}
                        onChange={handleLendingInfoChange}
                        InputProps={{ inputProps: { min: 1, max: selectedAsset?.quantity } }}
                    />
                    <TextField
                        margin="dense"
                        name="expected_return_date"
                        label="返却予定日"
                        type="date"
                        fullWidth
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                        value={lendingInfo.expected_return_date}
                        onChange={handleLendingInfoChange}
                    />
                    <TextField
                        margin="dense"
                        name="notes"
                        label="備考"
                        type="text"
                        multiline
                        rows={2}
                        fullWidth
                        variant="outlined"
                        value={lendingInfo.notes}
                        onChange={handleLendingInfoChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleLendClose}>キャンセル</Button>
                    <Button variant="contained" onClick={handleLendConfirm}>貸出実行</Button>
                </DialogActions>
            </Dialog>

            {/* 廃棄登録ダイアログ */}
            <Dialog open={disposeOpen} onClose={handleDisposeClose} fullWidth maxWidth="xs">
                <DialogTitle>廃棄</DialogTitle>
                <DialogContent sx={{ pt: '10px !important' }}>
                    <Typography variant="subtitle1" gutterBottom>
                        {selectedAsset?.name} ({selectedAsset?.model_number})
                    </Typography>
                    <TextField
                        label="シリアル番号 (編集不可)"
                        disabled
                        value={selectedAsset?.serial_number || ''}
                        fullWidth margin="dense"
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                    <TextField
                        label="購入日 (編集不可)"
                        value={selectedAsset?.purchase_date ? format(new Date(selectedAsset.purchase_date), 'yyyy-MM-dd') : '－'}
                        fullWidth
                        disabled
                        margin="dense"
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                    <TextField
                        label="廃棄数量"
                        required
                        type="number"
                        value={disposalInfo.quantity}
                        onChange={e => setDisposalInfo(info => ({ ...info, quantity: e.target.value }))}
                        fullWidth margin="dense"
                        disabled={selectedAsset?.serial_number}
                    />
                    <TextField
                        label="廃棄登録者 (学籍番号)"
                        required
                        value={disposalInfo.processed_by}
                        onChange={e => setDisposalInfo(info => ({ ...info, processed_by: e.target.value }))}
                        fullWidth margin="dense"
                    />
                    <TextField
                        label="廃棄理由"
                        required
                        value={disposalInfo.reason}
                        onChange={e => setDisposalInfo(info => ({ ...info, reason: e.target.value }))}
                        multiline rows={3}
                        fullWidth margin="dense"
                    />

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDisposeClose}>キャンセル</Button>
                    <Button variant="contained" color="error" onClick={handleDisposeConfirm}>廃棄登録</Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
}

export default AssetListScreen;
