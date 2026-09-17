import pytest
from rest_framework.test import APIClient
from apps.operations.models import AsyncOperation, OperationStatus


@pytest.fixture
def client():
    return APIClient()


@pytest.mark.django_db
def test_get_operation_detail_unassigned(client):
    op = AsyncOperation.objects.create(
        type="test.unassigned",
        title="Public Operation",
        status=OperationStatus.RUNNING,
        progress=10,
    )
    res = client.get(f"/api/v1/operations/{op.id}/")
    assert res.status_code == 200
    assert res.data["id"] == op.id
    assert res.data["type"] == "test.unassigned"
    assert res.data["status"] == "running"
    assert res.data["progress"] == 10


@pytest.mark.django_db
def test_get_operation_detail_owner(client, job_seeker_user, employer_user):
    op = AsyncOperation.objects.create(
        type="test.user_op",
        title="User Operation",
        user=job_seeker_user,
        status=OperationStatus.RUNNING,
    )

    # Owner can access
    client.force_authenticate(user=job_seeker_user)
    res = client.get(f"/api/v1/operations/{op.id}/")
    assert res.status_code == 200
    assert res.data["id"] == op.id

    # Another user cannot access
    client.force_authenticate(user=employer_user)
    res = client.get(f"/api/v1/operations/{op.id}/")
    assert res.status_code == 403

    # Unauthenticated user cannot access
    client.force_authenticate(user=None)
    res = client.get(f"/api/v1/operations/{op.id}/")
    assert res.status_code in (401, 403)


@pytest.mark.django_db
def test_get_operation_detail_company(client, employer_user, company, job_seeker_user):
    op = AsyncOperation.objects.create(
        type="test.company_op",
        title="Company Operation",
        company=company,
        status=OperationStatus.RUNNING,
    )

    # Employer associated with company can access
    client.force_authenticate(user=employer_user)
    res = client.get(f"/api/v1/operations/{op.id}/")
    assert res.status_code == 200
    assert res.data["id"] == op.id

    # Job seeker cannot access
    client.force_authenticate(user=job_seeker_user)
    res = client.get(f"/api/v1/operations/{op.id}/")
    assert res.status_code == 403


@pytest.mark.django_db
def test_get_operation_detail_admin(client, admin_user, job_seeker_user):
    op = AsyncOperation.objects.create(
        type="test.admin_view",
        title="Jobseeker Op",
        user=job_seeker_user,
        status=OperationStatus.RUNNING,
    )
    client.force_authenticate(user=admin_user)
    res = client.get(f"/api/v1/operations/{op.id}/")
    assert res.status_code == 200
    assert res.data["id"] == op.id


@pytest.mark.django_db
def test_get_operation_detail_not_found(client):
    res = client.get("/api/v1/operations/op_nonexistent/")
    assert res.status_code == 404


@pytest.mark.django_db
def test_active_operations_filtering(client, job_seeker_user, employer_user, admin_user):
    op1 = AsyncOperation.objects.create(
        type="test.active_1",
        title="Active 1",
        user=job_seeker_user,
        status=OperationStatus.RUNNING,
    )
    op2 = AsyncOperation.objects.create(
        type="test.active_2",
        title="Active 2",
        user=job_seeker_user,
        status=OperationStatus.QUEUED,
    )
    op3 = AsyncOperation.objects.create(
        type="test.completed",
        title="Completed",
        user=job_seeker_user,
        status=OperationStatus.COMPLETED,
    )
    op4 = AsyncOperation.objects.create(
        type="test.active_other",
        title="Active Other",
        user=employer_user,
        status=OperationStatus.RUNNING,
    )

    # Job seeker sees only their queued & running operations
    client.force_authenticate(user=job_seeker_user)
    res = client.get("/api/v1/operations/active/")
    assert res.status_code == 200
    results = res.data["results"]
    ids = [item["id"] for item in results]
    assert op1.id in ids
    assert op2.id in ids
    assert op3.id not in ids
    assert op4.id not in ids

    # Admin sees all active operations
    client.force_authenticate(user=admin_user)
    res = client.get("/api/v1/operations/active/")
    assert res.status_code == 200
    admin_ids = [item["id"] for item in res.data["results"]]
    assert op1.id in admin_ids
    assert op2.id in admin_ids
    assert op4.id in admin_ids
    assert op3.id not in admin_ids


@pytest.mark.django_db
def test_cancel_operation_success(client, job_seeker_user):
    op = AsyncOperation.objects.create(
        type="test.cancellable",
        title="Cancellable Op",
        user=job_seeker_user,
        status=OperationStatus.RUNNING,
    )

    client.force_authenticate(user=job_seeker_user)
    res = client.post(f"/api/v1/operations/{op.id}/cancel/")
    assert res.status_code == 200
    assert res.data["success"] is True
    assert res.data["operation"]["status"] == "cancelled"
    assert res.data["operation"]["finishedAt"] is not None

    op.refresh_from_db()
    assert op.status == OperationStatus.CANCELLED
    assert op.finished_at is not None


@pytest.mark.django_db
def test_cancel_operation_already_completed(client, job_seeker_user):
    op = AsyncOperation.objects.create(
        type="test.completed",
        title="Completed Op",
        user=job_seeker_user,
        status=OperationStatus.COMPLETED,
    )

    client.force_authenticate(user=job_seeker_user)
    res = client.post(f"/api/v1/operations/{op.id}/cancel/")
    assert res.status_code == 400
    assert res.data["success"] is False

    op.refresh_from_db()
    assert op.status == OperationStatus.COMPLETED


@pytest.mark.django_db
def test_cancel_operation_unauthorized(client, job_seeker_user, employer_user):
    op = AsyncOperation.objects.create(
        type="test.cancellable",
        title="Cancellable Op",
        user=job_seeker_user,
        status=OperationStatus.RUNNING,
    )

    client.force_authenticate(user=employer_user)
    res = client.post(f"/api/v1/operations/{op.id}/cancel/")
    assert res.status_code == 403

    op.refresh_from_db()
    assert op.status == OperationStatus.RUNNING
