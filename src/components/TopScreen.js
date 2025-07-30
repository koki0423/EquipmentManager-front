/* eslint-disable */
import { useState, useEffect } from 'react';
import {
    Button, Typography, Card, CircularProgress, Box, Fade, Stack
} from '@mui/material';
import { CheckCircle, NfcRounded } from '@mui/icons-material';
import { SCREENS } from '../constants';

import { NFCPortLib, Configuration, DetectionOption } from '../NFCPortLib.js';
import Encoding from 'encoding-japanese';
import toast from 'react-hot-toast';

// --- ヘルパー関数 (学生証読み取りに必須) ---
function _array_copy(dest, dest_offset, src, src_offset, length) {
    for (let idx = 0; idx < length; idx++) {
        dest[dest_offset + idx] = src[src_offset + idx];
    }
}
// --------------------

const TopScreen = ({ setScreen, setAuthInfo }) => { // setAuthInfoで認証情報を親に渡す
    // --- State定義 ---
    // studentIdは読み取り成功後に一瞬表示するために使用
    const [studentId, setStudentId] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [retryCounter, setRetryCounter] = useState(0);

    // --- スクロール禁止用 ---
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    // isScanningがtrueになったらNFC読み取りを開始
    useEffect(() => {
        if (!isScanning) return;

        const startNfcScan = async () => {
            let lib = null;
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

                    setStudentId(id);       // 画面にIDを表示
                    setIsScanning(false);   // スキャン中フラグをOFF
                    toast.success(`ようこそ、${id}さん！`);

                    // 1.5秒後にメニュー画面へ遷移
                    setTimeout(() => {
                        // 親コンポーネントに認証情報（学籍番号）を渡す
                        setAuthInfo({ studentId: id });
                        // メニュー画面へ遷移
                        setScreen(SCREENS.MENU_SCREEN); // 仮の定数名
                    }, 1500);

                } else {
                    throw new Error('カードから有効なデータが取得できませんでした。');
                }

            } catch (error) {
                console.error(`リトライ ${retryCounter + 1}回目:`, error);
                if (retryCounter >= 9) {
                    toast.error('カードを読み取れませんでした。リーダーに問題がある可能性があります。');
                    setIsScanning(false);
                    setRetryCounter(0);
                } else {
                    setTimeout(() => {
                        setRetryCounter(currentCount => currentCount + 1);
                    }, 2000);
                }
            } finally {
                if (lib) {
                    await lib.close();
                }
            }
        };

        startNfcScan();

    }, [isScanning, retryCounter, setScreen, setAuthInfo]); // setScreen, setAuthInfo を依存配列に追加

    return (
        <Box
            sx={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                minHeight: '100dvh', bgcolor: '#f6f8fb',
            }}
        >
            <Card
                sx={{
                    p: 4, maxWidth: 420, width: '100%', mx: 'auto', borderRadius: 4,
                    boxShadow: 8, textAlign: 'center', bgcolor: 'white'
                }}
            >
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, pb: 1, borderBottom: '2px solid #e0e3e7' }}>
                    備品管理システム
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    学生証をリーダーにかざしてください
                </Typography>

                {/* 状態に応じて表示が変わるエリア */}
                <Box sx={{ minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    {
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
                        studentId ? ( // 読み取り成功後
                            <Fade in={true}>
                                <Box>
                                    <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                                    <Typography color="text.secondary" sx={{ mb: 0.5 }}>
                                        認証が完了しました
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: 2, fontFamily: 'monospace' }}>
                                        {studentId}
                                    </Typography>
                                </Box>
                            </Fade>
                        ) : ( // 初期状態
                            <Fade in={true}>
                                <Stack spacing={2} alignItems="center">
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={() => {
                                            setRetryCounter(0);
                                            setIsScanning(true);
                                        }}
                                        sx={{ borderRadius: 3, px: 4, py: 2, fontWeight: 600, fontSize: '1.2rem', minWidth: 300 }}
                                    >
                                        <NfcRounded sx={{ mr: 1.5 }} />
                                        スキャン開始
                                    </Button>
                                </Stack>
                            </Fade>
                        )
                    }
                </Box>
                {/* エラーメッセージ用の余白だけ確保 */}
                <Box sx={{ minHeight: 24, mt: 1, mb: 1 }} />
            </Card>
        </Box>
    );
};

export default TopScreen;