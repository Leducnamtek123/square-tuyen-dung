from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('info', '0008_alter_company_employee_size_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='jobseekerprofile',
            name='id_card_number',
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
        migrations.AddField(
            model_name='jobseekerprofile',
            name='id_card_issue_date',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='jobseekerprofile',
            name='id_card_issue_place',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='jobseekerprofile',
            name='tax_code',
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
        migrations.AddField(
            model_name='jobseekerprofile',
            name='social_insurance_no',
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
        migrations.AddField(
            model_name='jobseekerprofile',
            name='permanent_address',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='jobseekerprofile',
            name='contact_address',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='jobseekerprofile',
            name='emergency_contact_name',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='jobseekerprofile',
            name='emergency_contact_phone',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='resume',
            name='expected_salary',
            field=models.DecimalField(blank=True, decimal_places=0, max_digits=12, null=True),
        ),
        migrations.AddField(
            model_name='resume',
            name='skills_summary',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='educationdetail',
            name='grade_or_rank',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='experiencedetail',
            name='last_salary',
            field=models.DecimalField(blank=True, decimal_places=0, max_digits=12, null=True),
        ),
        migrations.AddField(
            model_name='experiencedetail',
            name='leave_reason',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
