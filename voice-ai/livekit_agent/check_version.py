import livekit.agents
import inspect

print("LiveKit Agents Version:", getattr(livekit.agents, "__version__", "unknown"))
print("Available in livekit.agents:")
for name in dir(livekit.agents):
    if not name.startswith("_"):
        print(f" - {name}")

try:
    from livekit.agents import pipeline
    print("Found livekit.agents.pipeline")
except ImportError:
    print("Did NOT find livekit.agents.pipeline")
