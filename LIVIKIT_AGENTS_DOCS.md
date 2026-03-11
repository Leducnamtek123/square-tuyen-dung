# LiveKit Agents Documentation Reference

This document contains a comprehensive collection of LiveKit Agents documentation for reference.

## Table of Contents
1. [Voice AI Quickstart](#1-voice-ai-quickstart)
2. [Agent Sessions](#2-agent-sessions)
3. [Tasks and Task Groups](#3-tasks-and-task-groups)
4. [Workflows](#4-workflows)
5. [Tool Definition and Use](#5-tool-definition-and-use)
6. [Turn Detection and Interruptions](#6-turn-detection-and-interruptions)
7. [AI Models (LLM, STT, TTS)](#7-ai-models-llm-stt-tts)
8. [Agent Server and Job Lifecycle](#8-agent-server-and-job-lifecycle)
9. [Realtime Models](#9-realtime-models-eg-openai-realtime-api)

---

## 1. Voice AI Quickstart
**URL:** [https://docs.livekit.io/agents/start/voice-ai/](https://docs.livekit.io/agents/start/voice-ai/)

### Overview
This guide walks you through the setup of your very first voice assistant using LiveKit Agents. In less than 10 minutes, you'll have a voice assistant that you can speak to in your terminal, browser, telephone, or native app.

### Starter Projects
LiveKit provides starter projects for both Python and Node.js.
- **Python starter project**: Ready-to-go Python starter project. [GitHub repo](https://github.com/livekit-examples/agent-starter-python)
- **Node.js starter project**: Ready-to-go Node.js starter project. [GitHub repo](https://github.com/livekit-examples/agent-starter-node)

### Requirements
- Python >= 3.10 or Node.js >= 20.
- LiveKit Cloud account (recommended) or self-hosted LiveKit server.
- LiveKit CLI (`lk cloud auth` to link your project).

### Quickstart Steps
1. `lk agent init my-agent --template agent-starter-python` (or `agent-starter-node`)
2. `cd my-agent`
3. Install dependencies: `uv sync` (Python) or `pnpm install` (Node)
4. Download model files: `uv run src/agent.py download-files` or `pnpm download-files`
5. Run your agent: `uv run src/agent.py dev` or `pnpm dev`

### Agent Code (Python Example)
```python
from dotenv import load_dotenv
from livekit import agents, rtc
from livekit.agents import AgentServer, AgentSession, Agent, room_io
from livekit.plugins import noise_cancellation, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

load_dotenv(".env.local")

class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions="""You are a helpful voice AI assistant...""",
        )

server = AgentServer()

@server.rtc_session(agent_name="my-agent")
async def my_agent(ctx: agents.JobContext):
    session = AgentSession(
        stt="deepgram/nova-3:multi",
        llm="openai/gpt-4.1-mini",
        tts="cartesia/sonic-3:9626c31c-bec5-4cca-baa8-f8ba9e84c8bc",
        vad=silero.VAD.load(),
        turn_detection=MultilingualModel(),
    )
    await session.start(
        room=ctx.room,
        agent=Assistant(),
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: noise_cancellation.BVCTelephony() 
                if params.participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP 
                else noise_cancellation.BVC(),
            ),
        ),
    )
    await session.generate_reply(instructions="Greet the user.")

if __name__ == "__main__":
    agents.cli.run_app(server)
```

---

## 2. Agent Sessions
**URL:** [https://docs.livekit.io/agents/logic/sessions/](https://docs.livekit.io/agents/logic/sessions/)

### Overview
The `AgentSession` is the main orchestrator for your voice AI app. It collects user input, manages the voice pipeline, invokes the LLM, and sends output back.

### Lifecycle
- **Initializing**: Setting up, no audio/video processing.
- **Starting**: `session.start()` is called, transitions to `listening`.
- **Running**: Actively processing; transitions between `listening`, `thinking`, and `speaking`.
- **Closing**: Cleanup, draining speech, emitting `close` event.

### Key Events
- `agent_state_changed`: Track states like `listening`, `thinking`, `speaking`.
- `user_state_changed`: Track states like `listening`, `speaking`.
- `user_input_transcribed`: When STT results are available.
- `conversation_item_added`: When new items (speech/text) are added to the history.

### Sessions Options (Python)
- `tools`: List of `FunctionTool` objects.
- `mcp_servers`: List of MCP servers for external tools.
- `max_tool_steps`: Max consecutive tool calls (default: 3).
- `preemptive_generation`: Start LLM/TTS before end-of-turn (default: False).

---

## 3. Tasks and Task Groups
**URL:** [https://docs.livekit.io/agents/logic/tasks/](https://docs.livekit.io/agents/logic/tasks/)

### Overview
Tasks are focused, reusable units with typed results. They run inside an agent and take control of the session temporarily. `TaskGroup` allows for ordered sequences of tasks with regression support.

### Defining a Task (Python)
```python
from livekit.agents import AgentTask, function_tool

class CollectConsent(AgentTask[bool]):
    def __init__(self, chat_ctx=None):
        super().__init__(
            instructions="Ask for recording consent.",
            chat_ctx=chat_ctx,
        )
        
    async def on_enter(self) -> None:
        await self.session.generate_reply(instructions="Ask for permission to record.")

    @function_tool
    async def consent_given(self) -> None:
        self.complete(True)

    @function_tool
    async def consent_denied(self) -> None:
        self.complete(False)
```

### Running a Task
```python
class CustomerServiceAgent(Agent):
    async def on_enter(self) -> None:
        if await CollectConsent(chat_ctx=self.chat_ctx).run():
            await self.session.generate_reply(instructions="Offer assistance.")
        else:
            await self.session.generate_reply(instructions="End call.")
```

---

## 4. Workflows
**URL:** [https://docs.livekit.io/agents/logic/workflows/](https://docs.livekit.io/agents/logic/workflows/)

### Core Constructs
- **Agents**: Long-lived control, defines instructions and tools.
- **Tools**: Model-driven functions for side effects or handoffs.
- **Tasks**: Short-lived units of work with typed results.
- **Task Groups**: Orchestrate sequences of tasks.

---

## 5. Tool Definition and Use
**URL:** [https://docs.livekit.io/agents/logic/tools/](https://docs.livekit.io/agents/logic/tools/)

### Overview
LiveKit Agents supporting LLM tool use allowing agents to call external functions to extend context, interact with systems, or perform RAG.

### Function Tool Definition (Python)
Use the `@function_tool()` decorator.
```python
from livekit.agents import function_tool, Agent, RunContext

class MyAgent(Agent):
    @function_tool()
    async def lookup_weather(self, context: RunContext, location: str) -> dict:
        """Look up weather for a location."""
        return {"weather": "sunny", "temperature_f": 70}
```

### Key Concepts
- **Arguments**: Automatically mapped from function arguments. Type hints are used by the LLM.
- **Return Value**: Converted to string and fed back to the LLM. Return `None` for silent completion.
- **Handoffs**: Tools can return an `Agent` instance to trigger a handoff.
- **Speech in Tools**: Use `session.say()` or `session.generate_reply()` and *must* await `context.wait_for_playout()`.
- **Interruptions**: Tools can be interrupted by default. Use `ctx.disallow_interruptions()` for critical tasks.

---

## 6. Turn Detection and Interruptions
**URL:** [https://docs.livekit.io/agents/logic/turns/](https://docs.livekit.io/agents/logic/turns/)

### Overview
Turn detection determines when a user starts or ends their turn. It's often based on VAD (Voice Activity Detection).

### Turn Detection Modes
- **Turn detector model**: Open-weights model for context-aware detection.
- **Realtime models**: Built-in detection (e.g., OpenAI Realtime API).
- **VAD only**: Silence/speech based.
- **STT endpointing**: Phrase endpoints from STT providers.
- **Manual**: Push-to-Talk or similar.

### Interruption Handling
- Agent speech is paused when user speech is detected.
- Call `session.interrupt()` to manually stop the agent.
- Set `allow_interruptions=False` in `say()` or `generate_reply()` for uninterruptible speech.

---

## 7. AI Models (LLM, STT, TTS)
**URLs:** [LLM](https://docs.livekit.io/agents/models/llm/), [STT](https://docs.livekit.io/agents/models/stt/), [TTS](https://docs.livekit.io/agents/models/tts/)

### Pipeline Structure
1. **STT**: Spoken audio → Text.
2. **LLM**: Text → Response Text.
3. **TTS**: Response Text → Spoken Audio.

### Configuration in AgentSession
```python
session = AgentSession(
    stt="deepgram/nova-3:en",
    llm="openai/gpt-4.1-mini",
    tts="cartesia/sonic-3:9626c31c-bec5-4cca-baa8-f8ba9e84c8bc",
)
```

---

## 8. Agent Server and Job Lifecycle
**URL:** [https://docs.livekit.io/agents/server/](https://docs.livekit.io/agents/server/), [Job Lifecycle](https://docs.livekit.io/agents/server/job/)

### Overview
LiveKit Agents uses a server architecture to manage concurrent sessions. Each job (an agent session) runs in a separate process for isolation.

### Lifecycle & Entrypoint
The entrypoint is the main function executed for each new job.
- **Python**: Decorated with `@server.rtc_session()`.
- **Node.js**: Defined as a property of the default export.

### Session Shutdown
- Use `session.shutdown(drain=True)` for a graceful shutdown (drains pending speech).
- Use `await session.aclose()` for an immediate, awaitable close.
- Rooms can be deleted using `job_ctx.api.room.delete_room()` after session end.

---

## 9. Realtime Models (e.g., OpenAI Realtime API)
**URL:** [https://docs.livekit.io/agents/models/realtime/](https://docs.livekit.io/agents/models/realtime/)

### Overview
Realtime models consume and produce speech directly, bypassing STT and TTS components. They capture emotional context and verbal cues better than text-based pipelines.

### Usage in AgentSession
Pass the `RealtimeModel` instance to the `llm` argument.
```python
from livekit.agents import AgentSession
from livekit.plugins import openai

session = AgentSession(
    llm=openai.realtime.RealtimeModel()
)
```

### Considerations
- **Turn Detection**: Often built into the realtime model itself (e.g., server-side VAD).
- **Control**: You can optionally use a separate TTS with a realtime model if you want more control over the voice.

---

# Reference Summary
- **Quickstart**: `lk agent init` → `uv sync` → `python agent.py dev`.
- **Logic**: `AgentSession` manages the pipeline; `Agent` defines the brain.
- **Tools**: Use `@function_tool()` and `ctx.wait_for_playout()`.
- **Turns**: Handled by VAD and heuristics; automated by default.
- **Deployment**: `lk agent create` to deploy to LiveKit Cloud.
