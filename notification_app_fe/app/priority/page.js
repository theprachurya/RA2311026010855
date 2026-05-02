import AppShell from '../../components/AppShell';
import NotificationsView from '../../components/NotificationsView';

export default function PriorityPage() {
  return (
    <AppShell>
      <NotificationsView mode="priority" />
    </AppShell>
  );
}
