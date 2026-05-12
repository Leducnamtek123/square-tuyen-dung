from django.db import migrations, models


def dedupe_resume_saved(apps, schema_editor):
    ResumeSaved = apps.get_model("info", "ResumeSaved")
    duplicates = (
        ResumeSaved.objects.values("company_id", "resume_id")
        .annotate(first_id=models.Min("id"), total=models.Count("id"))
        .filter(total__gt=1)
    )
    for duplicate in duplicates.iterator():
        ResumeSaved.objects.filter(
            company_id=duplicate["company_id"],
            resume_id=duplicate["resume_id"],
        ).exclude(id=duplicate["first_id"]).delete()


def dedupe_resume_viewed(apps, schema_editor):
    ResumeViewed = apps.get_model("info", "ResumeViewed")
    duplicates = (
        ResumeViewed.objects.values("company_id", "resume_id")
        .annotate(first_id=models.Min("id"), total=models.Count("id"), total_views=models.Sum("views"))
        .filter(total__gt=1)
    )
    for duplicate in duplicates.iterator():
        ResumeViewed.objects.filter(id=duplicate["first_id"]).update(views=duplicate["total_views"] or 0)
        ResumeViewed.objects.filter(
            company_id=duplicate["company_id"],
            resume_id=duplicate["resume_id"],
        ).exclude(id=duplicate["first_id"]).delete()


def dedupe_contact_profiles(apps, schema_editor):
    ContactProfile = apps.get_model("info", "ContactProfile")
    duplicates = (
        ContactProfile.objects.values("company_id", "resume_id")
        .annotate(first_id=models.Min("id"), total=models.Count("id"))
        .filter(total__gt=1)
    )
    for duplicate in duplicates.iterator():
        ContactProfile.objects.filter(
            company_id=duplicate["company_id"],
            resume_id=duplicate["resume_id"],
        ).exclude(id=duplicate["first_id"]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("info", "0004_companyverification"),
    ]

    operations = [
        migrations.RunPython(dedupe_resume_saved, migrations.RunPython.noop),
        migrations.RunPython(dedupe_resume_viewed, migrations.RunPython.noop),
        migrations.RunPython(dedupe_contact_profiles, migrations.RunPython.noop),
        migrations.AddConstraint(
            model_name="resumesaved",
            constraint=models.UniqueConstraint(
                fields=("company", "resume"),
                name="uq_resume_saved_company_resume",
            ),
        ),
        migrations.AddConstraint(
            model_name="resumeviewed",
            constraint=models.UniqueConstraint(
                fields=("company", "resume"),
                name="uq_resume_viewed_company_resume",
            ),
        ),
        migrations.AddConstraint(
            model_name="contactprofile",
            constraint=models.UniqueConstraint(
                fields=("company", "resume"),
                name="uq_contact_profile_company_resume",
            ),
        ),
    ]
