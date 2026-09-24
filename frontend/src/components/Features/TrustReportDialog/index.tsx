'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  ShieldAlert,
  Building2,
  Briefcase,
  AlertTriangle,
  FileWarning,
  Ban,
  Copy,
  HelpCircle,
  X,
  ShieldCheck,
  Send,
  Check,
} from 'lucide-react';

import errorHandling from '@/utils/errorHandling';
import toastMessages from '@/utils/toastMessages';
import trustReportService, {
  type TrustReportPayload,
  type TrustReportTargetType,
} from '@/services/trustReportService';

type TrustReportFormValues = {
  reason: string;
  message: string;
};

type Props = {
  openPopup: boolean;
  setOpenPopup: (open: boolean) => void;
  targetType: TrustReportTargetType;
  jobPostId?: number | null;
  companyId?: number | null;
  targetName?: string;
};

const REPORT_REASONS = [
  {
    value: 'scam',
    labelKey: 'jobDetail.reportReasons.scam',
    icon: AlertTriangle,
    badgeColor: 'text-rose-600 bg-rose-50 border-rose-100',
  },
  {
    value: 'wrong_info',
    labelKey: 'jobDetail.reportReasons.wrongInfo',
    icon: FileWarning,
    badgeColor: 'text-amber-600 bg-amber-50 border-amber-100',
  },
  {
    value: 'spam',
    labelKey: 'jobDetail.reportReasons.spam',
    icon: Ban,
    badgeColor: 'text-orange-600 bg-orange-50 border-orange-100',
  },
  {
    value: 'duplicate',
    labelKey: 'jobDetail.reportReasons.duplicate',
    icon: Copy,
    badgeColor: 'text-indigo-600 bg-indigo-50 border-indigo-100',
  },
  {
    value: 'other',
    labelKey: 'jobDetail.reportReasons.other',
    icon: HelpCircle,
    badgeColor: 'text-slate-600 bg-slate-50 border-slate-100',
  },
] as const;

const REPORT_FORM_DEFAULT_VALUES: TrustReportFormValues = {
  reason: 'scam',
  message: '',
};

const TrustReportDialogContent = ({
  openPopup,
  setOpenPopup,
  targetType,
  jobPostId,
  companyId,
  targetName,
}: Props) => {
  const { t } = useTranslation('public');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { control, handleSubmit, reset, watch } = useForm<TrustReportFormValues>({
    defaultValues: REPORT_FORM_DEFAULT_VALUES,
  });

  const watchMessage = watch('message') || '';

  const onSubmit = async (values: TrustReportFormValues) => {
    let shouldClose = false;
    setIsSubmitting(true);
    try {
      const payload: TrustReportPayload = {
        targetType,
        reason: values.reason,
        message: values.message,
        jobPost: jobPostId ?? null,
        company: companyId ?? null,
      };
      await trustReportService.createTrustReport(payload);
      toastMessages.success(t('public:jobDetail.reportSuccess'));
      shouldClose = true;
    } catch (error) {
      errorHandling(error);
    } finally {
      setIsSubmitting(false);
    }

    if (shouldClose) {
      setOpenPopup(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    reset(REPORT_FORM_DEFAULT_VALUES);
    setOpenPopup(false);
  };

  const title =
    targetType === 'job'
      ? t('public:jobDetail.reportJobTitle')
      : t('public:companyDetail.reportCompanyTitle');

  return (
    <Dialog
      open={openPopup}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
          },
        },
        paper: {
          sx: {
            borderRadius: '24px',
            maxWidth: '500px',
            mx: { xs: 2, sm: 'auto' },
            overflow: 'hidden',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.22)',
            bgcolor: '#ffffff',
          },
        },
      }}
    >
      <DialogContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 shadow-xs">
                <ShieldAlert className="size-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
                  {t('public:jobDetail.reportCaption')}
                </p>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {title}
                </h3>
              </div>
            </div>

            <IconButton
              onClick={handleClose}
              disabled={isSubmitting}
              size="small"
              aria-label="close"
              sx={{
                color: '#64748b',
                borderRadius: '10px',
                border: '1px solid #f1f5f9',
                p: 0.75,
                '&:hover': {
                  bgcolor: '#f8fafc',
                  color: '#0f172a',
                },
              }}
            >
              <X className="size-4" />
            </IconButton>
          </div>

          {/* Target entity context card */}
          {targetName ? (
            <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 shadow-xs">
                {targetType === 'job' ? (
                  <Briefcase className="size-4 text-blue-600" />
                ) : (
                  <Building2 className="size-4 text-blue-600" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  {targetType === 'job'
                    ? t('public:jobDetail.reportTargetJob')
                    : t('public:jobDetail.reportTargetCompany')}
                </p>
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {targetName}
                </p>
              </div>
            </div>
          ) : null}

          {/* Report Reasons Radio Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              {t('public:jobDetail.reportReasonLabel')}
            </label>
            <Controller
              control={control}
              name="reason"
              render={({ field }) => (
                <div className="space-y-1.5" role="radiogroup">
                  {REPORT_REASONS.map((option) => {
                    const isSelected = field.value === option.value;
                    const IconComp = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        disabled={isSubmitting}
                        onClick={() => field.onChange(option.value)}
                        className={`w-full group flex items-center justify-between p-2.5 sm:px-3 sm:py-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600/20'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`flex size-7 shrink-0 items-center justify-center rounded-lg border transition-colors ${option.badgeColor}`}
                          >
                            <IconComp className="size-3.5" />
                          </div>
                          <span
                            className={`text-xs sm:text-sm truncate transition-colors ${
                              isSelected
                                ? 'font-semibold text-blue-900'
                                : 'font-medium text-slate-700 group-hover:text-slate-900'
                            }`}
                          >
                            {t(`public:${option.labelKey}`)}
                          </span>
                        </div>

                        <div className="shrink-0 ml-2">
                          {isSelected ? (
                            <div className="flex size-4.5 items-center justify-center rounded-full bg-blue-600 text-white shadow-2xs">
                              <Check className="size-2.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="size-4.5 rounded-full border-2 border-slate-300 group-hover:border-slate-400" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </div>

          {/* Additional details */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="report-dialog-message"
                className="text-xs font-semibold text-slate-700"
              >
                {t('public:jobDetail.reportMessageLabel')}
                <span className="ml-1 text-[11px] font-normal text-slate-400">
                  ({t('public:jobDetail.reportOptional')})
                </span>
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {watchMessage.length}/500
              </span>
            </div>
            <Controller
              control={control}
              name="message"
              render={({ field }) => (
                <textarea
                  id="report-dialog-message"
                  {...field}
                  rows={3}
                  maxLength={500}
                  disabled={isSubmitting}
                  placeholder={t('public:jobDetail.reportMessagePlaceholder')}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-xs transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                />
              )}
            />
          </div>

          {/* Trust notice */}
          <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 border border-slate-200/70 p-2.5 text-xs text-slate-600">
            <ShieldCheck className="size-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              {t('public:jobDetail.reportPrivacyNotice')}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {t('common:actions.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={16} color="inherit" />
                  <span>{t('common:actions.submit')}...</span>
                </>
              ) : (
                <>
                  <Send className="size-3.5" />
                  <span>{t('common:actions.submit')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const TrustReportDialog = (props: Props) => {
  if (!props.openPopup) return null;
  return <TrustReportDialogContent {...props} />;
};

export default TrustReportDialog;
