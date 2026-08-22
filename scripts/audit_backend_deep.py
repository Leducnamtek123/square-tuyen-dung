import os
import ast
import glob
import json
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
API_DIR = BASE_DIR / "api"

def parse_python_file(filepath):
    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            code = f.read()
        tree = ast.parse(code, filename=str(filepath))
        return code, tree
    except Exception as e:
        return None, None

def analyze_models(app_name, filepath):
    code, tree = parse_python_file(filepath)
    if not tree:
        return []
    models = []
    for node in ast.walk(tree):
        if isinstance(node, ast.ClassDef):
            # Check if subclass of models.Model
            is_model = any(
                isinstance(b, ast.Attribute) and b.attr == "Model"
                or (isinstance(b, ast.Name) and b.id == "Model")
                or (isinstance(b, ast.Attribute) and "Model" in b.attr)
                or (isinstance(b, ast.Name) and "Model" in b.id)
                for b in node.bases
            )
            fields = []
            meta_indexes = []
            meta_ordering = []
            meta_constraints = []
            for item in node.body:
                if isinstance(item, ast.Assign):
                    for target in item.targets:
                        if isinstance(target, ast.Name) and not target.id.startswith("_"):
                            field_name = target.id
                            field_type = "Unknown"
                            if isinstance(item.value, ast.Call):
                                if isinstance(item.value.func, ast.Attribute):
                                    field_type = item.value.func.attr
                                elif isinstance(item.value.func, ast.Name):
                                    field_type = item.value.func.id
                            fields.append({"name": field_name, "type": field_type})
                elif isinstance(item, ast.ClassDef) and item.name == "Meta":
                    for meta_item in item.body:
                        if isinstance(meta_item, ast.Assign):
                            for target in meta_item.targets:
                                if isinstance(target, ast.Name):
                                    if target.id == "indexes":
                                        meta_indexes.append(ast.unparse(meta_item.value))
                                    elif target.id == "ordering":
                                        meta_ordering.append(ast.unparse(meta_item.value))
                                    elif target.id == "constraints":
                                        meta_constraints.append(ast.unparse(meta_item.value))
            models.append({
                "app": app_name,
                "name": node.name,
                "line": node.lineno,
                "file": str(filepath.relative_to(BASE_DIR)),
                "fields_count": len(fields),
                "fields": fields,
                "indexes": meta_indexes,
                "constraints": meta_constraints
            })
    return models

def analyze_serializers(app_name, filepath):
    code, tree = parse_python_file(filepath)
    if not tree:
        return []
    serializers = []
    for node in ast.walk(tree):
        if isinstance(node, ast.ClassDef):
            is_serializer = any("Serializer" in (b.id if isinstance(b, ast.Name) else b.attr if isinstance(b, ast.Attribute) else "") for b in node.bases)
            if is_serializer or "Serializer" in node.name:
                methods = [m.name for m in node.body if isinstance(m, ast.FunctionDef)]
                serializers.append({
                    "app": app_name,
                    "name": node.name,
                    "line": node.lineno,
                    "file": str(filepath.relative_to(BASE_DIR)),
                    "methods": methods
                })
    return serializers

def analyze_views(app_name, filepath):
    code, tree = parse_python_file(filepath)
    if not tree:
        return []
    views = []
    for node in ast.walk(tree):
        if isinstance(node, ast.ClassDef):
            is_view = any("View" in (b.id if isinstance(b, ast.Name) else b.attr if isinstance(b, ast.Attribute) else "") for b in node.bases)
            if is_view or "View" in node.name or "ViewSet" in node.name:
                actions = [m.name for m in node.body if isinstance(m, ast.FunctionDef)]
                permission_classes = []
                queryset = None
                serializer_class = None
                for item in node.body:
                    if isinstance(item, ast.Assign):
                        for target in item.targets:
                            if isinstance(target, ast.Name):
                                if target.id == "permission_classes":
                                    permission_classes.append(ast.unparse(item.value))
                                elif target.id == "serializer_class":
                                    serializer_class = ast.unparse(item.value)
                                elif target.id == "queryset":
                                    queryset = ast.unparse(item.value)
                views.append({
                    "app": app_name,
                    "name": node.name,
                    "line": node.lineno,
                    "file": str(filepath.relative_to(BASE_DIR)),
                    "actions": actions,
                    "permission_classes": permission_classes,
                    "serializer_class": serializer_class,
                    "queryset": queryset
                })
    return views

