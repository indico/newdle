from pathlib import Path

from setuptools import setup


def read_requirements_file(path: Path):
    with path.open() as f:
        return [
            dep
            for d in f.readlines()
            if (dep := d.strip()) and not (dep.startswith(('-', '#')) or '://' in dep)
        ]


def get_requirements(fname: str):
    return read_requirements_file(Path(__file__).parent / fname)


setup(
    install_requires=get_requirements('requirements.txt'),
    extras_require={
        'dev': get_requirements('requirements.dev.txt'),
        'exchange': get_requirements('requirements.exchange.txt'),
        'cern': get_requirements('requirements.cern.txt'),
    },
)
