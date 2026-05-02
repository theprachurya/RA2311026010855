import AppShell from '../../components/AppShell';
import NotificationsView from '../../components/NotificationsView';

export default function NotificationsPage() {
  return (
    <AppShell>
      <NotificationsView mode="all" />
    </AppShell>
  );
}
