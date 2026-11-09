#!/usr/bin/env python3
"""Copy this kit's skills to a selected project; never replace existing skills."""
import argparse
from pathlib import Path
import shutil
import sys


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project', required=True, type=Path)
    parser.add_argument('--agent', choices=['all', 'codex', 'cursor', 'claude'], default='all')
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    project = args.project.expanduser().resolve()
    if not project.is_dir():
        parser.error('Project must be an existing directory.')
    source = Path(__file__).resolve().parent / 'skills'
    skills = sorted(p for p in source.iterdir() if p.is_dir() and (p / 'SKILL.md').is_file())
    if len(skills) != 4:
        parser.error('Incomplete kit: expected four skill folders.')
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
