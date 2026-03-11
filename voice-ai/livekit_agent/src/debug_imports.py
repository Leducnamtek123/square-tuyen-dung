
import livekit.agents
import livekit.agents.voice_assistant
try:
    import livekit.agents.pipeline
    print("livekit.agents.pipeline exists")
    print(dir(livekit.agents.pipeline))
except ImportError:
    print("livekit.agents.pipeline DOES NOT exist")

print("livekit.agents.voice_assistant contents:")
print(dir(livekit.agents.voice_assistant))

print("livekit.agents top level:")
print(dir(livekit.agents))
