import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Scissors, Euro, TrendingUp, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  todayBookings: number;
  weekBookings: number;
  totalCustomers: number;
  activeStylists: number;
  pendingBookings: number;
  completedToday: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todayBookings: 0,
    weekBookings: 0,
    totalCustomers: 0,
    activeStylists: 0,
    pendingBookings: 0,
    completedToday: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [
        { count: todayCount },
        { count: weekCount },
        { count: customerCount },
        { count: stylistCount },
        { count: pendingCount },
        { count: completedCount },
        { data: bookings }
      ] = await Promise.all([
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('booking_date', today),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).gte('booking_date', weekAgo),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('stylists').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('booking_date', today).eq('status', 'completed'),
        supabase.from('bookings')
          .select(`
            *,
            stylist:stylists(name),
            service:services(name, price)
          `)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      setStats({
        todayBookings: todayCount || 0,
        weekBookings: weekCount || 0,
        totalCustomers: customerCount || 0,
        activeStylists: stylistCount || 0,
        pendingBookings: pendingCount || 0,
        completedToday: completedCount || 0,
      });
      setRecentBookings(bookings || []);
      setIsLoading(false);
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Termine Heute', value: stats.todayBookings, icon: Calendar, color: 'text-primary' },
    { title: 'Termine diese Woche', value: stats.weekBookings, icon: TrendingUp, color: 'text-green-500' },
    { title: 'Ausstehende Buchungen', value: stats.pendingBookings, icon: Clock, color: 'text-yellow-500' },
    { title: 'Aktive Stylisten', value: stats.activeStylists, icon: Scissors, color: 'text-blue-500' },
    { title: 'Registrierte Kunden', value: stats.totalCustomers, icon: Users, color: 'text-purple-500' },
    { title: 'Abgeschlossen Heute', value: stats.completedToday, icon: Euro, color: 'text-emerald-500' },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-500',
      confirmed: 'bg-blue-500/20 text-blue-500',
      completed: 'bg-green-500/20 text-green-500',
      cancelled: 'bg-red-500/20 text-red-500',
    };
    const labels = {
      pending: 'Ausstehend',
      confirmed: 'Bestätigt',
      completed: 'Abgeschlossen',
      cancelled: 'Storniert',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Übersicht über Ihren Salon</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Neueste Buchungen</CardTitle>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Noch keine Buchungen vorhanden
            </p>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div 
                  key={booking.id} 
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
                >
                  <div>
                    <p className="font-medium">{booking.customer_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.service?.name} • {booking.stylist?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.booking_date).toLocaleDateString('de-DE')} um {booking.start_time?.slice(0, 5)}
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(booking.status)}
                    <p className="text-sm font-medium mt-1">
                      {booking.service?.price ? `€${Number(booking.service.price).toFixed(2)}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
