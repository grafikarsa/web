'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, UserPlus, Heart, CheckCircle, XCircle } from 'lucide-react';
import { notificationsApi } from '@/lib/api';
import { Notification, NotificationType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from '@/lib/utils/format';

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  new_follower: <UserPlus className="h-4 w-4 text-blue-500" />,
  portfolio_liked: <Heart className="h-4 w-4 text-red-500" />,
  portfolio_approved: <CheckCircle className="h-4 w-4 text-green-500" />,
  portfolio_rejected: <XCircle className="h-4 w-4 text-amber-500" />,
};

function getNotificationLink(notification: Notification | null | undefined): string | null {
  if (!notification) return null;
  const data = notification.data as Record<string, string> | undefined | null;
  if (!data) return null;

  switch (notification.type) {
    case 'new_follower':
      return data.follower_username ? `/${data.follower_username}` : null;
    case 'portfolio_liked':
    case 'portfolio_approved':
    case 'portfolio_rejected':
      return data.portfolio_slug ? `/me/portfolios` : null;
    default:
      return null;
  }
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: countData } = useQuery({
    queryKey: ['notifications', 'count'],
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications', 'preview'],
    queryFn: () => notificationsApi.getNotifications({ limit: 5 }),
    enabled: open,
  });

  const markAsReadMutation = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = countData?.data?.unread_count ?? 0;
  const notifications = (notificationsData?.data ?? []).filter(
    (n): n is Notification => n != null
  );

  const handleNotificationClick = (notification: Notification) => {
    if (notification && !notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifikasi</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              <Check className="mr-1 h-3 w-3" />
              Tandai semua dibaca
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Tidak ada notifikasi
          </div>
        ) : (
          <>
            {notifications.map((notification) => {
              const link = getNotificationLink(notification);
              const content = (
                <div className="flex gap-3">
                  <div className="mt-0.5">{notificationIcons[notification.type]}</div>
                  <div className="flex-1 space-y-1">
                    <p className={cn('text-sm', !notification.is_read && 'font-medium')}>
                      {notification.message || notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(notification.created_at)}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="mt-2 h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </div>
              );

              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn('cursor-pointer p-3', !notification.is_read && 'bg-muted/50')}
                  onClick={() => handleNotificationClick(notification)}
                  asChild={!!link}
                >
                  {link ? <Link href={link}>{content}</Link> : content}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer justify-center">
              <Link href="/notifications" className="text-sm text-primary">
                Lihat semua notifikasi
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
