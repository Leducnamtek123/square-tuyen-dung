# Bieu Mau & Validation (Forms & Validation)

> **Phan he**: 06-frontend  
> **Tai lieu**: forms-and-validation.md  
> **Thu vien**: React Hook Form & Zod Resolver

---

## 1. Tieu Chuan Xu Ly Bieu Mau (Form Architecture)

Moi bieu mau trong InfoHR deu tuan thu bo doi cong nghe:
1. **React Hook Form**: Quan ly trang thai form khong gay re-render ca cay component (Uncontrolled components with refs).
2. **Zod**: Khai bao schema validation chat che, tu dong sinh kieu TypeScript (Type inference) dong nhat giua frontend va backend DTO.

---

## 2. Mau Trien Khai Chuan (Standard Form Implementation)

Vi du form nop don xin nghi phep trong Native HRM:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const leaveRequestSchema = z.object({
  leave_type: z.enum(['ANNUAL', 'SICK', 'UNPAID', 'MATERNITY'], {
    required_error: 'Vui long chon loai nghi phep.',
  }),
  start_date: z.string().min(1, 'Vui long chon ngay bat dau.'),
  end_date: z.string().min(1, 'Vui long chon ngay ket thuc.'),
  reason: z.string().min(10, 'Ly do nghi phai co it nhat 10 ky tu.').max(500),
}).refine(data => new Date(data.end_date) >= new Date(data.start_date), {
  message: 'Ngay ket thuc khong duoc truoc ngay bat dau.',
  path: ['end_date'],
});

type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;

export function CreateLeaveRequestModal() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      leave_type: 'ANNUAL',
      reason: '',
    },
  });

  const onSubmit = async (data: LeaveRequestFormData) => {
    // Goi API thong qua TanStack Query mutation
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Input controls with errors display */}
    </form>
  );
}
```

---

## 3. Xu Ly Upload File & Tien Trinh (File Upload to MinIO S3)

- Su dung component `FileUploader` chung voi kha nang kiem tra dung luong file (toi da 10MB cho CV PDF, 5MB cho avatar anh) va dinh dang mime-type truoc khi upload.
- Hien thi thanh tien trinh phan tram (Upload Progress Bar) giup nguoi dung biet duoc trang thai upload du lieu.
