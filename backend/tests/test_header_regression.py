import re
from pathlib import Path

def test_single_header_in_root_layout_only():
    """
    Regression Test: Ensures <Navbar /> is mounted ONLY once in root layout.tsx
    and NEVER duplicated inside individual page components (such as /extension).
    """
    app_dir = Path(__file__).resolve().parent.parent.parent / "frontend" / "src" / "app"
    
    # 1. Root layout must mount Navbar exactly once
    root_layout = app_dir / "layout.tsx"
    assert root_layout.exists(), "Root layout.tsx must exist"
    layout_content = root_layout.read_text(encoding="utf-8")
    
    navbar_mounts = len(re.findall(r"<Navbar\s*/>", layout_content))
    assert navbar_mounts == 1, f"Root layout must mount <Navbar /> exactly once, found {navbar_mounts}"

    # 2. No page component under app/ may mount Navbar or Header directly
    page_files = list(app_dir.glob("**/page.tsx"))
    assert len(page_files) >= 9, f"Expected at least 9 page routes, found {len(page_files)}"
    
    violations = []
    for page_path in page_files:
        content = page_path.read_text(encoding="utf-8")
        if re.search(r"<Navbar\s*/>|<header\b", content, re.IGNORECASE):
            violations.append(str(page_path.relative_to(app_dir.parent.parent)))
            
    assert len(violations) == 0, f"Found duplicate header/Navbar mounts in pages: {violations}"

def test_navbar_no_wrap_and_drawer_accessibility():
    """
    Regression Test: Ensures nav labels have whitespace-nowrap, primary nav landmark,
    and mobile drawer includes aria-expanded, role='dialog', and close mechanisms.
    """
    navbar_file = Path(__file__).resolve().parent.parent.parent / "frontend" / "src" / "components" / "common" / "Navbar.tsx"
    assert navbar_file.exists(), "Navbar.tsx must exist"
    content = navbar_file.read_text(encoding="utf-8")
    
    # Check whitespace-nowrap
    assert "whitespace-nowrap" in content, "Navbar must enforce whitespace-nowrap on navigation labels"
    
    # Check primary landmark
    assert 'aria-label="Primary Navigation"' in content, "Navbar must define primary navigation landmark"
    
    # Check mobile menu accessibility
    assert 'aria-expanded={isMobileMenuOpen}' in content, "Mobile hamburger toggle must have aria-expanded attribute"
    assert 'role="dialog"' in content, "Mobile drawer must have role='dialog'"
    assert 'aria-modal="true"' in content, "Mobile drawer must declare aria-modal='true'"
    assert 'Escape' in content, "Navbar must handle Escape key for dismissing dropdowns and drawer"
