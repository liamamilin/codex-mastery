"""Read and update one explicit local JSON file."""
import json
import os
from pathlib import Path
import tempfile


class TaskError(Exception):
    pass


def read_tasks(data_path):
    path = Path(data_path)
    try:
        raw = path.read_text(encoding="utf-8")
    except FileNotFoundError:
        return []
    except (OSError, UnicodeError) as error:
        raise TaskError(f"无法读取数据文件：{error}") from error
    try:
        document = json.loads(raw)
        tasks = document["tasks"]
        if document["version"] != 1 or not isinstance(tasks, list):
            raise ValueError("format")
        ids = set()
        for task in tasks:
            if not isinstance(task, dict):
                raise ValueError("task")
            task_id = task["id"]
            if type(task_id) is not int or task_id < 1 or task_id in ids:
                raise ValueError("id")
            if not isinstance(task["title"], str) or not task["title"].strip():
                raise ValueError("title")
            if type(task["done"]) is not bool:
                raise ValueError("done")
            ids.add(task_id)
        return tasks
    except (ValueError, KeyError, TypeError) as error:
        raise TaskError("数据格式异常，未修改文件；请先检查并备份原文件。") from error


def write_tasks(data_path, tasks):
    path = Path(data_path)
    temporary = None
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=path.parent, delete=False) as handle:
            temporary = Path(handle.name)
            json.dump({"version": 1, "tasks": tasks}, handle, ensure_ascii=False, indent=2)
            handle.write("\n")
        os.replace(temporary, path)
    except OSError as error:
        raise TaskError(f"无法保存，未报告操作成功：{error}") from error
    finally:
        if temporary is not None and temporary.exists():
            temporary.unlink()


def add_task(data_path, title):
    clean_title = title.strip()
    if not clean_title:
        raise TaskError("标题不能为空。")
    tasks = read_tasks(data_path)
    task = {"id": max((item["id"] for item in tasks), default=0) + 1, "title": clean_title, "done": False}
    write_tasks(data_path, tasks + [task])
    return task


def complete_task(data_path, task_id):
    tasks = read_tasks(data_path)
    for task in tasks:
        if task["id"] == task_id:
            task["done"] = True
            write_tasks(data_path, tasks)
            return task
    raise TaskError(f"没有编号为 {task_id} 的任务。")
