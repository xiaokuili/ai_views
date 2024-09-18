import React from "react";

interface SplitLayoutProps {
  configPanel: React.ReactNode;
  previewPanel: React.ReactNode;
}

export function SplitLayout({ configPanel, previewPanel }: SplitLayoutProps) {
  return (
    <div className='flex h-screen overflow-hidden'>
      <div className='w-1/2 border-r flex flex-col'>
        <h2 className='text-xl font-bold p-4 border-b'>报告配置</h2>
        <div className='flex-1 overflow-y-auto p-4'>{configPanel}</div>
      </div>
      <div className='w-1/2 flex flex-col'>
        <h2 className='text-xl font-bold p-4 border-b'>预览</h2>
        <div className='flex-1 overflow-y-auto p-4'>{previewPanel}</div>
      </div>
    </div>
  );
}
