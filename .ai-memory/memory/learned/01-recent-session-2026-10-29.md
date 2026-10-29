# Recent session — 2026-10-29

This note records what was created and shipped on 2026-10-29. Paths below are relative git paths.

## go-email-reader

- Specifications for warm-up sequences 08 through 13 are in `02-spec/21-app/08-ui-and-warm-up-algorithm-improvements/` through `02-spec/21-app/13-ui-and-warm-up-algorithm-improvements/`.
- Plans are in `.ai-memory/plans/pending/08-ui-and-warm-up-algorithm-improvements.md` through `.ai-memory/plans/pending/13-ui-and-warm-up-algorithm-improvements.md`.
- Sequence 08 is the connector and gate map. Sequence 09 is brakes. Sequence 10 is the send lease and cool-down. Sequence 11 is the shadow compare. Sequence 12 is the pace envelope. Sequence 13 is the shared quiet window.
- The live tick now consults `internal/warmup/gatefeed.go`. A peer can tighten the remaining-send cap and cannot raise it. An absent or stale peer does not stop local warm-up. Local quiet hours hold. A quiet skip does not send. A dry run does not spend the cap. The gate order is health, cadence, connector, theme.
- The reader UI gate map reads `GET /api/warmup/gates`.
- Commit `f3864ee` is on `main` and is pushed. The remote uses SSH.
- Sequences 08 through 13 stay pending as catalogs. Only the gate engine is implemented.
- `user.email` is `local@gitmap`. The name is `gitmap automation`.

## gitmap-v28

- Cursor-like IDE setup landed in `cli/cmdide/ide_setup.go`, `cli/cmdide/setup/`, and `cli/cmdui/ui_server_ide_setup.go`.
- The spec is `02-spec/21-app/352-cursor-like-ide-setup-from-gitmap/`.
- Pushed commits include `3229df9b4`, `864012968`, and `04690b952`.
- `cli/cov` is a coverage profile and was not committed.

## repo-cache

- Commit `f474298` stores heatmap databases, including `.heatmap/06-cursor/go-email-reader/heatmap.db`.
- SQLite `-shm` and `-wal` sidecars were not committed.

## Push denied

These local commits are still unpushed because GitHub denied `alimtvnetwork`:

- `alim.karim.profile` (19 commits)
- `kubernetes-training-v1` (19 commits)
- `common-linux-installer` (1 commit)

## Rules learned

- Do not put a personal access token in a git remote URL. Use SSH.
- Do not commit coverage profiles or SQLite sidecar files.

## Last 30 commits in this repo

```text
7173f0d chore(version) - bump to v0.4.49
0081ae0 feat(sync) - sync canonical v6 execute suite, gitmap heatmap telemetry, skills, and prompts (29-Oct-26 06:33 pm)
25ad3bf chore(version) - bump to v0.4.48
5a27105 feat(sync) - sync canonical v6 execute suite, gitmap heatmap telemetry, skills, and prompts (29-Oct-26 04:25 pm)
6e5f9ca chore(version) - bump to v0.4.47
c4d1721 feat(sync) - sync canonical v6 execute suite, gitmap heatmap telemetry, skills, and prompts (29-Oct-26 03:19 pm)
89308ae chore(version) - bump to v0.4.46
18a3ede feat(sync) - sync canonical v6 execute suite, gitmap heatmap telemetry, skills, and prompts (29-Oct-26 02:56 pm)
a53eb95 chore(version) - bump to v0.4.45
f1c4e40 feat(sync) - sync canonical v6 execute suite, gitmap heatmap telemetry, skills, and prompts (28-Oct-26 10:20 am)
8e01df5 chore(version) - bump to v0.4.44
ba9abff feat(sync) - sync canonical v6 execute suite, gitmap heatmap telemetry, skills, and prompts
bf618d6 chore(version) - bump to v0.4.43
f458112 feat(sync) - sync canonical v6 execute suite, gitmap heatmap telemetry, skills, and prompts
d75a5a5 chore(version): bump to v0.4.42
a99a142 feat(sync): sync canonical prompts, skills, gitmap agent standards, and purge deprecated 46 task manager
cca2e91 chore(version): bump to v0.4.41
36af396 feat(sync): sync canonical prompts, skills, gitmap agent standards, and purge deprecated 46 task manager
e096965 chore(version): bump to v0.4.40
c04fb84 feat(sync): sync canonical prompts, skills, gitmap agent standards, and purge deprecated 46 task manager
677754f chore(version): bump to v0.4.39
e9bec5a feat(sync): sync canonical prompts, skills, gitmap agent standards, and purge deprecated 46 task manager
b6ceece chore(version): bump to v0.4.38
acdbdff feat(sync): sync canonical prompts, skills, gitmap agent standards, and purge deprecated 46 task manager
4a53038 chore(version) - bump to v0.4.37
01697ba feat(sync) - sync canonical v6 execute suite, gitmap heatmap telemetry, skills, and prompts
1cbbdcd chore(version): bump to v0.4.36
c03d46f feat(sync): sync canonical prompts, skills, gitmap agent standards, and purge deprecated 46 task manager
1882246 chore(version) - bump to v0.4.35
fff31ae feat(sync) - sync canonical v6 execute suite, gitmap heatmap telemetry, skills, and prompts
```
