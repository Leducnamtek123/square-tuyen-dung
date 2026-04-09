"""
Interview Module — LiveKit Service
"""

import os
import uuid
import asyncio
import logging
from decouple import config
from livekit import api

LIVEKIT_API_KEY = config('LIVEKIT_API_KEY', default='devkey')
LIVEKIT_API_SECRET = config('LIVEKIT_API_SECRET', default='secret')
LIVEKIT_URL = config('LIVEKIT_URL', default='http://livekit:7880')
MINIO_ROOT_USER = config('MINIO_ROOT_USER', default='minioadmin')
MINIO_ROOT_PASSWORD = config('MINIO_ROOT_PASSWORD', default='minioadmin')
MINIO_BUCKET = config('MINIO_BUCKET', default='square')
LIVEKIT_AGENT_NAME = config('LIVEKIT_AGENT_NAME', default='square-ai-interviewer')

logger = logging.getLogger(__name__)

class LiveKitService:
    @staticmethod
    def ensure_room_with_agent(room_name: str) -> None:
        """
        Ensure room exists and is configured to dispatch the interview agent.
        If room already exists, ignore the error.
        """
        async def _create_room():
            lkapi = api.LiveKitAPI(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
            try:
                req = api.CreateRoomRequest(name=room_name)
                if LIVEKIT_AGENT_NAME:
                    req.agents.append(api.RoomAgentDispatch(agent_name=LIVEKIT_AGENT_NAME))
                await lkapi.room.create_room(req)
            finally:
                await lkapi.aclose()

        async def _room_exists():
            lkapi = api.LiveKitAPI(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
            try:
                resp = await lkapi.room.list_rooms(api.ListRoomsRequest(names=[room_name]))
                return len(getattr(resp, "rooms", []) or []) > 0
            finally:
                await lkapi.aclose()

        async def _has_participants():
            lkapi = api.LiveKitAPI(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
            try:
                resp = await lkapi.room.list_participants(api.ListParticipantsRequest(room=room_name))
                return len(getattr(resp, "participants", []) or []) > 0
            finally:
                await lkapi.aclose()

        async def _delete_room():
            lkapi = api.LiveKitAPI(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
            try:
                await lkapi.room.delete_room(api.DeleteRoomRequest(room=room_name))
            finally:
                await lkapi.aclose()

        try:
            # If the room exists but is empty, delete it to ensure agent config is applied.
            try:
                if asyncio.run(_room_exists()) and not asyncio.run(_has_participants()):
                    asyncio.run(_delete_room())
            except Exception as cleanup_exc:
                logger.warning("LiveKit pre-cleanup failed: %s", cleanup_exc)
            asyncio.run(_create_room())
        except Exception as exc:
            message = str(exc).lower()
            if "already exists" in message or "already_exists" in message:
                return
            logger.warning("LiveKit create_room failed: %s", exc)

    @staticmethod
    def create_token(room_name: str, participant_identity: str, participant_name: str, is_agent: bool = False) -> str:
        """
        Tạo JWT token cho người dùng (hoặc agent) join room LiveKit.
        """
        token_builder = (api.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
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
        # Room agent is already attached when the room is created via ensure_room_with_agent().
        # Avoid attaching room_config to participant tokens to prevent triggering participant-level
        # agent jobs when workers only handle room-level jobs.
        return token_builder.to_jwt()

    @staticmethod
    def delete_room(room_name: str) -> None:
        """Delete a LiveKit room by name."""
        async def _delete_room():
            lkapi = api.LiveKitAPI(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
            try:
                await lkapi.room.delete_room(api.DeleteRoomRequest(room=room_name))
            finally:
                await lkapi.aclose()

        try:
            asyncio.run(_delete_room())
        except Exception as exc:
            logger.warning("LiveKit delete_room failed: %s", exc)

    @staticmethod
    def create_observer_token(
        room_name: str,
        observer_identity: str,
        observer_name: str,
    ) -> str:
        """
        Tạo JWT token cho employer quan sát ẩn.
        hidden=True: ứng viên không thấy participant này.
        can_publish=False: không thể nói/gửi media.
        can_subscribe=True: có thể nghe audio realtime.
        """
        token_builder = (
            api.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
            .with_identity(observer_identity)
            .with_name(observer_name)
            .with_grants(api.VideoGrants(
                room_join=True,
                room=room_name,
                room_admin=False,
                can_publish=False,
                can_publish_data=False,
                can_subscribe=True,
                hidden=True,
            ))
        )
        return token_builder.to_jwt()

    @staticmethod
    def start_recording(room_name: str) -> None:
        """Start a room composite egress to record the interview to S3/MinIO."""
        async def _start_egress():
            lkapi = api.LiveKitAPI(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
            try:
                filepath = f"interviews/{room_name}/recording.mp4"
                s3_upload = api.S3Upload(
                    access_key=MINIO_ROOT_USER,
                    secret=MINIO_ROOT_PASSWORD,
                    endpoint="http://minio:9000",
                    bucket=MINIO_BUCKET,
                    force_path_style=True,
                )
                
                req = api.RoomCompositeEgressRequest(
                    room_name=room_name,
                    file=api.EncodedFileOutput(
                        filepath=filepath,
                        s3=s3_upload
                    )
                )
                await lkapi.egress.start_room_composite_egress(req)
                logger.info("Started egress recording for room %s at %s", room_name, filepath)
            finally:
                await lkapi.aclose()
        
        try:
            asyncio.run(_start_egress())
        except Exception as exc:
            logger.warning("LiveKit start_recording failed: %s", exc)
