
import json
import logging

import redis

from django.conf import settings

logger = logging.getLogger(__name__)

class RedisService:

    def __init__(self):

        try:

            self.redis_service = redis.StrictRedis(

                host=settings.SERVICE_REDIS_HOST,

                port=settings.SERVICE_REDIS_PORT,

                db=settings.SERVICE_REDIS_DB,

                password=settings.SERVICE_REDIS_PASSWORD,

                decode_responses=True,

                charset="utf-8"

            )

        except Exception as e:
            logger.exception("Redis initialization failed: %s", e)

            self.redis_service = None

    def health(self):

        if self.redis_service is None:

            return False

        return True

    def redis_response(self, status=True, data=None, message=""):

        return {

            "status": status,

            "data": data,

            "message": message

        }

    def set_data_by_key(self, key, value, seconds=15 * 24 * 60 * 60):

        if self.redis_service is None:

            return self.redis_response(status=False, message="REDIS INITIALIZATION FAILED")

        data = self.redis_service.get(key)

        verifier = self.redis_service.set(key, value, seconds)

        if data is None:

            if verifier:

                return self.redis_response(message="INSERT SUCCESS")

            return self.redis_response(status=False, message="INSERT FAILURE")

        else:

            if verifier:

                return self.redis_response(message="UPDATE SUCCESS")

            return self.redis_response(status=False, message="UPDATE FAILURE")

    def get_value_by_key(self, key):

        if self.redis_service is None:

            return self.redis_response(status=False, message="REDIS INITIALIZATION FAILED")

        data = self.redis_service.get(key)

        if data is not None:

            data = json.loads(data.replace("'", '"').replace("None", "null"))

        return self.redis_response(data=data)

    def remove_value_by_key(self, key):

        try:

            if self.redis_service is None:

                return self.redis_response(status=False, message="REDIS INITIALIZATION FAILED")

            data = self.redis_service.delete(key)

            return self.redis_response(data=data)

        except Exception as e:
            logger.exception("remove_value_by_key failed: %s", e)

            return self.redis_response(status=False)
