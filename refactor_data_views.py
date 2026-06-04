import re
import os

pages = [
    r"e:\other project\working dashboard\src\app\dashboard\leads\page.tsx",
    r"e:\other project\working dashboard\src\app\dashboard\appointments\page.tsx",
    r"e:\other project\working dashboard\src\app\dashboard\conversations\page.tsx",
    r"e:\other project\working dashboard\src\app\dashboard\follow-ups\page.tsx"
]

for file_path in pages:
    if not os.path.exists(file_path):
        continue
    
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Imports
    if "import { PageContainer }" not in content:
        imports_to_add = "import { PageContainer } from '@/components/ui/PageContainer';\n"
        if "from 'lucide-react';" in content:
            content = re.sub(
                r"(from 'lucide-react';\n)",
                r"\1" + imports_to_add,
                content
            )
        else:
            content = re.sub(
                r"(import .*?;\n)",
                r"\1" + imports_to_add,
                content,
                count=1
            )

    # 2. Main Wrapper
    content = re.sub(
        r'<div className="flex flex-col gap-6(.*?)*?">',
        r'<PageContainer>',
        content,
        count=1
    )
    # Replaces the last closing div of the main wrapper
    content = re.sub(
        r'</div>\n    </div>\n  \);\n}',
        r'</div>\n    </PageContainer>\n  );\n}',
        content
    )
    # A few files might have one less div closing tag at the end (like conversations)
    if "PageContainer" in content and "</PageContainer>" not in content:
        content = re.sub(
            r'</div>\n  \);\n}',
            r'</PageContainer>\n  );\n}',
            content
        )

    # 3. For leads page grid fixing
    if "leads/page.tsx" in file_path.replace("\\", "/"):
        if "import { DashboardGrid }" not in content:
             content = re.sub(r"import \{ PageContainer \} from '@\/components\/ui\/PageContainer';\n", 
                              "import { PageContainer } from '@/components/ui/PageContainer';\nimport { DashboardGrid } from '@/components/ui/DashboardGrid';\n", content)
        content = re.sub(
            r'<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 p-1">',
            r'<DashboardGrid columns={4}>',
            content
        )
        content = re.sub(
            r'          \)\)}\n        </div>\n      \)}',
            r'          ))}\n        </DashboardGrid>\n      )}',
            content
        )

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Done")
