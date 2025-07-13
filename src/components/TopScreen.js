import React, { useEffect, useState, useRef } from 'react';
import {
  Button,
  Typography,
  Stack,
  Card,
  CardContent,
  CardActions,
  Box
} from '@mui/material';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import { SCREENS } from '../constants';

const REQUIRED_CLICKS = 7;
const CLICK_TIMEOUT = 1000;

const TopScreen = ({ setScreen }) => {
  // スクロール禁止
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const [clickCount, setClickCount] = useState(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleIconClick = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);

    if (newClickCount >= REQUIRED_CLICKS) {
      setClickCount(0);
      setScreen(SCREENS.DEVELOPER_TOP);
    } else {
      timeoutRef.current = setTimeout(() => {
        setClickCount(0);
      }, CLICK_TIMEOUT);
    }
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
          maxWidth: 420,
          width: '100%',
          mx: 'auto',
          borderRadius: 4,
          boxShadow: 8,
          textAlign: 'center',
          bgcolor: 'white'
        }}
      >
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <Inventory2RoundedIcon
              sx={{ fontSize: 48, color: 'primary.main' }}
              onClick={handleIconClick}
            />
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 1,
              pb: 1,
              borderBottom: '2px solid #e0e3e7'
            }}
          >
            備品管理システム
          </Typography>
          <Typography sx={{ mb: 3, mt: 1 }} color="text.secondary">
            学生証を使って備品登録ができます
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: 'center', mt: 1 }}>
          <Stack spacing={2} direction="column">
            <Button
              variant="contained"
              size="large"
              onClick={() => setScreen(SCREENS.REGISTER_FORM)}
              fullWidth
              sx={{
                borderRadius: 3,
                px: 4,
                minWidth: 300,
                fontWeight: 600,
                fontSize: '1.1rem',
                boxShadow: 3,
                transition: 'all 0.2s',
              }}
            >
              登録
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={() => setScreen(SCREENS.ASSET_LIST)}
              fullWidth
              sx={{
                borderRadius: 3,
                px: 4,
                minWidth: 300,
                fontWeight: 600,
                fontSize: '1.1rem',
                boxShadow: 3,
                transition: 'all 0.2s',
              }}
            >
              備品一覧
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={() => setScreen(SCREENS.LEND_LIST)}
              fullWidth
              sx={{
                borderRadius: 3,
                px: 4,
                minWidth: 300,
                fontWeight: 600,
                fontSize: '1.1rem',
                boxShadow: 3,
                transition: 'all 0.2s',
              }}
            >
              貸出一覧
            </Button>
          </Stack>
        </CardActions>
      </Card>
    </Box >
  );
};

export default TopScreen;
