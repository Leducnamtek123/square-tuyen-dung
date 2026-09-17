import importlib
import logging
from typing import Dict, List, Optional
from apps.exchange.base import BaseExchangeDefinition

logger = logging.getLogger(__name__)


class ExchangeRegistry:
    def __init__(self):
        self._registry: Dict[str, BaseExchangeDefinition] = {}

    def register(self, definition_class):
        instance = definition_class()
        if not instance.entity_type:
            raise ValueError(f"Definition class {definition_class.__name__} has no entity_type.")
        self._registry[instance.entity_type] = instance
        logger.info("Registered exchange definition: %s", instance.entity_type)
        return definition_class

    def get(self, entity_type: str) -> Optional[BaseExchangeDefinition]:
        return self._registry.get(entity_type)

    def all(self) -> Dict[str, BaseExchangeDefinition]:
        return self._registry

    def list_accessible_definitions(self, user, company) -> List[dict]:
        results = []
        for entity_type, defn in self._registry.items():
            if not defn.has_permission(user, company):
                continue

            results.append({
                "entityType": entity_type,
                "label": defn.label,
                "supportsExport": defn.supports_export,
                "supportsImport": defn.supports_import,
                "exportFields": [
                    {
                        "key": k,
                        "label": f.label,
                        "defaultChecked": f.default_checked,
                        "description": f.description,
                    }
                    for k, f in defn.export_fields.items()
                    if not f.sensitive
                ],
                "importFields": [
                    {
                        "key": k,
                        "label": f.label,
                        "fieldType": f.field_type,
                        "required": f.required,
                        "example": f.example,
                        "description": f.description,
                        "choices": [
                            {"value": c[0], "label": c[1]} for c in (f.choices or [])
                        ],
                    }
                    for k, f in defn.import_fields.items()
                ],
                "matchingKeys": defn.matching_keys,
                "defaultMatchingKey": defn.default_matching_key,
                "supportedModes": defn.supported_modes,
                "atomicImport": defn.atomic_import,
            })
        return results

    def autodiscover(self):
        modules = [
            "apps.exchange.definitions.candidate",
            "apps.exchange.definitions.employee",
            "apps.exchange.definitions.job_post",
            "apps.exchange.definitions.department",
            "apps.exchange.definitions.attendance",
            "apps.exchange.definitions.payroll",
            "apps.exchange.definitions.audit_log",
            "apps.exchange.definitions.question_bank",
            "apps.exchange.definitions.interview",
            "apps.exchange.definitions.leave_request",
            "apps.exchange.definitions.user",
            "apps.exchange.definitions.company",
        ]
        for mod in modules:
            try:
                importlib.import_module(mod)
            except Exception as e:
                logger.warning("Could not auto-import %s: %s", mod, e)


exchange_registry = ExchangeRegistry()
