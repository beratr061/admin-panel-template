"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target: string;
  timestamp: Date;
}

export interface ActivityFeedProps {
  items: ActivityItem[];
  maxItems?: number;
  title?: string;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ActivityFeed({
  items,
  maxItems = 10,
  title = "Recent Activity",
  className,
}: ActivityFeedProps) {
  const displayItems = items.slice(0, maxItems);

  return (
    <Card className={cn(className)} data-testid="activity-feed">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[350px] px-6">
          <div className="space-y-4 pb-4">
            {displayItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activity
              </p>
            ) : (
              displayItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3"
                  data-testid="activity-item"
                >
                  <Avatar className="h-8 w-8">
                    {item.user.avatar && (
                      <AvatarImage src={item.user.avatar} alt={item.user.name} />
                    )}
                    <AvatarFallback className="text-xs">
                      {getInitials(item.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">{item.user.name}</span>{" "}
                      <span className="text-muted-foreground">{item.action}</span>{" "}
                      <span className="font-medium">{item.target}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.timestamp), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
