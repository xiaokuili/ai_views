import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useTestReportContext } from "@/context/ReportContext";
interface CardFootProps {
  onTest: (title: string) => void;
  onSubmit: (title: string) => void;
  onDelete: () => void; // 新增删除操作的回调函数
}

export function CardFoot({ onTest }: CardFootProps) {
  const [testTitle, setTestTitle] = useState("");
  const { setTestReportState } = useTestReportContext();

  return (
    <CardFooter className='flex flex-col space-y-4 mt-6 w-full'>
      <div className='flex w-full items-center space-x-2'>
        <Input
          placeholder='待测试标题'
          value={testTitle}
          onChange={(e) => setTestTitle(e.target.value)}
        />
        <Button
          variant='outline'
          onClick={() => {
            onTest();
            setTestReportState({ testTitle: testTitle });
          }}
        >
          测试
        </Button>
      </div>
    </CardFooter>
  );
}

interface CardLayoutProps {
  header: ReactNode;
  content: ReactNode;
  onTest: (title: string) => void;
  defaultIsExpanded: boolean;
}

export function CardLayout({
  header,
  content,
  onTest,
  defaultIsExpanded = true,
}: CardLayoutProps) {
  const [isExpanded, setIsExpanded] = useState(defaultIsExpanded);

  return (
    <Card className='w-full '>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <div className='flex items-center space-x-2'>{header}</div>
        <div className='flex items-center space-x-2'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size='icon'
                  variant='outline'
                  className='h-8 w-8'
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? (
                    <ChevronUp className='h-4 w-4' />
                  ) : (
                    <ChevronDown className='h-4 w-4' />
                  )}
                  <span className='sr-only'>
                    {isExpanded ? "Collapse" : "Expand"}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isExpanded ? "Collapse" : "Expand"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      {isExpanded && (
        <>
          <Separator />
          <CardContent className='pt-6'>{content}</CardContent>
          <Separator />
          <CardFoot onTest={onTest} />
        </>
      )}
    </Card>
  );
}
