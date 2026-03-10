/*
MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy
Email: khuy220@gmail.com
Copyright (c) 2023 Bui Khanh Huy

License: MIT License
See the LICENSE file in the project root for full license information.
*/

import React, { useState, useMemo, useEffect } from 'react';
import {
    Box,
    Typography,
    Breadcrumbs,
    Link,
    Button,
    Paper,
    TextField,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    OutlinedInput,
    Chip,
    IconButton,
    Stack,
    Divider,
    LinearProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { useQuestionGroups } from '../../../employerPages/InterviewPages/hooks/useQuestionGroups';
import DataTable from '../../../../components/DataTable';
import questionService from '../../../../services/questionService';
import { transformQuestion, transformQuestionGroup } from '../../../../utils/transformers';

const QuestionGroupsCard = ({ title = "Quản lý bộ câu hỏi" }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    // Dialog state
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
    const [currentGroup, setCurrentGroup] = useState(null);
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [allQuestions, setAllQuestions] = useState([]);

    // Delete dialog
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const [openCreateQuestion, setOpenCreateQuestion] = useState(false);
    const [newQuestionContent, setNewQuestionContent] = useState('');
    const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);



    const {
        data,
        isLoading,
        createQuestionGroup,
        updateQuestionGroup,
        deleteQuestionGroup,
        isMutating
    } = useQuestionGroups({
        page: page + 1,
        pageSize: rowsPerPage,
        search: searchTerm
    });

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await questionService.getQuestions({ pageSize: 1000 });
                const rawQuestions = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
                setAllQuestions(rawQuestions.map(transformQuestion).filter(Boolean));
            } catch (error) {
                console.error("Error fetching questions", error);
            }
        };
        fetchQuestions();
    }, []);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPage(0);
    };

    const handleOpenAdd = () => {
        setDialogMode('add');
        setGroupName('');
        setGroupDescription('');
        setSelectedQuestions([]);
        setCurrentGroup(null);
        setOpenDialog(true);
    };

    const handleOpenEdit = (group) => {
        setDialogMode('edit');
        setCurrentGroup(group);
        setGroupName(group.name);
        setGroupDescription(group.description || '');
        setSelectedQuestions(group.questions?.map(q => q.id) || []);
        setOpenDialog(true);
    };

    const handleOpenDelete = (group) => {
        setCurrentGroup(group);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleSave = async () => {
        if (!groupName.trim()) return;

        const payload = {
            name: groupName.trim(),
            description: groupDescription.trim(),
            question_ids: selectedQuestions
        };

        try {
            if (dialogMode === 'add') {
                await createQuestionGroup(payload);
            } else {
                await updateQuestionGroup({
                    id: currentGroup.id,
                    data: payload
                });
            }
            handleCloseDialog();
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateQuestion = async () => {
        if (!newQuestionContent.trim()) return;
        setIsCreatingQuestion(true);
        try {
            const res = await questionService.createQuestion({
                text: newQuestionContent.trim(),
                category: ''
            });
            const newQ = transformQuestion(res);
            if (newQ) {
                setAllQuestions(prev => [newQ, ...prev]);
                setSelectedQuestions(prev => [...prev, newQ.id]);
            }
            setOpenCreateQuestion(false);
            setNewQuestionContent('');
        } catch (error) {
            console.error("Error creating question", error);
        } finally {
            setIsCreatingQuestion(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteQuestionGroup(currentGroup.id);
            setOpenDeleteDialog(false);
        } catch (error) {
            console.error(error);
        }
    };

    const columns = useMemo(() => [
        {
            header: 'Tên bộ câu hỏi',
            accessorKey: 'name',
            cell: ({ getValue }) => getValue(),
        },
        {
            header: 'Số lượng câu hỏi',
            accessorKey: 'questions',
            cell: ({ getValue }) => getValue()?.length || 0,
        },
        {
            header: 'Mô tả',
            accessorKey: 'description',
            cell: ({ getValue }) => getValue() || 'N/A',
        },
        {
            header: '',
            id: 'actions',
            cell: ({ row }) => (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <IconButton size="small" onClick={() => handleOpenEdit(row.original)} color="primary">
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleOpenDelete(row.original)} color="error">
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            ),
        },
    ], []);

    const transformedData = useMemo(() => {
        const rawGroups = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
        return rawGroups.map(transformQuestionGroup).filter(Boolean);
    }, [data]);

    return (
        <Box sx={{
            px: { xs: 1, sm: 2 },
            py: { xs: 2, sm: 2 },
            backgroundColor: 'background.paper',
            borderRadius: 2
        }}>
            {/* Header Section */}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
                spacing={{ xs: 2, sm: 0 }}
                mb={4}
            >
                <Box>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 600,
                            background: (theme) => theme.palette.primary.gradient || theme.palette.primary.main,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontSize: { xs: '1.25rem', sm: '1.5rem' },
                            mb: 0.5
                        }}
                    >
                        {title}
                    </Typography>
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link underline="hover" color="inherit" href="/nha-tuyen-dung" sx={{ fontSize: '0.875rem' }}>
                            Nhà tuyển dụng
                        </Link>
                        <Typography color="text.secondary" sx={{ fontSize: '0.875rem' }}>Phỏng vấn trực tuyến</Typography>
                        <Typography color="text.primary" sx={{ fontSize: '0.875rem' }}>Bộ câu hỏi</Typography>
                    </Breadcrumbs>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAdd}
                    sx={{
                        borderRadius: 2,
                        px: 3,
                        background: (theme) => theme.palette.primary.gradient,
                        boxShadow: (theme) => theme.customShadows?.small || 1,
                        '&:hover': {
                            boxShadow: (theme) => theme.customShadows?.medium || 2
                        }
                    }}
                >
                    Thêm bộ câu hỏi
                </Button>
            </Stack>

            {/* Filter Section */}
            <Box sx={{ mb: 3 }}>
                <TextField
                    size="small"
                    placeholder="Tìm kiếm bộ câu hỏi..."
                    value={searchTerm}
                    onChange={handleSearch}
                    sx={{
                        width: { xs: '100%', sm: 300 },
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                        }
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            {/* Loading Progress */}
            {isLoading ? (
                <Box sx={{ width: '100%', mb: 2 }}>
                    <LinearProgress
                        color="primary"
                        sx={{
                            height: { xs: 4, sm: 6 },
                            borderRadius: 3,
                            backgroundColor: 'primary.background'
                        }}
                    />
                </Box>
            ) : (
                <Divider sx={{ mb: 2 }} />
            )}

            {/* Table Section */}
            <Box sx={{
                backgroundColor: 'background.paper',
                borderRadius: 2,
                boxShadow: (theme) => theme.customShadows?.card || 1,
                overflow: 'hidden',
                width: '100%',
                '& .MuiTableContainer-root': {
                    overflowX: 'auto'
                }
            }}>
                <DataTable
                    columns={columns}
                    data={transformedData}
                    isLoading={isLoading}
                    count={typeof data?.count === 'number' ? data.count : transformedData.length}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Box>

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 600 }}>
                    {dialogMode === 'add' ? 'Thêm bộ câu hỏi mới' : 'Chỉnh sửa bộ câu hỏi'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Tên bộ câu hỏi"
                            fullWidth
                            variant="outlined"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            required
                        />
                        <TextField
                            label="Mô tả"
                            fullWidth
                            multiline
                            rows={3}
                            variant="outlined"
                            value={groupDescription}
                            onChange={(e) => setGroupDescription(e.target.value)}
                        />
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>Chọn câu hỏi</InputLabel>
                            <Select
                                multiple
                                value={selectedQuestions}
                                onChange={(e) => setSelectedQuestions(e.target.value)}
                                input={<OutlinedInput label="Chọn câu hỏi" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => {
                                            const q = allQuestions.find((item) => item.id === value);
                                            return <Chip key={value} label={q?.text?.substring(0, 30) || 'Câu hỏi'} size="small" />;
                                        })}
                                    </Box>
                                )}
                            >
                                {allQuestions.map((q) => (
                                    <MenuItem key={q.id} value={q.id}>
                                        <Typography variant="body2" sx={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {q.text}
                                        </Typography>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={() => setOpenCreateQuestion(true)}
                            sx={{ alignSelf: 'flex-start', borderRadius: 2 }}
                        >
                            Tạo câu hỏi mới
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button onClick={handleCloseDialog} color="inherit">Hãy</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={isMutating || !groupName.trim()}
                        sx={{ px: 4, borderRadius: 2 }}
                    >
                        {isMutating ? 'Đang lưu...' : 'Lưu lại'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Create Question Dialog */}
            <Dialog open={openCreateQuestion} onClose={() => setOpenCreateQuestion(false)} fullWidth maxWidth="xs">
                <DialogTitle sx={{ fontWeight: 600 }}>Tạo câu hỏi mới</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <TextField
                            label="Nội dung câu hỏi"
                            fullWidth
                            multiline
                            rows={3}
                            variant="outlined"
                            value={newQuestionContent}
                            onChange={(e) => setNewQuestionContent(e.target.value)}
                            required
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button onClick={() => setOpenCreateQuestion(false)} color="inherit">Hãy</Button>
                    <Button
                        onClick={handleCreateQuestion}
                        variant="contained"
                        disabled={isCreatingQuestion || !newQuestionContent.trim()}
                        sx={{ px: 4, borderRadius: 2 }}
                    >
                        {isCreatingQuestion ? 'Đang tạo...' : 'Tạo mới'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle sx={{ fontWeight: 600 }}>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Bạn có chắc chắn muốn xóa bộ câu hỏi <strong>{currentGroup?.name}</strong>?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Dữ liệu các câu hỏi bên trong sẽ không bị xóa, nhưng liên kết với bộ câu hỏi này sẽ mất.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">Hãy</Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                        disabled={isMutating}
                        sx={{ px: 4, borderRadius: 2 }}
                    >
                        {isMutating ? 'Đang xóa...' : 'Xác nhận xóa'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default QuestionGroupsCard;
