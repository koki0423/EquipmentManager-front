/* eslint-disable */
import React, { useState, useEffect } from 'react';
import {
    Button, Typography, Card, CircularProgress, Box, Fade, Stack
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { SCREENS } from '../constants';
import { API_BASE_URL } from '../config';

import { NFCPortLib, Configuration, DetectionOption } from '../NFCPortLib.js';
import Encoding from 'encoding-japanese';
import toast from 'react-hot-toast';


// --- ヘルパー関数 ---
function _array_tohexs(array) {
    if (!array || array.length === 0) return '';
    return Array.from(array).map(byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
}
function _array_copy(dest, dest_offset, src, src_offset, length) {
    for (let idx = 0; idx < length; idx++) {
        dest[dest_offset + idx] = src[src_offset + idx];
    }
}
// --------------------

function buildApiRequestBody(inputJson, studentId) {
    const nowDate = new Date().toISOString().slice(0, 10);
    return {
        name: inputJson.name,
        management_category_id: inputJson.management_category_id,
        genre_id: inputJson.genre_id,
        manufacturer: inputJson.manufacturer,
        model_number: inputJson.model_number,
        asset_master_id: 0,
        quantity: inputJson.quantity,
        serial_number: inputJson.serial_number,
        status_id: 1,
        purchase_date: inputJson.purchase_date,
        owner: studentId,
        default_location: inputJson.default_location,
        last_check_date: nowDate,
        last_checker: studentId,
        notes: inputJson.notes,
    }
}


const RegisterExecuteScreen = ({ inputJson, setScreen }) => {
    // --- State定義 ---
    const [studentId, setStudentId] = useState('');
    const [isScanning, setIsScanning] = useState(false); // スキャン中かどうかのフラグ
    const [errorMsg, setErrorMsg] = useState(''); // エラーメッセージ用
    const [retryCounter, setRetryCounter] = useState(0);

    // --- スクロール禁止用 ---
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    // isScanningがtrueに変わったことを"キッカケ"にNFC読み取り処理を自動実行する
    useEffect(() => {
        if (!isScanning) return;

        const startNfcScan = async () => {
            let lib = null;
            // エラーメッセージは毎回リセット
            setErrorMsg('');

            try {
                lib = new NFCPortLib();
                const config = new Configuration(500, 500, true, true);
                await lib.init(config);
                await lib.open();

                const detectOption = new DetectionOption(new Uint8Array([0x82, 0x77]), 0, true, false, null);
                const card = await lib.detectCard('iso18092', detectOption);

                const readStudentIdCommand = new Uint8Array([16, 0x06, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0x0b, 0x01, 1, 0x80, 0x00]);
                _array_copy(readStudentIdCommand, 2, card.idm, 0, card.idm.length);

                const response = await lib.communicateThru(readStudentIdCommand, 100, detectOption);

                if (response.length > 13) {
                    const blockData = response.slice(13);
                    const decodedString = Encoding.convert(blockData, { to: 'UNICODE', from: 'SJIS', type: 'string' });
                    const id = decodedString.substring(3, 10);
                    setStudentId(id);
                    setIsScanning(false); // 成功したのでスキャンを停止
                } else {
                    throw new Error('カードから有効なデータが取得できませんでした。');
                }

            } catch (error) {
                console.error(`リトライ ${retryCounter + 1}回目:`, error);

                // リトライ回数が上限（例: 9回 = 10回試行）に達した場合
                if (retryCounter >= 9) {
                    toast.error('カードを読み取れませんでした。リーダーに問題があるか、カードが対応していない可能性があります。');
                    setIsScanning(false); // スキャン処理を完全に停止
                    setRetryCounter(0);   // カウンターをリセット
                } else {
                    setTimeout(() => {
                        setRetryCounter(currentCount => currentCount + 1);
                    }, 2000); // リトライ間隔を2秒
                }

            } finally {
                if (lib) {
                    await lib.close();
                }
            }
        };

        startNfcScan();

    }, [isScanning, retryCounter]);

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
                    p: 4, maxWidth: 420, width: '100%', mx: 'auto', borderRadius: 4,
                    boxShadow: 8, textAlign: 'center', bgcolor: 'white'
                }}
            >
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, pb: 1, borderBottom: '2px solid #e0e3e7' }}>
                    登録実行
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    学生証をリーダーにかざしてください
                </Typography>

                {/* 状態に応じて表示が変わるエリア */}
                <Box sx={{ minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    {
                        // スキャン中か？
                        isScanning ? (
                            <Fade in={true}>
                                <Box>
                                    <CircularProgress size={52} thickness={4} />
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                        スキャン中...
                                    </Typography>
                                </Box>
                            </Fade>
                        ) :
                            // スキャン完了したか？
                            studentId ? (
                                <Fade in={true}>
                                    <Box>
                                        <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                                        <Typography color="text.secondary" sx={{ mb: 0.5 }}>
                                            学生証の読み取り完了
                                        </Typography>
                                        <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: 2, fontFamily: 'monospace' }}>
                                            {studentId}
                                        </Typography>
                                    </Box>
                                </Fade>
                            ) :
                                // それ以外（初期状態）
                                (
                                    <Fade in={true}>
                                        <Stack spacing={2} alignItems="center">
                                            <Button
                                                variant="contained"
                                                size="large"
                                                onClick={() => {
                                                    setRetryCounter(0);
                                                    setIsScanning(true);
                                                }}
                                                sx={{ borderRadius: 3, px: 4, fontWeight: 600, fontSize: '1.1rem' }}
                                            >
                                                <span role="img" aria-label="scan" style={{ marginRight: '8px' }}>📷</span>
                                                学生証のスキャンを開始
                                            </Button>
                                        </Stack>
                                    </Fade>
                                )
                    }
                </Box>

                {/* エラーメッセージ表示エリア */}
                <Box sx={{ minHeight: 24, mt: -2, mb: 2 }}>
                    {errorMsg && (
                        <Typography color="error" variant="caption">
                            {errorMsg}
                        </Typography>
                    )}
                </Box>

                {/* 登録ボタン */}
                <Button
                    variant="contained"
                    size="large"
                    disabled={!studentId}
                    onClick={async () => {
                        if (!studentId) return;

                        const requestBody = buildApiRequestBody(inputJson, studentId);
                        try {
                            const res = await fetch(`${API_BASE_URL}/api/v1/assets`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(requestBody),
                            });
                            if (!res.ok) throw new Error('登録失敗');
                            setScreen(SCREENS.COMPLETE);
                        } catch (e) {
                            alert('登録に失敗しました: ' + e.message);
                        }
                    }}
                    sx={{ /* 省略 */ }}
                >
                    登録
                </Button>
            </Card>
        </Box>
    );
};

export default RegisterExecuteScreen;