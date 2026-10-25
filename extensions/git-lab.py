"""Create an independent temporary Git exercise; never changes the source repo."""
from pathlib import Path
import shutil
import subprocess
import tempfile


def git(directory, *arguments):
    return subprocess.run(
        ["git", *arguments], cwd=directory, check=True,
        text=True, capture_output=True,
    ).stdout.strip()


def main():
    source = Path(__file__).resolve().parents[1] / "cases/B-tasktrail/starter"
    if not (source / "tasktrail.py").is_file():
        raise SystemExit("找不到案例 B 起点，请保留本脚本在教材 extensions 目录中。")
    if shutil.which("git") is None:
        raise SystemExit("未找到 Git。请安装 Git 2.28+ 后重新打开终端。")
    root = Path(tempfile.mkdtemp(prefix="codex-git-lab-")) / "tasktrail"
    shutil.copytree(source, root, ignore=shutil.ignore_patterns("__pycache__", "*.pyc", ".git"))
    git(root, "init", "-b", "main")
    # These settings belong only to this generated exercise repository.
    git(root, "config", "user.name", "Codex Lab")
    git(root, "config", "user.email", "lab@example.invalid")
    git(root, "config", "commit.gpgsign", "false")
    hooks = root / ".git" / "lab-hooks"
    hooks.mkdir()
    git(root, "config", "core.hooksPath", str(hooks))
    git(root, "add", "--", "README.md", "tasktrail.py", "tasks.py", "sample.json", "tests/test_cli.py", "notes/ideas.md")
    git(root, "commit", "-m", "lab: record TaskTrail baseline")
    print(root)


if __name__ == "__main__":
    main()
