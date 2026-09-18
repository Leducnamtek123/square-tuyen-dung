'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  CircularProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import RouterOutlinedIcon from '@mui/icons-material/RouterOutlined';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import NetworkCheckOutlinedIcon from '@mui/icons-material/NetworkCheckOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';

import {
  useHrmBiometricDevices,
  useHrmWorkLocations,
  useHrmMutations,
} from '../../hooks/useHrmQueries';
import { NativeBiometricDevice, NativeWorkLocation } from '@/services/hrmService';
import { TabTitle } from '@/utils/generalFunction';
import { confirmModal } from '@/utils/sweetalert2Modal';
import pc from '@/utils/muiColors';

const inputSx = {
  '& .MuiOutlinedInput-root': {
    minHeight: 40,
    borderRadius: 2,
    backgroundColor: 'background.paper',
    '& fieldset': { borderColor: pc.divider(0.95) },
    '&:hover': { backgroundColor: pc.bgDefault(0.45) },
    '&:hover fieldset': { borderColor: pc.primary(0.35) },
    '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 1 },
  },
  '& .MuiInputBase-input': {
    fontSize: '0.875rem',
    py: '8px',
  },
};

const PROTOCOL_OPTIONS = [
  { value: 'ZKTECO_PULL', label: 'ZKTeco Kéo dữ liệu qua cổng 4370' },
  { value: 'ZKTECO_PUSH', label: 'ZKTeco Đẩy tự động qua cổng 4200' },
  { value: 'HIKVISION', label: 'Hikvision ISUP hoặc ISAPI' },
  { value: 'CAMERA_AI', label: 'Camera AI nhận diện khuôn mặt' },
  { value: 'OTHER', label: 'Thiết bị khác' },
];

const DIRECTION_OPTIONS = [
  { value: 'BOTH', label: 'Cả vào và ra' },
  { value: 'IN', label: 'Chỉ quẹt vào' },
  { value: 'OUT', label: 'Chỉ quẹt ra' },
];

const LOCATION_TYPE_OPTIONS = [
  { value: 'HEADQUARTERS', label: 'Trụ sở chính' },
  { value: 'BRANCH', label: 'Chi nhánh' },
  { value: 'FACTORY', label: 'Nhà xưởng hoặc Nhà máy' },
  { value: 'WAREHOUSE', label: 'Kho hàng' },
  { value: 'RETAIL', label: 'Điểm bán lẻ hoặc Cửa hàng' },
  { value: 'OTHER', label: 'Khác' },
];

