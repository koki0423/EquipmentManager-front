import React, { useEffect } from 'react';
import { format } from 'date-fns/format';
import {
    Button,
    Typography,
    Stack,
    Card,
    List,
    ListItem,
    ListItemText,
    Box,
} from '@mui/material';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import { SCREENS } from '../../../constants';

const genreList = ['個人', '事務', 'ファシリティ', '組込みシステム', '高度情報演習'];
const RegisterConfirmScreen = ({ inputJson, setScreen }) => {
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
                    maxWidth: 420,
                    width: '100%',
                    mx: 'auto',
                    borderRadius: 4,
                    boxShadow: 8,
                    textAlign: 'center',
                    bgcolor: 'white',
                }}
            >
                <Box sx={{ mb: 2 }}>
                    <AssignmentTurnedInRoundedIcon sx={{ fontSize: 44, color: 'primary.main' }} />
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
                    登録内容の確認
                </Typography>
                <List sx={{ mt: 2, mb: 2, textAlign: 'left' }}>
                    <ListItem>
                        <ListItemText
                            primary="区分"
                            secondary={inputJson?.management_category_id === 1 ? '個別管理' : '一括管理'}
                            primaryTypographyProps={{ fontWeight: 700, fontSize: '1.1rem' }}
                            secondaryTypographyProps={{ fontWeight: 600, fontSize: '1.08rem' }}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="備品名"
                            secondary={inputJson?.name || '未入力'}
                            primaryTypographyProps={{ fontWeight: 700, fontSize: '1.1rem' }}
                            secondaryTypographyProps={{ fontWeight: 600, fontSize: '1.08rem' }}
                        />
                    </ListItem>

                    <ListItem>
                        <ListItemText
                            primary="メーカー"
                            secondary={inputJson?.manufacturer || '未入力'}
                            primaryTypographyProps={{ fontWeight: 700, fontSize: '1.1rem' }}
                            secondaryTypographyProps={{ fontWeight: 600, fontSize: '1.08rem' }}
                        />
                    </ListItem>
                    {inputJson?.management_category_id === 1 && (
                        <ListItem>
                            <ListItemText
                                primary="シリアル番号"
                                secondary={inputJson?.serial_number || '未入力'}
                                primaryTypographyProps={{ fontWeight: 700, fontSize: '1.1rem' }}
                                secondaryTypographyProps={{ fontWeight: 600, fontSize: '1.08rem' }}
                            />
                        </ListItem>
                    )}
                    {inputJson?.management_category_id === 2 && (
                        <ListItem>
                            <ListItemText
                                primary="個数"
                                secondary={inputJson?.quantity || '未入力'}
                                primaryTypographyProps={{ fontWeight: 700, fontSize: '1.1rem' }}
                                secondaryTypographyProps={{ fontWeight: 600, fontSize: '1.08rem' }}
                            />
                        </ListItem>
                    )}

                    <ListItem>
                        <ListItemText
                            primary="備品ジャンル"
                            secondary={
                                inputJson?.genre_id
                                    ? genreList[inputJson.genre_id - 1]
                                    : '未入力'
                            }
                            primaryTypographyProps={{ fontWeight: 700, fontSize: '1.1rem' }}
                            secondaryTypographyProps={{ fontWeight: 600, fontSize: '1.08rem' }}
                        />
                    </ListItem>
                    <ListItem>
                            <ListItemText
                                primary="保管場所（所有者）"
                                secondary={inputJson?.default_location || '未入力'}
                                primaryTypographyProps={{ fontWeight: 700, fontSize: '1.1rem' }}
                                secondaryTypographyProps={{ fontWeight: 600, fontSize: '1.08rem' }}
                            />
                        </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="購入日"
                            secondary={
                                inputJson?.purchase_date
                                    ? format(new Date(inputJson.purchase_date), 'yyyy年M月d日')
                                    : '未入力'
                            }
                            primaryTypographyProps={{ fontWeight: 700, fontSize: '1.1rem' }}
                            secondaryTypographyProps={{ fontWeight: 600, fontSize: '1.08rem' }}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="備考"
                            secondary={inputJson?.notes || 'なし'}
                            primaryTypographyProps={{ fontWeight: 700, fontSize: '1.1rem' }}
                            secondaryTypographyProps={{ fontWeight: 600, fontSize: '1.08rem' }}
                        />
                    </ListItem>
                </List>
                <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mt: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={() => setScreen(SCREENS.REGISTER_FORM)}
                        sx={{
                            borderRadius: 3,
                            px: 4,
                            fontWeight: 600,
                            fontSize: '1.05rem',
                            color: 'primary.main',
                            borderColor: 'primary.main',
                            bgcolor: 'white',
                            '&:hover': { bgcolor: '#f1f7fb', borderColor: 'primary.dark' },
                        }}
                    >
                        戻る
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => setScreen(SCREENS.REGISTER_EXECUTE)}
                        sx={{
                            borderRadius: 3,
                            px: 4,
                            fontWeight: 600,
                            fontSize: '1.08rem',
                            boxShadow: 3,
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'primary.dark' },
                        }}
                    >
                        次へ
                    </Button>
                </Stack>
            </Card>
        </Box>
    );

};

export default RegisterConfirmScreen;
