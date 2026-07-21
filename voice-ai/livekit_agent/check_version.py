import importlib.util

import livekit.agents

print("LiveKit Agents Version:", getattr(livekit.agents, "__version__", "unknown"))
print("Available in livekit.agents:")
for name in dir(livekit.agents):
    if not name.startswith("_"):
        print(f" - {name}")

if importlib.util.find_spec("livekit.agents.pipeline"):
    print("Found livekit.agents.pipeline")
else:
    print("Did NOT find livekit.agents.pipeline")
