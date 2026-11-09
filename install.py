#!/usr/bin/env python3
"""Copy this kit's skills to a selected project; never replace existing skills."""
import argparse
from pathlib import Path
import shutil
import sys


EXPECTED_SKILLS = ['pw-e2e-cases', 'pw-e2e-debug', 'pw-e2e-review', 'pw-e2e-screen', 'pw-ui-explore']
# Every skill must carry the contract. Any other reference file that appears in more
# than one skill is a shared copy too, and all copies must stay identical.
REQUIRED_REFERENCE = 'references/e2e-contract.md'


def check_kit(source):
    """Return kit problems: missing skills, or shared reference copies that drifted apart."""
    problems = []
    skills = sorted(p.name for p in source.iterdir() if p.is_dir() and (p / 'SKILL.md').is_file())
    if skills != EXPECTED_SKILLS:
        problems.append(f'Expected skills {EXPECTED_SKILLS}, found {skills}.')
    shared = {}
    for name in EXPECTED_SKILLS:
        skill = source / name
        if not (skill / REQUIRED_REFERENCE).is_file():
            problems.append(f'Missing {skill / REQUIRED_REFERENCE}.')
        refs = skill / 'references'
        if refs.is_dir():
            for path in refs.glob('*.md'):
                shared.setdefault(path.name, {}).setdefault(path.read_bytes(), []).append(name)
    for filename, copies in sorted(shared.items()):
        if len(copies) > 1:
            groups = '; '.join(', '.join(names) for names in copies.values())
            problems.append(f'references/{filename} differs between skills ({groups}). Keep every copy identical.')
    return problems


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project', type=Path)
    parser.add_argument('--agent', choices=['all', 'codex', 'cursor', 'claude'], default='all')
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--check', action='store_true', help='Only validate the kit itself, then exit.')
    args = parser.parse_args()
    source = Path(__file__).resolve().parent / 'skills'
    problems = check_kit(source)
    if args.check:
        for problem in problems:
            print(f'FAIL: {problem}')
        if not problems:
            print('Kit OK.')
        sys.exit(1 if problems else 0)
    if problems:
        parser.error('Incomplete or inconsistent kit: ' + ' '.join(problems))
    if args.project is None:
        parser.error('--project is required unless --check is used.')
    project = args.project.expanduser().resolve()
    if not project.is_dir():
        parser.error('Project must be an existing directory.')
    skills = [source / name for name in EXPECTED_SKILLS]
    # Current Codex and Cursor share .agents/skills. Avoid duplicate discovery.
    roots = {
        'all': ['.agents/skills', '.claude/skills'],
        'codex': ['.agents/skills'],
        'cursor': ['.agents/skills'],
        'claude': ['.claude/skills'],
    }[args.agent]
    copies = [(skill, project / root / skill.name) for root in roots for skill in skills]
    # Preflight every destination before any write, including dangling symlinks.
    for _, target in copies:
        for parent in [target, *target.parents]:
            if parent == project:
                break
            if parent.is_symlink():
                parser.error(f'Refusing symlink destination: {parent}')
            if parent.exists() and not parent.is_dir():
                parser.error(f'Destination is not a directory: {parent}')
        if target.exists():
            parser.error(f'Already exists; compare/update manually: {target}')
    for skill, target in copies:
        print(f'{"Would copy" if args.dry_run else "Copy"}: {skill.name} -> {target}')
        if not args.dry_run:
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copytree(skill, target)
    if not args.dry_run:
        print('Installed. Templates and project instructions were not changed.')


if __name__ == '__main__':
    try:
        main()
    except OSError as exc:
        sys.exit(f'Installation failed: {exc}. Inspect printed destinations before retrying.')
