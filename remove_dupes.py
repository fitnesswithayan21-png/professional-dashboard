import re

file_path = r"e:\other project\working dashboard\src\app\dashboard\analytics\page.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Remove SectionHeader
content = re.sub(r"// ─── Section Header ─────────────────────────────────────────────────────────\nfunction SectionHeader\(\{.*?\}\) \{.*?\n\}\n\n", "", content, flags=re.DOTALL)

# Remove ChartContainer
content = re.sub(r"function ChartContainer\(\{.*?\}\) \{.*?\n\}\n\n", "", content, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Removed duplicates")
