import {
  Button,
  Typography,
  Stack,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  Box,
  Autocomplete,
} from '@mui/material';
import { SCREENS } from '../../../constants';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';

const RegisterFormScreen = ({ formData, setFormData, setInputJson, setScreen }) => {
  // スクロール禁止
  // useEffect(() => {
  //   document.body.style.overflow = 'hidden';
  //   return () => {
  //     document.body.style.overflow = 'auto';
  //   };
  // }, []);

  const genreList = [
    { id: 1, name: '個人' },
    { id: 2, name: '事務' },
    { id: 3, name: 'ファシリティ' },
    { id: 4, name: '組込みシステム' },
    { id: 5, name: '高度情報演習' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (event, newType) => {
    if (newType !== null) {
      setFormData((prev) => ({ ...prev, type: newType }));
    }
  };

  const handleNext = () => {
    if (!formData.name) {
      alert('備品名は必須です。');
      return;
    }
    if (!formData.genre) {
      alert('備品ジャンルは必須です。');
      return;
    }
    if (!formData.model_number) {
      alert('型番は必須です。');
      return;
    }

    // 区分：値を1または2へ変換
    let managementCategoryId = null;
    if (formData.type === 'required') {
      managementCategoryId = 1;
    } else if (formData.type === 'not_required') {
      managementCategoryId = 2;
    }

    const genreId = formData.genre ? formData.genre.id : null;

    // API用のJson
    const inputJson = {
      name: formData.name,
      management_category_id: managementCategoryId,
      genre_id: genreId,
      manufacturer: formData.manufacturer,
      model_number: formData.model_number,
      quantity: formData.type === 'not_required' ? Number(formData.quantity) : 1,
      serial_number: formData.type === 'required' ? formData.serial_number : null,
      default_location: formData.default_location,
      purchase_date: formData.purchaseDate || null,
      notes: formData.notes || null,
    };

    setInputJson(inputJson);
    setScreen(SCREENS.REGISTER_CONFIRM);
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
          bgcolor: 'white',
        }}
      >
        <Box sx={{ mb: 2 }}>
          <CategoryRoundedIcon sx={{ fontSize: 44, color: 'primary.main' }} />
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
          備品登録
        </Typography>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1, textAlign: 'left' }}
            >
              区分<br />（PCなどは個別管理、部品などは一括管理を選択してください）
            </Typography>
            <ToggleButtonGroup
              color="primary"
              value={formData.type}
              exclusive
              onChange={handleTypeChange}
              fullWidth
              sx={{
                borderRadius: 3,
                boxShadow: 1,
              }}
            >
              <ToggleButton
                value="required"
                sx={{
                  borderRadius: 3,
                  fontWeight: 700,
                  py: 1.5,
                  fontSize: '1rem'
                }}
              >
                個別管理
              </ToggleButton>
              <ToggleButton
                value="not_required"
                sx={{
                  borderRadius: 3,
                  fontWeight: 700,
                  py: 1.5,
                  fontSize: '1rem'
                }}
              >
                一括管理
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <TextField
            label="備品名"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            fullWidth
            InputProps={{ sx: { borderRadius: 2 } }}
          />
          <TextField
            label="メーカー"
            name="manufacturer"
            value={formData.manufacturer || ''}
            onChange={handleChange}
            fullWidth
            required
          />

          <TextField
            label="型番"
            name="model_number"
            value={formData.model_number || ''}
            onChange={handleChange}
            fullWidth
            required
          />

          {formData.type === 'required' && (
            <TextField
              label="シリアル番号"
              name="serial_number"
              value={formData.serial_number || ''}
              onChange={handleChange}
              fullWidth
              required
            />
          )}

          {formData.type === 'not_required' && (
            <TextField
              label="個数"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              required
              fullWidth
            />
          )}

            <TextField
              label="保管場所または所有者"
              name="default_location"
              value={formData.default_location || ''}
              onChange={handleChange}
              fullWidth
              required
            />

          <Autocomplete
            options={genreList}
            // オブジェクトの`name`プロパティを表示ラベルとして使用する
            getOptionLabel={(option) => option.name || ''}

            // どのオブジェクトが選択されているかを`id`で比較
            isOptionEqualToValue={(option, value) => option.id === value.id}

            // valueにはオブジェクト全体、またはnullが入る
            value={formData.genre}
            onChange={(e, newValue) =>
              setFormData(prev => ({ ...prev, genre: newValue }))
            }

            renderInput={(params) => (
              <TextField
                {...params}
                label="備品ジャンル"
                required
                fullWidth
              />
            )}
            sx={{ mb: 1 }}
          />

          <TextField
            label="購入日"
            name="purchaseDate"
            type="date"
            value={formData.purchaseDate || ''}
            onChange={handleChange}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
            InputProps={{ sx: { borderRadius: 2 } }}
          />

          <TextField
            label="備考"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            multiline
            rows={2}
            fullWidth
            InputProps={{ sx: { borderRadius: 2, fontSize: '0.92rem' } }}
            InputLabelProps={{ shrink: true }}
          />

          <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setScreen(SCREENS.ASSET_MENU)}
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
              onClick={handleNext}
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
        </Stack>
      </Card>
    </Box>
  );
};

export default RegisterFormScreen;
