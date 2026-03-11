import livekit.agents
import inspect

sig = inspect.signature(livekit.agents.AgentSession.__init__)
print(f"AgentSession.__init__ signature: {sig}")

sig_agent = inspect.signature(livekit.agents.Agent.__init__)
print(f"Agent.__init__ signature: {sig_agent}")
