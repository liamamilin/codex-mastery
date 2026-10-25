# 案例 B · TaskTrail：接手一个陌生项目

离线、Python 标准库、JSON 文件存储的微型任务 CLI。练习目标是先调查已有代码，再增加列表状态筛选；不是重新写一个任务产品。真正的 Codex 操作由读者在自己的副本进行，此目录中的参考实现与测试不会调用模型。

## 先取起点

- `starter/`：已有读取、添加、完成与列表能力；说明有意只覆盖常用操作，隐藏边界需要通过代码与测试调查。
- `solution/`：增加 `list --status open|done|all` 的参考成品。**完成第 7 章调查以前，不要先读参考答案。**
- `examples/`：第 9 章使用的短项目约定与接续记录格式，文件名带 `example`，不会自动成为你的 Codex 指引。

前提是 Python 3.9 或更新版本。无需 pip、npm、数据库、网络服务或 API Key。Codex 协作需要自己的已登录环境；单独运行 CLI 与测试不需要 Codex。

在教材仓库根目录，把 `starter` 复制到一个**尚不存在**的独立目录。下面的 `my-tasktrail` 只是练习名，已有同名文件时改用新名称，不覆盖旧成果。

```sh
# macOS / Linux；从教材根目录开始
cp -R cases/B-tasktrail/starter my-tasktrail
cd my-tasktrail
python3 --version
python3 -B tasktrail.py --data sample.json list
```

```powershell
# Windows PowerShell；从教材根目录开始
Copy-Item -Recurse cases/B-tasktrail/starter my-tasktrail
Set-Location my-tasktrail
py -3 --version
py -3 -B tasktrail.py --data sample.json list
```

若 Windows 没有 `py`，但 `python --version` 返回 Python 3，可用 `python` 替代 `py -3`。`-B` 禁止生成 Python 字节码缓存，不是关闭数据保存。相对 `--data` 路径从终端当前目录解析，必须放在子命令之前。

初始样本应显示一条未完成、一条已完成。检查写入行为时，使用自己的新文件：

```sh
# 以下均在 my-tasktrail；Windows 将 python3 换成 py -3
python3 -B tasktrail.py --data scratch.json add "整理学习记录"
python3 -B tasktrail.py --data scratch.json list
python3 -B tasktrail.py --data scratch.json done 1
python3 -B tasktrail.py --data scratch.json list
python3 -B -m unittest discover -s tests -v
```

命令逐次退出，再次运行会重新读取文件。完成后看到 `[x] #1 整理学习记录` 才支持完成状态已保存；程序输出成功不等于所有输入都已验证。测试在系统临时目录中创建并清理数据，不修改 `sample.json`。

## 要完成的修改

在副本中增加：`list --status open` 只显示未完成；`done` 只显示已完成；`all` 和省略参数时显示全部。不得因筛选而重写数据文件、改变编号或丢掉已有任务。无匹配项应有可理解反馈，不存在的状态应拒绝。

建议把任务分为调查简报、最小改动、行为回归三步。第 7—9 章分别训练事实调查、选择必要上下文、保存项目约定与状态。说明“目前支持什么”时引用当前副本，不把 `solution` 中的能力写成起点已有。

## 对照参考成品（剧透）

只在完成自己的实现后，从教材根目录进入 `cases/B-tasktrail/solution`，运行：

```sh
python3 -B tasktrail.py --data sample.json list --status open
python3 -B tasktrail.py --data sample.json list --status done
python3 -B tasktrail.py --data sample.json list --status all
python3 -B -m unittest discover -s tests -v
```

前两条分别只显示编号 1 和 2；第三条显示两条。可以比较文件差异，但不用逐字复制参考实现。参考成品将筛选留在命令行显示层，没有修改数据格式。

## 行为边界与失败处理（调查后再读）

空白标题、找不到的任务编号、损坏 JSON 都返回非零退出码 2，错误写到标准错误输出，不将操作报告为成功。空列表读取不存在的数据文件不会新建文件；第一次合法添加才创建。损坏 JSON 不会被自动覆盖为空列表。读写权限或格式错误时，先检查报错中的数据路径并备份原文件，不要直接删除所有数据。

这是单进程学习工具；两个命令并发修改同一文件可能覆盖彼此结果。不支持云同步、多用户、删除、标签或数据导入。文件替换降低单次写入中断留下半截 JSON 的机会，不等于数据库事务或永久备份。

## 验证记录

制作时的真实命令与结果见 `verification.md`。读者亲自进行的新会话接续不包含在自动测试证明中。测试适用于本案例的程序，不证明 Codex 在你的账号、操作系统或权限配置下已经完成同一任务。
