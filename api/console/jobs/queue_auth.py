
from celery import shared_task

from shared.helpers import helper
from common.firebase import get_firestore_client

from shared.configs import variable_system as var_sys

@shared_task

def update_avatar(user_id, avatar_url):

    if not avatar_url:

        avatar_url = var_sys.AVATAR_DEFAULT["AVATAR"]

    database = get_firestore_client()
    if not database:
        return

    account_ref = database.collection("accounts").document(str(user_id))

    try:

        account_doc = account_ref.get()

        if account_doc.exists:

            account = account_doc.to_dict()

            update_data = {

                "avatarUrl": avatar_url

            }

            if account["company"]:

                update_data.update({"company.imageUrl": avatar_url})

            account_ref.update(update_data)

    except Exception as e:

        helper.print_log_error("update_avatar", e)

@shared_task

def update_info(user_id, name):

    database = get_firestore_client()
    if not database:
        return

    account_ref = database.collection("accounts").document(str(user_id))

    try:

        account_doc = account_ref.get()

        if account_doc.exists:

            account = account_doc.to_dict()

            update_data = {

                "name": name

            }

            if account["company"]:

                update_data.update({

                    "company.companyName": name,

                })

            account_ref.update(update_data)

    except Exception as e:

        helper.print_log_error("update_info", e)
