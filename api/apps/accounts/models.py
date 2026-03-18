
from shared.configs import variable_system as var_sys

from django.db import models
from django.core.exceptions import ObjectDoesNotExist

from django.contrib.auth.models import (AbstractUser, BaseUserManager)

from apps.files.models import File

class AuthBaseModel(models.Model):

    class Meta:

        abstract = True

    create_at = models.DateTimeField(auto_now_add=True)

    update_at = models.DateTimeField(auto_now=True)

class UserManager(BaseUserManager):

    invalid_email_message = 'Users should have a email'

    invalid_full_name_message = 'Users should have a full name'

    super_user_required_password_message = 'Super users should have a password'

    role_name_required_message = 'Role name is required'

    def create_user(self, email, full_name, password=None, **extra_fields):

        if email is None:

            raise ValueError(self.invalid_email_message)

        if full_name is None:

            raise ValueError(self.invalid_full_name_message)

        user = self.model(email=self.normalize_email(email), full_name=full_name, **extra_fields)

        user.set_password(password)

        user.save()

        return user

    def create_superuser(self, email, full_name, password=None, **extra_fields):

        if password is None:

            raise ValueError(self.super_user_required_password_message)

        user = self.create_user_with_role_name(email, full_name, var_sys.ADMIN,

                                               password=password,

                                               is_superuser=True,

                                               is_staff=True,

                                               is_active=True,

                                               is_verify_email=True)

        return user

    def create_user_with_role_name(self, email, full_name, role_name, password=None, **extra_fields):

        if role_name is None:

            raise ValueError(self.role_name_required_message)

        user = self.create_user(email, full_name, password, **extra_fields)

        user.role_name = role_name

        user.save()

        return user

class User(AbstractUser, AuthBaseModel):

    # groups = None

    # user_permissions = None

    username = None

    first_name = None

    last_name = None

    date_joined = None

    full_name = models.CharField(max_length=100)

    email = models.EmailField(max_length=100, unique=True, db_index=True)

    email_notification_active = models.BooleanField(default=True)

    sms_notification_active = models.BooleanField(default=True)

    has_company = models.BooleanField(default=False)

    is_verify_email = models.BooleanField(default=False)

    # ForeignKey

    role_name = models.CharField(max_length=10, choices=var_sys.ROLE_CHOICES,

                                 default=var_sys.JOB_SEEKER)

    avatar = models.OneToOneField(File, on_delete=models.SET_NULL, null=True, blank=True, related_name='user')

    class Meta:

        db_table = "project_authentication_user"

        verbose_name_plural = "Users"

    objects = UserManager()

    USERNAME_FIELD = "email"

    REQUIRED_FIELDS = ["full_name"]

    def get_active_company(self):
        cached = self.__dict__.get("_active_company_cache", None)
        if "_active_company_cache" in self.__dict__:
            return cached

        company = None
        try:
            company = self.company
        except ObjectDoesNotExist:
            company = None

        if company is None:
            from apps.profiles.models import CompanyMember

            membership = CompanyMember.objects.select_related("company").filter(
                user=self,
                is_active=True,
                status=CompanyMember.STATUS_ACTIVE,
            ).first()
            company = membership.company if membership else None

        self.__dict__["_active_company_cache"] = company
        return company

    @property
    def active_company(self):
        return self.get_active_company()

class ForgotPasswordToken(AuthBaseModel):

    token = models.CharField(max_length=255, null=True)

    code = models.IntegerField(null=True)

    expired_at = models.DateTimeField()

    is_active = models.BooleanField(default=True)

    platform = models.CharField(max_length=3, choices=var_sys.PLATFORM_CHOICES,

                                default="WEB")

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="forgot_password_tokens")

    class Meta:

        db_table = "project_authentication_forgot_password_token"


