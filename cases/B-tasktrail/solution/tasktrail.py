"""TaskTrail command-line entry point. Uses only the Python standard library."""
import argparse
from pathlib import Path
import sys

from tasks import TaskError, add_task, complete_task, read_tasks


def main(argv=None):
    parser = argparse.ArgumentParser(description="TaskTrail：本地任务清单")
    parser.add_argument("--data", required=True, type=Path, help="使用哪个 JSON 数据文件")
    commands = parser.add_subparsers(dest="command", required=True)
    listing = commands.add_parser("list", help="列出任务")
    listing.add_argument("--status", choices=["open", "done", "all"], default="all", help="按完成状态筛选；默认 all")
    add = commands.add_parser("add", help="添加任务")
    add.add_argument("title", help="任务标题；含空格时加引号")
    done = commands.add_parser("done", help="按编号标记完成")
    done.add_argument("id", type=int)
    args = parser.parse_args(argv)
    try:
        if args.command == "add":
            task = add_task(args.data, args.title)
            print(f"已添加 #{task['id']} {task['title']}")
        elif args.command == "done":
            task = complete_task(args.data, args.id)
            print(f"已完成 #{task['id']} {task['title']}")
        else:
            tasks = read_tasks(args.data)
            if args.status != "all":
                tasks = [task for task in tasks if task["done"] == (args.status == "done")]
            for task in tasks:
                mark = "x" if task["done"] else " "
                print(f"[{mark}] #{task['id']} {task['title']}")
            if not tasks:
                print("没有符合条件的任务。")
        return 0
    except TaskError as error:
        print(f"错误：{error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
