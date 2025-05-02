'use client';

import { socket } from '@/lib/socket';
import { Toaster } from '@workspace/ui/components/sonner';
import { useEffect } from 'react';
import { toast } from 'sonner';
import type { APINotification } from '@workspace/types/api-types';
import { useNotificationToaster } from '@/hooks/use-notification-toaster';

export default function DashboardToaster() {
	useNotificationToaster();
	return <Toaster />;
}
