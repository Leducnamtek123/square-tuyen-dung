"""
Interview Module — LiveKit Service
"""

import os
import uuid
from decouple import config
from livekit import api

LIVEKIT_API_KEY = config('LIVEKIT_API_KEY', default='devkey')
LIVEKIT_API_SECRET = config('LIVEKIT_API_SECRET', default='secret')

class LiveKitService:
    @staticmethod
    def create_token(room_name: str, participant_identity: str, participant_name: str, is_agent: bool = False) -> str:
        """
        Tạo JWT token cho người dùng (hoặc agent) join room LiveKit.
        """
        token = (api.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
            .with_identity(participant_identity)
            .with_name(participant_name)
            .with_grants(api.VideoGrants(
                room_join=True,
                room=room_name,
                # Agent cần quyền quản lý phòng ẩn
                room_admin=is_agent,
                can_publish=True,
                can_publish_data=True,
                can_subscribe=True,
                hidden=is_agent
            )))
        return token.to_jwt()
