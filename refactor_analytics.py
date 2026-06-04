import re

file_path = r"e:\other project\working dashboard\src\app\dashboard\analytics\page.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

imports_to_add = """import { PageContainer } from '@/components/ui/PageContainer';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { DashboardGrid } from '@/components/ui/DashboardGrid';
import { MetricCard } from '@/components/ui/MetricCard';
import { ChartCard } from '@/components/ui/ChartCard';
import { InsightCard } from '@/components/ui/InsightCard';
import { Card } from '@/components/ui/Card';
import { ProfileCard } from '@/components/ui/ProfileCard';
import { DataCard } from '@/components/ui/DataCard';
import { ChartContainer } from '@/components/ui/ChartContainer';
import { EmptyState } from '@/components/ui/EmptyState';
"""

# 1. Insert imports
for i, line in enumerate(lines):
    if line.startswith("import") and "react" not in line and "lucide-react" not in line and "recharts" not in line:
        # Just put it around line 10
        lines.insert(10, imports_to_add)
        break

content = "".join(lines)

# Remove local definitions
content = re.sub(r"function AnalyticsSection\(\{.*?\}\) \{.*?\n\}\n\n", "", content, flags=re.DOTALL)
content = re.sub(r"function AnalyticsCard\(\{.*?\}\) \{.*?\n\}\n\n", "", content, flags=re.DOTALL)
content = re.sub(r"function StatCard\(\{.*?\}\) \{.*?\n\}\n\n", "", content, flags=re.DOTALL)
content = re.sub(r"// ─── Mini Profile Card.*?function MiniProfileCard\(\{.*?\}\) \{.*?\n\}\n\n", "", content, flags=re.DOTALL)
content = re.sub(r"// ─── Premium Empty State.*?function PremiumEmptyState\(\{.*?\}\) \{.*?\n\}\n\n", "", content, flags=re.DOTALL)

# Main wrappers
content = re.sub(
    r'<div className="flex flex-col gap-10 animate-fade-in pb-16 max-w-\[1600px\] mx-auto w-full">',
    r'<PageContainer>',
    content
)
content = re.sub(
    r'</AnalyticsSection>\n\n    </div>\n  \);\n}',
    r'</SectionContainer>\n\n    </PageContainer>\n  );\n}',
    content
)

# Section Headers
content = re.sub(
    r'<AnalyticsSection icon=\{([^\}]+)\} title="([^"]+)" subtitle="([^"]+)">',
    r'<SectionContainer>\n        <SectionHeader title="\2" description="\3" />',
    content
)
content = re.sub(
    r'<AnalyticsSection title="([^"]+)" subtitle="([^"]+)">',
    r'<SectionContainer>\n        <SectionHeader title="\1" description="\2" />',
    content
)
content = re.sub(r'<AnalyticsSection>', r'<SectionContainer>', content)
content = re.sub(r'</AnalyticsSection>', r'</SectionContainer>', content)

# DashboardGrid matching via indentation!
lines = content.split('\n')
out_lines = []
grid_stack = [] # stores the indentation string

for line in lines:
    stripped = line.strip()
    indent = line[:len(line) - len(stripped)]
    
    # Check if we are closing a grid
    if stripped == "</div>" and len(grid_stack) > 0 and grid_stack[-1] == indent:
        out_lines.append(indent + "</DashboardGrid>")
        grid_stack.pop()
        continue
        
    # Check if we are opening a grid
    grid_match = re.search(r'<div className="grid[^"]*?grid-cols-[^"]*?">', line)
    if grid_match:
        cls = grid_match.group(0)
        cols = 3
        if "xl:grid-cols-4" in cls or "lg:grid-cols-4" in cls: cols = 4
        elif "lg:grid-cols-2" in cls or "xl:grid-cols-2" in cls or "md:grid-cols-2" in cls and "lg:grid-cols-3" not in cls: cols = 2
        
        line = line.replace(cls, f"<DashboardGrid columns={{{cols}}}>")
        grid_stack.append(indent)
    
    out_lines.append(line)

content = '\n'.join(out_lines)

# Other card replacements
content = re.sub(r'<AnalyticsCard[^>]*>', r'<Card>', content)
content = re.sub(r'</AnalyticsCard>', r'</Card>', content)
content = re.sub(r'<StatCard ', r'<MetricCard ', content)
content = re.sub(r'color=', r'iconColor=', content)
content = re.sub(r'<PremiumEmptyState ', r'<EmptyState ', content)
content = re.sub(r'desc=', r'description=', content)
content = re.sub(r'<MiniProfileCard\s+name=\{([^}]+)\}\s+subtitle=\{([^}]+)\}\s+count=\{([^}]+)\}\s+/>', r'<ProfileCard name={\1} status={\2} metadata={<>{ \3 } messages</>} />', content, flags=re.DOTALL)


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Done")
