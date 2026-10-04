from pathlib import Path
import re

for source in [Path("README.md"), *Path("docs").glob("*.md")]:
    for link in re.findall(r"\]\(([^)]+)\)", source.read_text()):
        if link.startswith(("http:", "https:", "mailto:")):
            continue
        target = link.split("#")[0]
        if target and not (source.parent / target).exists():
            raise SystemExit(f"Broken link in {source}: {link}")
print("Documentation links passed")
