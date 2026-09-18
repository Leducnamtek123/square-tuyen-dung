import logging
from django.core.management import call_command
from apps.interviews.models import Question, QuestionGroup
from apps.accounts.models import User

logger = logging.getLogger(__name__)

def seed_interviews():
    """
    Seed official Square Group interview question sets (HCNS.QT.01.F06) and supplementary data.
    """
    logger.info("Nạp bộ câu hỏi phỏng vấn chuẩn Square (HCNS.QT.01.F06)...")
    try:
        call_command('import_square_questions')
        logger.info("Hoàn tất nạp bộ câu hỏi phỏng vấn chuẩn Square.")
    except Exception as e:
        logger.error(f"Lỗi khi nạp bộ câu hỏi Square: {str(e)}")
