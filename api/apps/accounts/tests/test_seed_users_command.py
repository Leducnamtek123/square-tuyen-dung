import pytest
from django.core.management import call_command

from apps.accounts.models import User


@pytest.mark.django_db
def test_seed_users_command_keeps_only_admin_and_ceohost_seed_accounts():
    call_command("seed_users")

    assert User.objects.filter(email="admin2@project.com").exists()
    assert User.objects.filter(email="ceohub.hostmaster@gmail.com").exists()
    assert not User.objects.filter(email="candidate2@project.com").exists()
