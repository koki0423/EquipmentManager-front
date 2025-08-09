import React, { useEffect, useState } from 'react';
import {
    Typography, Card, CircularProgress, Box
} from '@mui/material';
import { SCREENS } from '../../../constants';
import { API_BASE_URL } from '../../../config';
import { PRINT_API_URL } from '../../../config';

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

async function PrintLabel(inputJson, managementNumber, width, type) {
    const genreList = ['個人', '事務', 'ファシリティ', '組込みシステム', '高度情報演習'];
    const genreName = genreList[inputJson.genre_id - 1] || '未入力';

    const printJsonRequest = {
        config: {
            use_halfcut: true,
            confirm_tape_width: false,
            enable_print_log: true
        },
        label: {
            checked: true,
            col_b: inputJson.name,
            col_c: genreName,
            col_d: managementNumber,
            col_e: managementNumber
        },
        width: width,
        type: type
    }

    try {
        const res = await fetch(`${PRINT_API_URL}/print`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(printJsonRequest),
        });

        if (!res.ok) {
            throw new Error('印刷サーバーでエラーが発生しました。');
        }

        console.log('印刷成功');

    } catch (e) {
        console.error('印刷失敗:', e);
        alert('印刷に失敗しました。');
    }
}

const RegisterExecuteScreen = ({ inputJson, setScreen, authInfo, tapeWidth, codeType }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // スクロール禁止用
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    useEffect(() => {
        if (!authInfo?.studentId || !inputJson) {
            setError('登録情報が不足しています。');
            setIsLoading(false);
            return;
        }

        const executeRegistration = async () => {
            setIsLoading(true);
            setError(null);

            const requestBody = buildApiRequestBody(inputJson, authInfo.studentId);

            try {
                const res = await fetch(`${API_BASE_URL}/api/v1/assets`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || 'サーバーでエラーが発生しました。');
                }

                const resJson = await res.json();
                console.log('印刷ジョブ:', resJson['management_number'], tapeWidth, codeType);
                PrintLabel(inputJson, resJson['management_number'], tapeWidth, codeType);

                // 成功したら完了画面へ
                setScreen(SCREENS.COMPLETE);

            } catch (e) {
                console.error('登録失敗:', e);
                setError(e.message || '登録に失敗しました。');
                setIsLoading(false);
            }
        };

        executeRegistration();
    }, []);

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100dvh', bgcolor: '#f6f8fb' }}>
            <Card sx={{ p: 4, maxWidth: 420, width: '100%', mx: 'auto', borderRadius: 4, boxShadow: 8, textAlign: 'center', bgcolor: 'white' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                    備品を登録中...
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    {isLoading ? (
                        <CircularProgress />
                    ) : (
                        <Typography color="error">
                            {error}
                        </Typography>
                    )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                    しばらくお待ちください
                </Typography>
            </Card>
        </Box>
    );
};

export default RegisterExecuteScreen;