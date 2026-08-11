import os
import subprocess
import gzip
import shutil
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.conf import settings


class Command(BaseCommand):
    help = "Tự động Sao lưu CSDL MySQL (mysqldump + gzip) hằng ngày và dọn dẹp bản lưu cũ"

    def add_arguments(self, parser):
        parser.add_argument(
            '--retention-days',
            type=int,
            default=30,
            help='Số ngày giữ bản lưu trữ trước khi xóa bản sao lưu cũ (mặc định: 30 ngày)'
        )

    def handle(self, *args, **options):
        retention_days = options['retention_days']
        db_settings = settings.DATABASES['default']

        db_name = db_settings.get('NAME')
        db_user = db_settings.get('USER')
        db_password = db_settings.get('PASSWORD')
        db_host = db_settings.get('HOST', 'localhost')
        db_port = str(db_settings.get('PORT', 3306))

        # Thư mục lưu trữ bản backup
        backup_dir = os.path.join(settings.BASE_DIR, 'backups')
        os.makedirs(backup_dir, exist_ok=True)

        now_str = datetime.now().strftime('%Y-%m-%d_%H%M%S')
        dump_filename = f"db_backup_{db_name}_{now_str}.sql"
        gz_filename = f"{dump_filename}.gz"
        
        dump_filepath = os.path.join(backup_dir, dump_filename)
        gz_filepath = os.path.join(backup_dir, gz_filename)

        self.stdout.write(self.style.NOTICE(f"🔄 Đang tiến hành tạo bản sao lưu CSDL '{db_name}'..."))

        # Lệnh mysqldump an toàn InnoDB (--single-transaction)
        cmd = [
            'mysqldump',
            f'--host={db_host}',
            f'--port={db_port}',
            f'--user={db_user}',
            f'--password={db_password}',
            '--single-transaction',
            '--quick',
            '--routines',
            '--triggers',
            db_name
        ]

        try:
            with open(dump_filepath, 'w', encoding='utf-8') as f:
                result = subprocess.run(cmd, stdout=f, stderr=subprocess.PIPE, text=True, check=True)

            # Nén file bằng gzip
            with open(dump_filepath, 'rb') as f_in:
                with gzip.open(gz_filepath, 'wb') as f_out:
                    shutil.copyfileobj(f_in, f_out)

            # Xóa file sql thô sau khi đã nén
            if os.path.exists(dump_filepath):
                os.remove(dump_filepath)

            file_size_mb = os.path.getsize(gz_filepath) / (1024 * 1024)
            self.stdout.write(
                self.style.SUCCESS(
                    f"✅ Sao lưu CSDL thành công: {gz_filename} ({file_size_mb:.2f} MB)\n"
                    f"📁 Vị trí: {gz_filepath}"
                )
            )

            # Dọn dẹp các file sao lưu cũ hơn retention_days
            cutoff_date = datetime.now() - timedelta(days=retention_days)
            cleaned_count = 0
            for filename in os.listdir(backup_dir):
                if filename.startswith(f"db_backup_{db_name}_") and filename.endswith('.sql.gz'):
                    filepath = os.path.join(backup_dir, filename)
                    file_time = datetime.fromtimestamp(os.path.getmtime(filepath))
                    if file_time < cutoff_date:
                        os.remove(filepath)
                        cleaned_count += 1

            if cleaned_count > 0:
                self.stdout.write(self.style.NOTICE(f"🧹 Đã tự động dọn dẹp {cleaned_count} bản sao lưu cũ quá {retention_days} ngày."))

        except subprocess.CalledProcessError as e:
            if os.path.exists(dump_filepath):
                os.remove(dump_filepath)
            self.stderr.write(self.style.ERROR(f"❌ Lỗi khi thực hiện mysqldump: {e.stderr}"))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"❌ Lỗi không xác định: {str(e)}"))
