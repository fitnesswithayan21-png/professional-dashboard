import re

file_path = r"e:\other project\working dashboard\src\app\dashboard\ai-memory\page.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Imports
imports_to_add = """import { PageContainer } from '@/components/ui/PageContainer';
import { DashboardGrid } from '@/components/ui/DashboardGrid';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/EmptyState';
"""

content = re.sub(
    r"import Link from 'next/link';\n",
    "import Link from 'next/link';\n" + imports_to_add,
    content
)

# 2. Main Wrapper
content = re.sub(
    r'<div className="flex flex-col gap-6">',
    r'<PageContainer>',
    content
)
content = re.sub(
    r'</div>\n    </div>\n  \);\n}',
    r'</DashboardGrid>\n    </PageContainer>\n  );\n}',
    content
)

# 3. Grid
content = re.sub(
    r'<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">',
    r'<DashboardGrid columns={3}>',
    content
)

# 4. Empty State
content = re.sub(
    r'<div className="col-span-full py-24 flex flex-col items-center justify-center text-center">.*?</div>\n        \) :',
    r'<div className="col-span-full py-12">\n            <EmptyState icon={Brain} title="No memory records found" description={search ? \'Try a different search term.\' : \'AI memory records will appear once leads engage.\'} />\n          </div>\n        ) :',
    content,
    flags=re.DOTALL
)

# 5. Cards
content = re.sub(
    r'<div\n                key=\{leadId\}\n                className="group relative flex flex-col bg-white rounded-\[22px\] border border-slate-200/70 shadow-\[0_4px_20px_rgba\(0,0,0,0\.04\)\] hover:shadow-\[0_16px_48px_rgba\(0,0,0,0\.10\)\] hover:-translate-y-1 transition-all duration-300 overflow-hidden"\n              >',
    r'<Card\n                key={leadId}\n                padding="none"\n                className="group relative flex flex-col hover:shadow-[0_16px_48px_rgba(0,0,0,0.10)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"\n              >',
    content
)
content = re.sub(
    r'</Link>\n                </div>\n              </div>\n            \);',
    r'</Link>\n                </div>\n              </Card>\n            );',
    content
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Done")
