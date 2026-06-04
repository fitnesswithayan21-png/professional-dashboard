import re

file_path = r"e:\other project\working dashboard\src\app\dashboard\page.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

imports = """import { PageContainer } from '@/components/ui/PageContainer';
import { DashboardGrid } from '@/components/ui/DashboardGrid';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/EmptyState';
"""

content = re.sub(r"import Link from 'next/link';\n", "import Link from 'next/link';\n" + imports, content)

# 1. PageContainer
content = re.sub(
    r'<div className="flex flex-col gap-6 animate-fade-in">',
    r'<PageContainer>',
    content
)
content = re.sub(
    r'</div>\n  \);\n}',
    r'</PageContainer>\n  );\n}',
    content
)

# 2. PageHeader
content = re.sub(
    r'<div>\s*<h2 className="text-\[22px\] font-semibold text-\[#0F172A\]">\{greeting\}, Admin</h2>\s*<p className="text-\[13px\] text-\[#64748B\] mt-0\.5">\{dateStr\}</p>\s*</div>',
    r'<SectionHeader title={`${greeting}, Admin`} description={dateStr} />',
    content
)

# 3. Grids
# Row 2: 8/4 split -> DashboardGrid columns={3}, span-2 and span-1
content = re.sub(
    r'<div className="grid grid-cols-12 gap-4" style=\{\{ height: 400 \}\}>\s*<div className="col-span-8 h-full"><DashboardBarChart /></div>\s*<div className="col-span-4 h-full"><DashboardDonutChart /></div>\s*</div>',
    r'<DashboardGrid columns={3} className="h-[400px]">\n        <div className="col-span-2 h-full"><DashboardBarChart /></div>\n        <div className="col-span-1 h-full"><DashboardDonutChart /></div>\n      </DashboardGrid>',
    content
)

# Row 3: 8/4 split
content = re.sub(
    r'<div className="grid grid-cols-12 gap-4" style=\{\{ height: 320 \}\}>',
    r'<DashboardGrid columns={3} className="h-[320px]">',
    content
)
content = re.sub(
    r'<div className="col-span-8 h-full"><DashboardAreaChart /></div>',
    r'<div className="col-span-2 h-full"><DashboardAreaChart /></div>',
    content
)

content = re.sub(
    r'<div className="col-span-4 h-full">',
    r'<div className="col-span-1 h-full">',
    content
)

# Needs Attention Card
content = re.sub(
    r'<div className="h-full bg-white border border-\[#E2E8F0\] rounded-xl shadow-\[0_1px_3px_rgba\(0,0,0,0\.04\)\] flex flex-col">',
    r'<Card className="h-full flex flex-col p-0 overflow-hidden">',
    content
)

content = re.sub(
    r'<div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-\[#F1F5F9\]">',
    r'<CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 py-4 px-5">',
    content
)

content = re.sub(
    r'<p className="text-\[14px\] font-semibold text-\[#0F172A\]">Needs Attention</p>',
    r'<CardTitle className="text-sm">Needs Attention</CardTitle>',
    content
)

# We need to change the closing div for CardHeader (the div after span)
# It looks like:
# {needsAttention.length > 0 && (...)}
# </div>
content = re.sub(
    r'</span>\n              \)}\n            </div>',
    r'</span>\n              )}\n            </CardHeader>',
    content
)

content = re.sub(
    r'</CardHeader>\n\n            <div className="flex-1 overflow-y-auto custom-scrollbar">',
    r'</CardHeader>\n\n            <CardContent className="flex-1 overflow-y-auto custom-scrollbar p-0">',
    content
)

# Replace the closing div of the card
#                   </div>
#                 )}
#               </div>
#             </div>
content = re.sub(
    r'</div>\n                  \)\}\n                </div>\n              \)\}\n            </div>\n          </div>',
    r'</div>\n                  )}\n                </div>\n              )}\n            </CardContent>\n          </Card>',
    content
)

# Replace the closing grid div for Row 3
content = re.sub(
    r'</Card>\n        </div>\n      </div>',
    r'</Card>\n        </div>\n      </DashboardGrid>',
    content
)


# Row 4: 8/4 split
content = re.sub(
    r'<div className="grid grid-cols-12 gap-4">',
    r'<DashboardGrid columns={3}>',
    content
)
content = re.sub(
    r'<div className="col-span-8">',
    r'<div className="col-span-2">',
    content
)
content = re.sub(
    r'<div className="col-span-4">',
    r'<div className="col-span-1">',
    content
)

# Recent Leads Card
content = re.sub(
    r'<div className="bg-white border border-\[#E2E8F0\] rounded-xl shadow-\[0_1px_3px_rgba\(0,0,0,0\.04\)\]">',
    r'<Card className="p-0 overflow-hidden">',
    content
)
content = re.sub(
    r'<div className="flex items-center justify-between px-5 py-4 border-b border-\[#F1F5F9\]">',
    r'<CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 py-4 px-5">',
    content
)
content = re.sub(
    r'<p className="text-\[14px\] font-semibold text-\[#0F172A\]">Recent Leads</p>',
    r'<CardTitle className="text-sm">Recent Leads</CardTitle>',
    content
)
content = re.sub(
    r'</Link>\n            </div>',
    r'</Link>\n            </CardHeader>',
    content
)
content = re.sub(
    r'</CardHeader>\n            <table className="w-full">',
    r'</CardHeader>\n            <CardContent className="p-0">\n            <table className="w-full">',
    content
)
content = re.sub(
    r'</table>\n          </div>',
    r'</table>\n            </CardContent>\n          </Card>',
    content
)

# Upcoming Schedule Card
content = re.sub(
    r'<div className="bg-white border border-\[#E2E8F0\] rounded-xl shadow-\[0_1px_3px_rgba\(0,0,0,0\.04\)\]">',
    r'<Card className="p-0 overflow-hidden">',
    content
)
content = re.sub(
    r'<div className="flex items-center justify-between px-5 py-4 border-b border-\[#F1F5F9\]">',
    r'<CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 py-4 px-5">',
    content
)
content = re.sub(
    r'<p className="text-\[14px\] font-semibold text-\[#0F172A\]">Upcoming</p>',
    r'<CardTitle className="text-sm">Upcoming</CardTitle>',
    content
)
content = re.sub(
    r'</Link>\n            </div>',
    r'</Link>\n            </CardHeader>',
    content
)
content = re.sub(
    r'</CardHeader>\n\n            \{upcoming.length === 0',
    r'</CardHeader>\n\n            <CardContent className="p-0">\n            {upcoming.length === 0',
    content
)
content = re.sub(
    r'</div>\n                  \);\n                \}\)\}\n              </div>\n            \)\}',
    r'</div>\n                  );\n                })}\n              </div>\n            )}',
    content
)
content = re.sub(
    r'</div>\n            \)\}\n          </div>',
    r'</div>\n            )}\n            </CardContent>\n          </Card>',
    content
)

# Close DashboardGrid Row 4
content = re.sub(
    r'</Card>\n        </div>\n      </div>\n\n    </PageContainer>',
    r'</Card>\n        </div>\n      </DashboardGrid>\n\n    </PageContainer>',
    content
)


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Done")
