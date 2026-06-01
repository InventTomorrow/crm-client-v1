import os
import re
import shutil

PROJECT_ROOT = "/home/aw/Documents/Dev/web/Projects/automated-crm/client"
SRC_DIR = os.path.join(PROJECT_ROOT, "src")
COMPONENTS_DIR = os.path.join(SRC_DIR, "components")
SHARED_DIR = os.path.join(SRC_DIR, "shared")
UI_DIR = os.path.join(SHARED_DIR, "ui")
COMPONENTS_JSON = os.path.join(PROJECT_ROOT, "components.json")

def kebab_to_pascal(name):
    # Split by hyphen and capitalize each part
    parts = name.split('-')
    # If the name is acronym like otp or kbd, let's keep standard capitalization
    pascal_parts = []
    for part in parts:
        if part.lower() == "otp":
            pascal_parts.append("Otp") # Standard PascalCase
        elif part.lower() == "kbd":
            pascal_parts.append("Kbd")
        else:
            pascal_parts.append(part.capitalize())
    return "".join(pascal_parts)

def main():
    # 1. Rename src/components to src/shared if it exists and shared doesn't
    if os.path.exists(COMPONENTS_DIR):
        if not os.path.exists(SHARED_DIR):
            print(f"Renaming {COMPONENTS_DIR} to {SHARED_DIR}...")
            shutil.move(COMPONENTS_DIR, SHARED_DIR)
        else:
            # If src/shared already exists, move ui folder inside it
            src_ui = os.path.join(COMPONENTS_DIR, "ui")
            dest_ui = os.path.join(SHARED_DIR, "ui")
            if os.path.exists(src_ui):
                print(f"Moving {src_ui} to {dest_ui}...")
                os.makedirs(os.path.dirname(dest_ui), exist_ok=True)
                shutil.move(src_ui, dest_ui)
                # Remove src/components if empty
                try:
                    os.rmdir(COMPONENTS_DIR)
                except OSError:
                    pass

    if not os.path.exists(UI_DIR):
        print(f"Error: {UI_DIR} does not exist.")
        return

    # 2. Get all UI files to map their names
    ui_files = [f for f in os.listdir(UI_DIR) if f.endswith(".tsx") or f.endswith(".ts")]
    mapping = {}
    for f in ui_files:
        base_name, ext = os.path.splitext(f)
        pascal_name = kebab_to_pascal(base_name)
        mapping[base_name] = pascal_name
        print(f"Mapping: {base_name} -> {pascal_name}")

    # 3. Update components.json paths
    if os.path.exists(COMPONENTS_JSON):
        print(f"Updating {COMPONENTS_JSON}...")
        with open(COMPONENTS_JSON, "r", encoding="utf-8") as f:
            content = f.read()

        # Replace components alias
        content = content.replace("@/components", "@/shared")
        content = content.replace("@/components/ui", "@/shared/ui")

        with open(COMPONENTS_JSON, "w", encoding="utf-8") as f:
            f.write(content)

    # 4. Recursively scan and update imports in all ts/tsx files in src/
    print("Updating file contents...")
    for root, dirs, files in os.walk(SRC_DIR):
        # Skip node_modules or .next if they somehow got in src/
        if "node_modules" in dirs:
            dirs.remove("node_modules")
        if ".next" in dirs:
            dirs.remove(".next")

        for file in files:
            if file.endswith(".ts") or file.endswith(".tsx") or file.endswith(".css"):
                file_path = os.path.join(root, file)

                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    orig_content = f.read()

                content = orig_content

                # Replace absolute alias imports: "@/components/ui/xxx" -> "@/shared/ui/Xxx"
                # Let's handle both double and single quotes
                for kebab_name, pascal_name in mapping.items():
                    # Pattern 1: '@/components/ui/kebab-name' -> '@/shared/ui/PascalName'
                    content = content.replace(f"@/components/ui/{kebab_name}", f"@/shared/ui/{pascal_name}")
                    # Pattern 2: '@/shared/ui/kebab-name' -> '@/shared/ui/PascalName' (if folder was already renamed but file was kebab-case)
                    content = content.replace(f"@/shared/ui/{kebab_name}", f"@/shared/ui/{pascal_name}")
                    # Relative imports inside ui folder itself: "./kebab-name" -> "./PascalName"
                    if root == UI_DIR:
                        content = re.sub(r'from\s+["\']\./' + kebab_name + r'["\']', f'from "./{pascal_name}"', content)
                        content = re.sub(r'import\s+["\']\./' + kebab_name + r'["\']', f'import "./{pascal_name}"', content)

                # Fallback: rename general "@/components/..." to "@/shared/..."
                content = content.replace("@/components/", "@/shared/")

                if content != orig_content:
                    print(f"Updated imports in {os.path.relpath(file_path, PROJECT_ROOT)}")
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(content)

    # 5. Rename the files themselves to CapitalCase
    print("Renaming actual files...")
    for kebab_name, pascal_name in mapping.items():
        # Check standard extensions (.tsx and .ts)
        for ext in [".tsx", ".ts"]:
            old_path = os.path.join(UI_DIR, f"{kebab_name}{ext}")
            new_path = os.path.join(UI_DIR, f"{pascal_name}{ext}")
            if os.path.exists(old_path) and old_path != new_path:
                print(f"Renaming file: {kebab_name}{ext} -> {pascal_name}{ext}")
                # Use os.rename
                os.rename(old_path, new_path)

    print("Success! UI components renamed and relocated successfully.")

if __name__ == "__main__":
    main()
