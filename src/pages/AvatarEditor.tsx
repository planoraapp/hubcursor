import React from 'react';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AvatarEditorOfficial from '@/components/tools/AvatarEditorOfficial';

const AvatarEditor = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CollapsibleAppSidebar />
        <SidebarInset className="flex-1">
          <main className="flex-1 p-8 bg-repeat min-h-screen" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
            <div className="max-w-7xl mx-auto">
              <AvatarEditorOfficial />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AvatarEditor;
