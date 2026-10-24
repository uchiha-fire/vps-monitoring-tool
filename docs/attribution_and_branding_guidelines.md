# Zephyrus Labs: Credit, Attribution & Branding Guidelines

This document defines the standardized branding, licensing, attribution, and developer credit architecture for all software, CLI tools, libraries, and open-source packages released under **Zephyrus Labs**.

---

## 1. Core Brand & Identity Manifest

All tools produced under this initiative must adhere to the following unified identity:

| Element | Standard Value | Usage Context |
| :--- | :--- | :--- |
| **Organization Name** | **Zephyrus Labs** | Primary organization brand & package author |
| **Official Domain / Website** | `https://zephyrus-labs.tech/` | Primary package homepage, badge link, and author URL |
| **Organization Email** | `zephyrus.labs@gmail.com` | Official contact, PyPI author email, security inquiries |
| **Lead Developer** | **Shubham Sharma** | Maintainer & Lead Creator credit |
| **Developer LinkedIn** | `https://www.linkedin.com/in/shubham-sharma-28487819b/` | Profile badge, README footer recognition |
| **Developer GitHub** | `https://github.com/uchiha-fire` | Repository owner, developer handle |
| **Developer Email** | `sharmashubham25962@gmail.com` | Maintainer contact email |
| **License Standard** | **MIT License** | Standard permissive open-source license |

---

## 2. Standardized File Templates

### 2.1 `pyproject.toml` Template
Every project must configure modern PEP 621 metadata with the following structure:

```toml
[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[project]
name = "<tool-name>-cli"  # Must be verified available on PyPI
version = "0.1.0"
authors = [
  { name = "Zephyrus Labs", email = "zephyrus.labs@gmail.com" },
]
maintainers = [
  { name = "Shubham Sharma", email = "sharmashubham25962@gmail.com" },
]
description = "A concise, high-impact one-line summary of what the tool accomplishes"
readme = "README.md"
license = { text = "MIT" }
requires-python = ">=3.8"
keywords = ["<keyword1>", "<keyword2>", "cli", "zephyrus-labs"]
classifiers = [
    "Development Status :: 4 - Beta",
    "Environment :: Console",
    "Intended Audience :: Developers",
    "Intended Audience :: End Users/Desktop",
    "License :: OSI Approved :: MIT License",
    "Operating System :: OS Independent",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.8",
    "Programming Language :: Python :: 3.9",
    "Programming Language :: Python :: 3.10",
    "Programming Language :: Python :: 3.11",
    "Programming Language :: Python :: 3.12",
    "Topic :: Utilities",
]
dependencies = [
    # Explicitly list minimal dependencies with lower bounds
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
    "build>=1.0.0",
    "twine>=5.0.0",
]

[project.scripts]
<command-alias> = "<package_module>.cli:main"

[project.urls]
"Homepage" = "https://zephyrus-labs.tech/"
"Repository" = "https://github.com/uchiha-fire/<repo-name>"
"Bug Tracker" = "https://github.com/uchiha-fire/<repo-name>/issues"
"Documentation" = "https://github.com/uchiha-fire/<repo-name>#readme"
"LinkedIn" = "https://www.linkedin.com/in/shubham-sharma-28487819b/"

[tool.setuptools.packages.find]
where = ["."]
include = ["<package_module>*"]
```

---

### 2.2 `LICENSE` Template
Always use the standard MIT License attributed to **Zephyrus Labs**:

```text
MIT License

Copyright (c) 2026 Zephyrus Labs (https://zephyrus-labs.tech/)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

### 2.3 Package `__init__.py` Template
Expose standard Python package dunder attributes:

```python
"""
<tool-name>-cli
<Short Description>
"""

__version__ = "0.1.0"
__author__ = "Zephyrus Labs"
__maintainer__ = "Shubham Sharma"
__email__ = "zephyrus.labs@gmail.com"
__developer_email__ = "sharmashubham25962@gmail.com"

# Expose primary programmatic API
from .core import primary_function

__all__ = [
    "primary_function",
    "__version__",
    "__author__",
    "__maintainer__",
    "__email__",
    "__developer_email__",
]
```

---

### 2.4 `README.md` Standard Layout & Badges

Every repository must feature:
1. **Header Badges**:
   - PyPI version badge
   - Python versions badge
   - GitHub stars badge
   - License badge
   - Zephyrus Labs brand badge
2. **Organization Section**:
   - Website link, GitHub repo link, contact email.
3. **Third-Party Acknowledgements & Attributions**:
   - Explicit credit to every open-source library utilized, including library name, link to GitHub/docs, brief usage description, and original license type.
4. **Lead Developer Recognition (Right-aligned Footer)**:
   - Clickable LinkedIn profile link + GitHub handle + email.

```markdown
# <tool-name>-cli

[![PyPI version](https://img.shields.io/pypi/v/<tool-name>-cli.svg)](https://pypi.org/project/<tool-name>-cli/)
[![Python versions](https://img.shields.io/pypi/pyversions/<tool-name>-cli.svg)](https://pypi.org/project/<tool-name>-cli/)
[![GitHub stars](https://img.shields.io/github/stars/uchiha-fire/<repo-name>?style=social)](https://github.com/uchiha-fire/<repo-name>)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zephyrus Labs](https://img.shields.io/badge/Developed%20by-Zephyrus%20Labs-6366f1.svg)](https://zephyrus-labs.tech/)

A <description> by **[Zephyrus Labs](https://zephyrus-labs.tech/)** for Linux, macOS, and Windows.

...

## Developed & Maintained by Zephyrus Labs

Built and maintained by **[Zephyrus Labs](https://zephyrus-labs.tech/)**.

- 🌐 Website: [zephyrus-labs.tech](https://zephyrus-labs.tech/)
- 💻 GitHub: [@uchiha-fire](https://github.com/uchiha-fire)
- ✉️ Contact: [zephyrus.labs@gmail.com](mailto:zephyrus.labs@gmail.com)

If you find this tool helpful, please give it a ⭐️ on [GitHub](https://github.com/uchiha-fire/<repo-name>)!

---

## Acknowledgements & Attributions

This tool builds upon and credits the exceptional work of open-source projects:

- **[<library-name>](<url>)**: <Description of usage>. Licensed under <License>.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="right">
  <sub>Lead Developer: <a href="https://www.linkedin.com/in/shubham-sharma-28487819b/">Shubham Sharma</a> (<a href="https://github.com/uchiha-fire">@uchiha-fire</a>) &bull; <a href="mailto:sharmashubham25962@gmail.com">sharmashubham25962@gmail.com</a></sub>
</p>
```

---

## 3. Third-Party Attribution Policy

When integrating open-source libraries into Zephyrus Labs tools:
1. **Permissive Licenses Only**: Default to packages under MIT, BSD-2/3-Clause, Apache 2.0, or HPND.
2. **Avoid Viral Copyleft (GPL / AGPL)** in libraries intended for permissive commercial/personal distribution without explicit dual-licensing approval.
3. **Notice Retention**: Always retain copyright notices and license text embedded in third-party source files.
4. **Attribution Transparency**: Every new tool must maintain an `Acknowledgements & Attributions` section in its `README.md` identifying each underlying package.
