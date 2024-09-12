import React from "react";
import {Card, Skeleton} from "@nextui-org/react";

export const SkeletonComponent = () => {
  return (
    <Card className="w-[270px] space-y-6 p-4" radius="lg">
      <Skeleton className="rounded-lg">
        <div className="h-64 rounded-lg bg-default-300"></div>
      </Skeleton>
      <div className="space-y-3">
        <Skeleton className="w-3/5 rounded-lg">
          <div className="h-5 w-3/5 rounded-lg bg-default-200"></div>
        </Skeleton>
        <Skeleton className="w-4/5 rounded-lg">
          <div className="h-5 w-4/5 rounded-lg bg-default-200"></div>
        </Skeleton>
        <Skeleton className="w-2/5 rounded-lg">  
          <div className="h-5 w-2/5 rounded-lg bg-default-300"></div>
        </Skeleton>
      </div>
    </Card>
  );
}
