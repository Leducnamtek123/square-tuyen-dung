import React, { useEffect, useMemo, useRef } from 'react';
import { Box, Typography, Breadcrumbs, Link, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import DataTable from '../../../components/Common/DataTable';
import { useDataTable } from '../../../hooks';
import { Banner } from '../../../types/models';
import { useBanners } from './hooks/useBanners';
import { useBannerTypes } from '../BannerTypesPage/hooks/useBannerTypes';
import BannerFormDialog from './BannerFormDialog';
import BannerDeleteDialog from './BannerDeleteDialog';
import { useBannersPageColumns } from './useBannersPageColumns';
import { compressImageFile } from '../../../utils/imageCompression';

interface BannerFormData {
  description: string;
  button_text: string;
  button_link: string;
  is_show_button: boolean;
  is_active: boolean;
  platform: string;
  type: number;
  description_location: number;
}

type BannersPageState = {
  openDialog: boolean;
  dialogMode: 'add' | 'edit';
  current: Banner | null;
  openDelete: boolean;
  formData: BannerFormData;
  webImage: File | null;
  mobileImage: File | null;
  webPreview: string;
  mobilePreview: string;
  cropOpen: boolean;
  cropImageSrc: string;
  cropFileName: string;
  cropTarget: 'web' | 'mobile';
};

type BannersPageAction =
  | { type: 'open-add' }
  | { type: 'open-edit'; banner: Banner }
  | { type: 'close-dialog' }
  | { type: 'open-delete'; banner: Banner }
  | { type: 'close-delete' }
  | { type: 'set-form-field'; name: keyof BannerFormData; value: unknown }
  | { type: 'set-form-data'; value: BannerFormData }
  | { type: 'set-web-image'; value: File | null }
  | { type: 'set-mobile-image'; value: File | null }
  | { type: 'set-web-preview'; value: string }
  | { type: 'set-mobile-preview'; value: string }
  | { type: 'open-crop'; src: string; fileName: string; target: 'web' | 'mobile' }
  | { type: 'close-crop' };

const initialFormData: BannerFormData = {
  description: '',
  button_text: '',
  button_link: '',
  is_show_button: false,
  is_active: false,
  platform: 'WEB',
  type: 1,
  description_location: 3,
};

const initialState: BannersPageState = {
  openDialog: false,
  dialogMode: 'add',
  current: null,
  openDelete: false,
  formData: initialFormData,
  webImage: null,
  mobileImage: null,
  webPreview: '',
  mobilePreview: '',
  cropOpen: false,
  cropImageSrc: '',
  cropFileName: '',
  cropTarget: 'web',
};

function reducer(state: BannersPageState, action: BannersPageAction): BannersPageState {
  switch (action.type) {
    case 'open-add':
      return { ...initialState, openDialog: true };
    case 'open-edit':
      return {
        ...state,
        openDialog: true,
        dialogMode: 'edit',
        current: action.banner,
        formData: {
          description: action.banner.description || '',
          button_text: action.banner.button_text || '',
          button_link: action.banner.button_link || '',
          is_show_button: !!action.banner.is_show_button,
          is_active: !!action.banner.is_active,
          platform: action.banner.platform || 'WEB',
          type: action.banner.type ?? 1,
          description_location: action.banner.description_location ?? 3,
        },
        webImage: null,
        mobileImage: null,
        webPreview: action.banner.imageUrl || '',
        mobilePreview: action.banner.imageMobileUrl || '',
      };
    case 'close-dialog':
      return { ...state, openDialog: false };
    case 'open-delete':
      return { ...state, openDelete: true, current: action.banner };
    case 'close-delete':
      return { ...state, openDelete: false };
    case 'set-form-field':
      return { ...state, formData: { ...state.formData, [action.name]: action.value } };
    case 'set-form-data':
      return { ...state, formData: action.value };
    case 'set-web-image':
      return { ...state, webImage: action.value };
    case 'set-mobile-image':
      return { ...state, mobileImage: action.value };
    case 'set-web-preview':
      return { ...state, webPreview: action.value };
    case 'set-mobile-preview':
      return { ...state, mobilePreview: action.value };
    case 'open-crop':
      return {
        ...state,
        cropOpen: true,
        cropImageSrc: action.src,
        cropFileName: action.fileName,
        cropTarget: action.target,
      };
    case 'close-crop':
      return { ...state, cropOpen: false, cropImageSrc: '', cropFileName: '' };
    default:
      return state;
  }
}

const BannersPageContent = () => {
  const { t } = useTranslation('admin');
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const webInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const { sorting, onSortingChange, ordering } = useDataTable();
  const { data, isLoading, createBanner, updateBanner, deleteBanner, isMutating } = useBanners({ ordering });
  const { data: bannerTypesData } = useBannerTypes({ page: 1, pageSize: 200, ordering: 'value' });

  const PLATFORM_OPTIONS = useMemo(
    () => [
      { value: 'WEB', label: t('pages.banners.form.platformOptions.web') },
      { value: 'APP', label: t('pages.banners.form.platformOptions.app') },
    ],
    [t]
  );

  const TYPE_OPTIONS = useMemo(() => {
    const apiTypes = (bannerTypesData?.results || [])
      .filter((item) => item.is_active !== false)
      .map((item) => ({
        value: item.value,
        label: item.name || item.code,
        webAspectRatio: item.web_aspect_ratio || '',
      }));

    return apiTypes.length > 0
      ? apiTypes
      : [
          { value: 1, label: t('pages.banners.form.typeOptions.home'), webAspectRatio: '16:5' },
          { value: 2, label: t('pages.banners.form.typeOptions.mainJobRight'), webAspectRatio: '1:1' },
        ];
  }, [bannerTypesData?.results, t]);

  const DESCRIPTION_LOCATIONS = useMemo(
    () => [
      { value: 1, label: t('pages.banners.form.descLocationOptions.topLeft') },
      { value: 2, label: t('pages.banners.form.descLocationOptions.topRight') },
      { value: 3, label: t('pages.banners.form.descLocationOptions.bottomLeft') },
      { value: 4, label: t('pages.banners.form.descLocationOptions.bottomRight') },
    ],
    [t]
  );

  const parseAspectRatio = (value?: string): { ratio: number; label: string } => {
    if (!value) return { ratio: 16 / 5, label: '16:5' };
    const [w, h] = value.split(':').map((s) => Number(s.trim()));
    if (!Number.isFinite(w) || !Number.isFinite(h) || h === 0) return { ratio: 16 / 5, label: '16:5' };
    return { ratio: w / h, label: `${w}:${h}` };
  };

  useEffect(() => {
    if (!TYPE_OPTIONS.length) return;
    if (!TYPE_OPTIONS.some((item) => item.value === state.formData.type)) {
      dispatch({ type: 'set-form-field', name: 'type', value: TYPE_OPTIONS[0].value });
    }
  }, [TYPE_OPTIONS, state.formData.type]);

  const cropAspect = useMemo(() => {
    const selected = TYPE_OPTIONS.find((item) => item.value === state.formData.type);
    return parseAspectRatio(selected?.webAspectRatio);
  }, [TYPE_OPTIONS, state.formData.type]);

  const columns = useBannersPageColumns({
    typeOptions: TYPE_OPTIONS,
    onEdit: (banner) => dispatch({ type: 'open-edit', banner }),
    onDelete: (banner) => dispatch({ type: 'open-delete', banner }),
  });

  const banners = data?.results || [];

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('description', state.formData.description);
    formData.append('button_text', state.formData.button_text);
    if (state.formData.button_link) formData.append('button_link', state.formData.button_link);
    formData.append('is_show_button', String(state.formData.is_show_button));
    formData.append('is_active', String(state.formData.is_active));
    formData.append('platform', state.formData.platform);
    formData.append('type', String(state.formData.type));
    formData.append('description_location', String(state.formData.description_location));
    if (state.webImage) formData.append('imageFile', state.webImage);
    if (state.mobileImage) formData.append('imageMobileFile', state.mobileImage);

    try {
      if (state.dialogMode === 'add') await createBanner(formData);
      else if (state.current) await updateBanner({ id: state.current.id, data: formData });
      dispatch({ type: 'close-dialog' });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    try {
      if (state.current) {
        await deleteBanner(state.current.id);
        dispatch({ type: 'close-delete' });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCropConfirm = async (croppedFile: File, previewUrl: string) => {
    const compressed = await compressImageFile(croppedFile);
    const finalPreview = URL.createObjectURL(compressed);

    if (state.cropTarget === 'web') {
      dispatch({ type: 'set-web-image', value: compressed });
      dispatch({ type: 'set-web-preview', value: finalPreview });
    } else {
      dispatch({ type: 'set-mobile-image', value: compressed });
      dispatch({ type: 'set-mobile-preview', value: finalPreview });
    }

    URL.revokeObjectURL(previewUrl);
    dispatch({ type: 'close-crop' });
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {t('pages.banners.title')}
          </Typography>
          <Breadcrumbs>
            <Link underline="hover" color="inherit" href="/admin">
              {t('pages.banners.breadcrumbAdmin')}
            </Link>
            <Typography color="text.primary">{t('pages.banners.breadcrumb')}</Typography>
          </Breadcrumbs>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => dispatch({ type: 'open-add' })} sx={{ borderRadius: '8px', textTransform: 'none' }}>
          {t('pages.banners.addBtn')}
        </Button>
      </Box>

      <DataTable
        columns={columns}
        data={banners}
        isLoading={isLoading}
        hidePagination
        enableSorting
        sorting={sorting}
        onSortingChange={onSortingChange}
        emptyMessage={t('pages.banners.empty')}
      />

      <BannerFormDialog
        open={state.openDialog}
        dialogMode={state.dialogMode}
        isMutating={isMutating}
        formData={state.formData}
        webImage={state.webImage}
        mobileImage={state.mobileImage}
        webPreview={state.webPreview}
        mobilePreview={state.mobilePreview}
        cropOpen={state.cropOpen}
        cropImageSrc={state.cropImageSrc}
        cropFileName={state.cropFileName}
        cropAspectRatio={cropAspect.ratio}
        cropAspectLabel={cropAspect.label}
        onClose={() => dispatch({ type: 'close-dialog' })}
        onSave={handleSave}
        onInputChange={(name, value) => dispatch({ type: 'set-form-field', name, value })}
        onFileSelect={(target) => (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          dispatch({ type: 'open-crop', src: URL.createObjectURL(file), fileName: file.name, target });
          e.target.value = '';
        }}
        onCropConfirm={handleCropConfirm}
        onCropCancel={() => {
          if (state.cropImageSrc) URL.revokeObjectURL(state.cropImageSrc);
          dispatch({ type: 'close-crop' });
        }}
        platformOptions={PLATFORM_OPTIONS}
        typeOptions={TYPE_OPTIONS}
        descriptionLocations={DESCRIPTION_LOCATIONS}
        webInputRef={webInputRef}
        mobileInputRef={mobileInputRef}
        t={t}
        onPickWebImage={() => webInputRef.current?.click()}
        onPickMobileImage={() => mobileInputRef.current?.click()}
      />

      <BannerDeleteDialog
        open={state.openDelete}
        bannerId={state.current?.id}
        isMutating={isMutating}
        onClose={() => dispatch({ type: 'close-delete' })}
        onDelete={handleDelete}
        t={t}
      />
    </Box>
  );
};

export default BannersPageContent;
