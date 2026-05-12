import importlib.util
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1] / "src"

if "livekit_agent" not in sys.modules:
    spec = importlib.util.spec_from_file_location(
        "livekit_agent",
        ROOT / "__init__.py",
        submodule_search_locations=[str(ROOT)],
    )
    module = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    sys.modules["livekit_agent"] = module
    spec.loader.exec_module(module)
