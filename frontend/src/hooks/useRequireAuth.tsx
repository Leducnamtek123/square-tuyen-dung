'use client';

import React from 'react';
import { useAppSelector } from '@/hooks/useAppStore';
import AuthRequiredModal from '@/components/Common/AuthRequiredModal';
import { ROLES_NAME } from '@/configs/constants';

export interface RequireAuthOptions {
  title?: string;
  message?: string;
  actionType?: 'save_job' | 'apply_job' | 'follow_company' | 'report' | 'general';
  targetRole?: 'job_seeker' | 'employer';
}

export const useRequireAuth = () => {
  const { isAuthenticated, currentUser } = useAppSelector((state) => state.user);
  const [modalState, setModalState] = React.useState<{
    open: boolean;
    options: RequireAuthOptions;
  }>({
    open: false,
    options: {},
  });

  const requireAuth = React.useCallback(
    (options: RequireAuthOptions = {}): boolean => {
      if (!isAuthenticated) {
        setModalState({
          open: true,
          options,
        });
        return false;
      }

      if (options.targetRole === 'employer' && currentUser?.roleName !== ROLES_NAME.EMPLOYER) {
        setModalState({
          open: true,
          options: {
            ...options,
            title: options.title || 'Dành cho Nhà tuyển dụng',
            message: options.message || 'Vui lòng đăng nhập bằng tài khoản Nhà tuyển dụng để thực hiện chức năng này.',
          },
        });
        return false;
      }

      return true;
    },
    [isAuthenticated, currentUser]
  );

  const closeAuthModal = React.useCallback(() => {
    setModalState((prev) => ({ ...prev, open: false }));
  }, []);

  const AuthModal = React.useMemo(() => {
    return (
      <AuthRequiredModal
        open={modalState.open}
        onClose={closeAuthModal}
        title={modalState.options.title}
        message={modalState.options.message}
        actionType={modalState.options.actionType}
        targetRole={modalState.options.targetRole}
      />
    );
  }, [modalState, closeAuthModal]);

  return {
    isAuthenticated,
    currentUser,
    requireAuth,
    AuthModal,
  };
};

export default useRequireAuth;