def analyze_urls(app_name, filepath):
    code, tree = parse_python_file(filepath)
    if not tree:
        return []
    patterns = []
    # Search for path(), re_path(), router.register()
    for node in ast.walk(tree):
        if isinstance(node, ast.Call):
            func_name = ""
            if isinstance(node.func, ast.Name):
                func_name = node.func.id
            elif isinstance(node.func, ast.Attribute):
                func_name = f"{ast.unparse(node.func.value)}.{node.func.attr}"
            
            if func_name in ("path", "re_path") and len(node.args) >= 2:
                route = ast.unparse(node.args[0])
                view = ast.unparse(node.args[1])
                name = None
                for kw in node.keywords:
                    if kw.arg == "name":
                        name = ast.unparse(kw.value)
                patterns.append({
                    "type": "path",
                    "route": route.strip("'\""),
                    "view": view,
                    "name": name.strip("'\"") if name else None,
                    "file": str(filepath.relative_to(BASE_DIR)),
                    "line": node.lineno
                })
            elif "router.register" in func_name and len(node.args) >= 2:
                prefix = ast.unparse(node.args[0])
                viewset = ast.unparse(node.args[1])
                basename = None
                for kw in node.keywords:
                    if kw.arg == "basename":
                        basename = ast.unparse(kw.value)
                patterns.append({
                    "type": "router",
                    "prefix": prefix.strip("'\""),
                    "viewset": viewset,
                    "basename": basename.strip("'\"") if basename else None,
                    "file": str(filepath.relative_to(BASE_DIR)),
                    "line": node.lineno
                })
    return patterns

def analyze_tasks(app_name, filepath):
    code, tree = parse_python_file(filepath)
    if not tree:
        return []
    tasks = []
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            is_task = any(
                isinstance(d, ast.Name) and d.id in ("shared_task", "task")
                or (isinstance(d, ast.Attribute) and d.attr in ("shared_task", "task"))
                or (isinstance(d, ast.Call) and (
                    isinstance(d.func, ast.Name) and d.func.id in ("shared_task", "task")
                    or (isinstance(d.func, ast.Attribute) and d.func.attr in ("shared_task", "task"))
                ))
                for d in node.decorator_list
            )
            if is_task or "task" in node.name.lower():
                tasks.append({
                    "app": app_name,
                    "name": node.name,
                    "line": node.lineno,
                    "file": str(filepath.relative_to(BASE_DIR)),
                    "decorators": [ast.unparse(d) for d in node.decorator_list]
                })
    return tasks

def scan_backend():
    results = {
        "apps": {},
        "all_models": [],
        "all_serializers": [],
        "all_views": [],
        "all_urls": [],
        "all_tasks": [],
    }
    
    app_dirs = [d for d in (API_DIR / "apps").iterdir() if d.is_dir()] + [API_DIR / "common", API_DIR / "integrations", API_DIR / "shared", API_DIR / "config"]
    
    for app_dir in app_dirs:
        app_name = app_dir.name
        py_files = list(app_dir.rglob("*.py"))
        app_info = {
            "name": app_name,
            "path": str(app_dir.relative_to(BASE_DIR)),
            "py_files_count": len(py_files),
            "models": [],
            "serializers": [],
            "views": [],
            "urls": [],
            "tasks": []
        }
        
        for py_file in py_files:
            if "__pycache__" in str(py_file) or "migrations" in str(py_file):
                continue
            
            # Models
            if "model" in py_file.name:
                models = analyze_models(app_name, py_file)
                app_info["models"].extend(models)
                results["all_models"].extend(models)
            
            # Serializers
            if "serializer" in py_file.name or "serializers" in str(py_file):
                serializers = analyze_serializers(app_name, py_file)
                app_info["serializers"].extend(serializers)
                results["all_serializers"].extend(serializers)
            
            # Views
            if "view" in py_file.name or "views" in str(py_file):
                views = analyze_views(app_name, py_file)
                app_info["views"].extend(views)
                results["all_views"].extend(views)
            
            # URLs
            if "url" in py_file.name:
                urls = analyze_urls(app_name, py_file)
                app_info["urls"].extend(urls)
                results["all_urls"].extend(urls)
                
            # Tasks
            if "task" in py_file.name or "queue" in py_file.name:
                tasks = analyze_tasks(app_name, py_file)
                app_info["tasks"].extend(tasks)
                results["all_tasks"].extend(tasks)
                
        results["apps"][app_name] = app_info
        
    out_dir = BASE_DIR / "docs" / "backend-audit"
    out_dir.mkdir(parents=True, exist_ok=True)
    with open(out_dir / "inventory_raw.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
        
    print(f"Scan complete!")
    print(f"Total Apps: {len(results['apps'])}")
    print(f"Total Models: {len(results['all_models'])}")
    print(f"Total Serializers: {len(results['all_serializers'])}")
    print(f"Total Views/ViewSets: {len(results['all_views'])}")
    print(f"Total URL Rules: {len(results['all_urls'])}")
    print(f"Total Tasks: {len(results['all_tasks'])}")

if __name__ == "__main__":
    scan_backend()