export default function DeviceListPage() {
  TabTitle('Quản lý Danh mục Thiết bị Chấm công | InfoHR');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Queries
  const { data: devices = [], isLoading: loadingDevices, refetch: refetchDevices } = useHrmBiometricDevices();
  const { data: locations = [], isLoading: loadingLocations, refetch: refetchLocations } = useHrmWorkLocations();
  const {
    createBiometricDevice,
    updateBiometricDevice,
    deleteBiometricDevice,
    testDeviceConnection,
    syncDevice,
    createWorkLocation,
  } = useHrmMutations();

  // Device Modal State
  const [openDeviceModal, setOpenDeviceModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<NativeBiometricDevice | null>(null);
  const [deviceForm, setDeviceForm] = useState<Partial<NativeBiometricDevice>>({
    name: '',
    device_code: '',
    location: undefined,
    protocol: 'ZKTECO_PULL',
    ip_or_domain: '',
    device_port: 4370,
    service_port: 4200,
    comm_key: '0',
    direction: 'BOTH',
    auto_sync_interval: 15,
  });

  // Work Location Modal State
  const [openLocationModal, setOpenLocationModal] = useState(false);
  const [locationForm, setLocationForm] = useState<Partial<NativeWorkLocation>>({
    name: '',
    code: '',
    location_type: 'BRANCH',
    address: '',
    city: '',
    radius_meters: 200,
    allowed_ip_ranges: '',
  });

  // Filtered devices
  const filteredDevices = useMemo(() => {
    return devices.filter((dev) => {
      if (selectedLocation !== 'ALL' && dev.location !== Number(selectedLocation)) {
        return false;
      }
      if (selectedStatus !== 'ALL' && dev.status !== selectedStatus) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = dev.name.toLowerCase().includes(term);
        const matchCode = (dev.device_code || '').toLowerCase().includes(term);
        const matchIp = (dev.ip_or_domain || '').toLowerCase().includes(term);
        const matchLoc = (dev.location_name || '').toLowerCase().includes(term);
        return matchName || matchCode || matchIp || matchLoc;
      }
      return true;
    });
  }, [devices, selectedLocation, selectedStatus, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const total = devices.length;
    const online = devices.filter((d) => d.status === 'ONLINE').length;
    const offline = devices.filter((d) => d.status === 'OFFLINE' || d.status === 'ERROR').length;
    const totalPunches = devices.reduce((sum, d) => sum + (d.total_punches_synced || 0), 0);
    return { total, online, offline, totalPunches };
  }, [devices]);

  // Handlers
  const handleOpenCreateDevice = () => {
    setEditingDevice(null);
    setDeviceForm({
      name: '',
      device_code: `DEV-${Date.now().toString().slice(-4)}`,
      location: locations[0]?.id || undefined,
      protocol: 'ZKTECO_PULL',
      ip_or_domain: '',
      device_port: 4370,
      service_port: 4200,
      comm_key: '0',
      direction: 'BOTH',
      auto_sync_interval: 15,
    });
    setOpenDeviceModal(true);
  };

  const handleOpenEditDevice = (dev: NativeBiometricDevice) => {
    setEditingDevice(dev);
    setDeviceForm({
      name: dev.name,
      device_code: dev.device_code,
      location: dev.location,
      protocol: dev.protocol,
      ip_or_domain: dev.ip_or_domain,
      device_port: dev.device_port,
      service_port: dev.service_port,
      comm_key: dev.comm_key,
      direction: dev.direction,
      auto_sync_interval: dev.auto_sync_interval,
    });
    setOpenDeviceModal(true);
  };

  const handleSubmitDevice = () => {
    if (!deviceForm.name || !deviceForm.ip_or_domain || !deviceForm.location) {
      return;
    }
    if (editingDevice) {
      updateBiometricDevice.mutate(
        { id: editingDevice.id, data: deviceForm },
        {
          onSuccess: () => {
            setOpenDeviceModal(false);
          },
        }
      );
    } else {
      createBiometricDevice.mutate(deviceForm, {
        onSuccess: () => {
          setOpenDeviceModal(false);
        },
      });
    }
  };

  const handleDeleteDevice = (id: number) => {
    confirmModal(
      () => {
        deleteBiometricDevice.mutate(id);
      },
      'Xóa thiết bị chấm công',
      'Bạn có chắc chắn muốn xóa thiết bị chấm công này khỏi danh mục theo dõi?',
      'warning'
    );
  };

  const handleTestConnection = (id: number) => {
    testDeviceConnection.mutate(id);
  };

  const handleSyncDevice = (id: number) => {
    syncDevice.mutate(id);
  };

  const handleCreateLocation = () => {
    if (!locationForm.name) return;
    createWorkLocation.mutate(locationForm, {
      onSuccess: () => {
        setOpenLocationModal(false);
        setLocationForm({
          name: '',
          code: '',
          location_type: 'BRANCH',
          address: '',
          city: '',
          radius_meters: 200,
          allowed_ip_ranges: '',
        });
      },
    });
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return (
          <Chip
            size="small"
            label="Đang kết nối"
            sx={{
              backgroundColor: '#DCFCE7',
              color: '#15803D',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        );
      case 'SYNCING':
        return (
          <Chip
            size="small"
            label="Đang đồng bộ"
            sx={{
              backgroundColor: '#E0F2FE',
              color: '#0369A1',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        );
      case 'ERROR':
        return (
          <Chip
            size="small"
            label="Lỗi kết nối"
            sx={{
              backgroundColor: '#FEE2E2',
              color: '#B91C1C',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        );
      default:
        return (
          <Chip
            size="small"
            label="Mất kết nối"
            sx={{
              backgroundColor: '#F1F5F9',
              color: '#475569',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        );
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', pb: 4 }}>
      {/* 1. Header Banner */}
      <Card
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2.5,
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ md: 'center' }}
        >
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RouterOutlinedIcon />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                Quản lý Danh mục Thiết bị Chấm công
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Quản lý danh sách máy chấm công theo từng trụ sở và chi nhánh, giám sát trạng thái kết nối thời gian thực và đồng bộ dữ liệu quẹt thẻ
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => setOpenLocationModal(true)}
              startIcon={<BusinessOutlinedIcon />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                borderColor: '#CBD5E1',
                color: '#334155',
                '&:hover': { borderColor: '#94A3B8', backgroundColor: '#F8FAFC' },
              }}
            >
              Quản lý Chi nhánh
            </Button>

            <Button
              variant="contained"
              onClick={handleOpenCreateDevice}
              startIcon={<AddIcon />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                backgroundColor: '#2563EB',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                '&:hover': { backgroundColor: '#1D4ED8' },
              }}
            >
              Thêm máy chấm công
            </Button>
          </Stack>
        </Stack>
      </Card>

      {/* 2. KPI Summary Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
            }}
          >
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
              Tổng số thiết bị
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.5 }}>
              {stats.total}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8', mt: 0.5, display: 'block' }}>
              Trên tất cả các trụ sở và chi nhánh
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
            }}
          >
            <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 600, textTransform: 'uppercase' }}>
              Đang kết nối bình thường
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#15803D', mt: 0.5 }}>
              {stats.online}
            </Typography>
            <Typography variant="caption" sx={{ color: '#16A34A', mt: 0.5, display: 'block' }}>
              Sẵn sàng đồng bộ quẹt thẻ
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
            }}
          >
            <Typography variant="caption" sx={{ color: '#B91C1C', fontWeight: 600, textTransform: 'uppercase' }}>
              Mất kết nối hoặc lỗi
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#DC2626', mt: 0.5 }}>
              {stats.offline}
            </Typography>
            <Typography variant="caption" sx={{ color: '#EF4444', mt: 0.5, display: 'block' }}>
              Cần kiểm tra nguồn và cổng mạng
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
            }}
          >
            <Typography variant="caption" sx={{ color: '#0369A1', fontWeight: 600, textTransform: 'uppercase' }}>
              Lượt quẹt đã thu thập
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0284C7', mt: 0.5 }}>
              {stats.totalPunches.toLocaleString('vi-VN')}
            </Typography>
            <Typography variant="caption" sx={{ color: '#0EA5E9', mt: 0.5, display: 'block' }}>
              Tổng bản ghi từ tất cả thiết bị
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* 3. Filter Bar */}
      <Card
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2.5,
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 4, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Tìm theo tên máy, mã máy, địa chỉ IP hoặc chi nhánh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94A3B8' }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={inputSx}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3, md: 3 }}>
            <TextField
              select
              fullWidth
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              sx={inputSx}
            >
              <MenuItem value="ALL">Tất cả chi nhánh và trụ sở</MenuItem>
              {locations.map((loc) => (
                <MenuItem key={loc.id} value={loc.id}>
                  {loc.name} {loc.code ? `- ${loc.code}` : ''}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 3, md: 3 }}>
            <TextField
              select
              fullWidth
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              sx={inputSx}
            >
              <MenuItem value="ALL">Tất cả trạng thái kết nối</MenuItem>
              <MenuItem value="ONLINE">Đang kết nối</MenuItem>
              <MenuItem value="OFFLINE">Mất kết nối</MenuItem>
              <MenuItem value="ERROR">Lỗi kết nối</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 2, md: 2 }}>
            <Button
              variant="outlined"
              color="inherit"
              fullWidth
              onClick={() => {
                refetchDevices();
                refetchLocations();
              }}
              startIcon={<RefreshIcon />}
              sx={{
                height: 40,
                borderRadius: 2,
                borderColor: '#CBD5E1',
                color: '#475569',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Làm mới
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* 4. Table */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 2.5,
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
        }}
      >
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#334155', fontSize: '0.8125rem' }}>Thiết bị</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#334155', fontSize: '0.8125rem' }}>Chi nhánh trực thuộc</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#334155', fontSize: '0.8125rem' }}>Giao thức & Địa chỉ kết nối</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#334155', fontSize: '0.8125rem' }}>Hướng quẹt</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#334155', fontSize: '0.8125rem' }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#334155', fontSize: '0.8125rem' }}>Lần đồng bộ cuối</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#334155', fontSize: '0.8125rem', textAlign: 'right' }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingDevices ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 5 }}>
                    <CircularProgress size={32} />
                    <Typography variant="body2" sx={{ color: '#64748B', mt: 1 }}>
                      Đang tải danh sách thiết bị chấm công...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredDevices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        backgroundColor: '#F1F5F9',
                        color: '#94A3B8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 1.5,
                      }}
                    >
                      <RouterOutlinedIcon sx={{ fontSize: 28 }} />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#334155' }}>
                      Chưa có thiết bị máy chấm công nào
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94A3B8', maxWidth: 420, mx: 'auto', mt: 0.5, mb: 2 }}>
                      Thêm máy chấm công để bắt đầu kết nối tự động với các thiết bị tại văn phòng, chi nhánh hoặc nhà máy
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleOpenCreateDevice}
                      startIcon={<AddIcon />}
                      sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                    >
                      Thêm máy chấm công đầu tiên
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDevices.map((dev) => (
                  <TableRow key={dev.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                        {dev.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        Mã máy: {dev.device_code || 'Chưa đặt'} {dev.model_name ? `• ${dev.model_name}` : ''}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                        {dev.location_name || 'Chưa gán chi nhánh'}
                      </Typography>
                      {dev.location_code && (
                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                          Mã: {dev.location_code}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#2563EB' }}>
                        {dev.ip_or_domain}:{dev.device_port}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        {dev.protocol_label || dev.protocol} • Mật mã: {dev.comm_key}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#334155' }}>
                        {dev.direction_label || (dev.direction === 'IN' ? 'Chỉ quẹt vào' : dev.direction === 'OUT' ? 'Chỉ quẹt ra' : 'Cả vào và ra')}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {getStatusChip(dev.status)}
                      {dev.last_error_message && (
                        <Typography variant="caption" sx={{ color: '#DC2626', display: 'block', mt: 0.5, maxWidth: 160 }} noWrap title={dev.last_error_message}>
                          {dev.last_error_message}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#334155' }}>
                        {dev.last_sync_time
                          ? new Date(dev.last_sync_time).toLocaleString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })
                          : 'Chưa đồng bộ'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                        Đã tải: {(dev.total_punches_synced || 0).toLocaleString('vi-VN')} bản ghi
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ textAlign: 'right' }}>
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Kiểm tra kết nối TCP socket hoặc ping">
                          <IconButton
                            size="small"
                            onClick={() => handleTestConnection(dev.id)}
                            disabled={testDeviceConnection.isPending}
                            sx={{ color: '#2563EB', '&:hover': { backgroundColor: '#EFF6FF' } }}
                          >
                            <NetworkCheckOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Kích hoạt đồng bộ kéo dữ liệu ngay">
                          <IconButton
                            size="small"
                            onClick={() => handleSyncDevice(dev.id)}
                            disabled={syncDevice.isPending}
                            sx={{ color: '#0284C7', '&:hover': { backgroundColor: '#E0F2FE' } }}
                          >
                            <SyncOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Chỉnh sửa thiết bị">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEditDevice(dev)}
                            sx={{ color: '#475569', '&:hover': { backgroundColor: '#F1F5F9' } }}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Xóa thiết bị">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteDevice(dev.id)}
                            sx={{ color: '#DC2626', '&:hover': { backgroundColor: '#FEE2E2' } }}
                          >
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* 5. Modal Thêm / Sửa Máy chấm công */}
      <Dialog
        open={openDeviceModal}
        onClose={() => setOpenDeviceModal(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 2.5, p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', pb: 1 }}>
          {editingDevice ? 'Chỉnh sửa Thiết bị Chấm công' : 'Thêm Máy Chấm Công Mới'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.5 }}>
                Tên máy chấm công *
              </Typography>
              <TextField
                fullWidth
                placeholder="Ví dụ: Máy chấm công Cửa chính - Trụ sở Hà Nội"
                value={deviceForm.name}
                onChange={(e) => setDeviceForm({ ...deviceForm, name: e.target.value })}
                sx={inputSx}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.5 }}>
                Mã thiết bị
              </Typography>
              <TextField
                fullWidth
                placeholder="Ví dụ: DEV-HN-01"
                value={deviceForm.device_code}
                onChange={(e) => setDeviceForm({ ...deviceForm, device_code: e.target.value })}
                sx={inputSx}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.5 }}>
                Chi nhánh hoặc Trụ sở trực thuộc *
              </Typography>
              <TextField
                select
                fullWidth
                value={deviceForm.location || ''}
                onChange={(e) => setDeviceForm({ ...deviceForm, location: Number(e.target.value) })}
                sx={inputSx}
              >
                {locations.map((loc) => (
                  <MenuItem key={loc.id} value={loc.id}>
                    {loc.name} {loc.city ? `• ${loc.city}` : ''}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.5 }}>
                Giao thức kết nối thiết bị
              </Typography>
              <TextField
                select
                fullWidth
                value={deviceForm.protocol}
                onChange={(e) => setDeviceForm({ ...deviceForm, protocol: e.target.value as any })}
                sx={inputSx}
              >
                {PROTOCOL_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.5 }}>
                Địa chỉ IP hoặc Tên miền thiết bị *
              </Typography>
              <TextField
                fullWidth
                placeholder="Ví dụ: Squareely.ddns.net hoặc 192.168.1.201"
                value={deviceForm.ip_or_domain}
                onChange={(e) => setDeviceForm({ ...deviceForm, ip_or_domain: e.target.value })}
                helperText="Nhập tên miền động nếu đặt tại văn phòng từ xa, hoặc IP mạng nội bộ"
                sx={inputSx}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.5 }}>
                Cổng phần cứng
              </Typography>
              <TextField
                type="number"
                fullWidth
                value={deviceForm.device_port}
                onChange={(e) => setDeviceForm({ ...deviceForm, device_port: Number(e.target.value) })}
                helperText="Tiêu chuẩn là 4370"
                sx={inputSx}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.5 }}>
                Mật mã kết nối
              </Typography>
              <TextField
                fullWidth
                placeholder="Ví dụ: 123456"
                value={deviceForm.comm_key}
                onChange={(e) => setDeviceForm({ ...deviceForm, comm_key: e.target.value })}
                helperText="Mặc định là 0 hoặc 123456"
                sx={inputSx}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.5 }}>
                Hướng quẹt áp dụng
              </Typography>
              <TextField
                select
                fullWidth
                value={deviceForm.direction}
                onChange={(e) => setDeviceForm({ ...deviceForm, direction: e.target.value as any })}
                sx={inputSx}
              >
                {DIRECTION_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.5 }}>
                Chu kỳ quét tự động
              </Typography>
              <TextField
                select
                fullWidth
                value={deviceForm.auto_sync_interval}
                onChange={(e) => setDeviceForm({ ...deviceForm, auto_sync_interval: Number(e.target.value) })}
                sx={inputSx}
              >
                <MenuItem value={5}>Mỗi 5 phút một lần</MenuItem>
                <MenuItem value={15}>Mỗi 15 phút một lần</MenuItem>
                <MenuItem value={30}>Mỗi 30 phút một lần</MenuItem>
                <MenuItem value={60}>Mỗi 60 phút một lần</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setOpenDeviceModal(false)}
            color="inherit"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitDevice}
            disabled={createBiometricDevice.isPending || updateBiometricDevice.isPending}
            sx={{ textTransform: 'none', fontWeight: 600, backgroundColor: '#2563EB' }}
          >
            {createBiometricDevice.isPending || updateBiometricDevice.isPending ? 'Đang lưu...' : 'Lưu thiết bị'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 6. Modal Quản lý Chi nhánh / Trụ sở */}
      <Dialog
        open={openLocationModal}
        onClose={() => setOpenLocationModal(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 2.5, p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', pb: 1 }}>
          Quản lý Chi nhánh và Trụ sở làm việc
        </DialogTitle>
        <DialogContent dividers>
          {/* Form thêm chi nhánh mới */}
          <Box sx={{ p: 2, borderRadius: 2, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 1.5 }}>
              Thêm Chi nhánh hoặc Trụ sở mới
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 5 }}>
                <TextField
                  fullWidth
                  placeholder="Tên chi nhánh, ví dụ: Trụ sở chính Hà Nội"
                  value={locationForm.name}
                  onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                  sx={inputSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  fullWidth
                  placeholder="Mã, ví dụ: HN-HQ"
                  value={locationForm.code}
                  onChange={(e) => setLocationForm({ ...locationForm, code: e.target.value })}
                  sx={inputSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  select
                  fullWidth
                  value={locationForm.location_type}
                  onChange={(e) => setLocationForm({ ...locationForm, location_type: e.target.value as any })}
                  sx={inputSx}
                >
                  {LOCATION_TYPE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  fullWidth
                  placeholder="Địa chỉ chi tiết của chi nhánh..."
                  value={locationForm.address}
                  onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })}
                  sx={inputSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleCreateLocation}
                  disabled={createWorkLocation.isPending}
                  sx={{ height: 40, textTransform: 'none', fontWeight: 600, backgroundColor: '#2563EB' }}
                >
                  {createWorkLocation.isPending ? 'Đang tạo...' : 'Tạo chi nhánh'}
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Danh sách các chi nhánh hiện có */}
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 1 }}>
            Danh sách các chi nhánh và địa điểm hiện có
          </Typography>
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#F1F5F9' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Tên chi nhánh</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Phân loại</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Địa chỉ</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Số thiết bị</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Số nhân sự</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {locations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 3, color: '#94A3B8' }}>
                      Chưa có chi nhánh nào được thiết lập. Hãy tạo chi nhánh đầu tiên ở trên.
                    </TableCell>
                  </TableRow>
                ) : (
                  locations.map((loc) => (
                    <TableRow key={loc.id}>
                      <TableCell sx={{ fontWeight: 600 }}>{loc.name}</TableCell>
                      <TableCell>{loc.location_type_label || loc.location_type}</TableCell>
                      <TableCell>{loc.address || 'Chưa cập nhật địa chỉ'}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{loc.device_count || 0}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{loc.employee_count || 0}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setOpenLocationModal(false)}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
