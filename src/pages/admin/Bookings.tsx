import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Search, Check, X, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  feedback_token?: string | null;
  stylist_id?: string | null;
  service_id?: string | null;
  stylist: { name: string } | null;
  service: { name: string; price: number } | null;
}

type AppSettingsClient = {
  from: (table: 'app_settings') => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => Promise<{
          data: { value: string } | null;
          error: { message?: string } | null;
        }>;
      };
    };
    upsert: (
      values: { key: string; value: string },
      options: { onConflict: string }
    ) => Promise<{ error: { message?: string } | null }>;
  };
};

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<Date | undefined>();
  const [whatsAppRecipients, setWhatsAppRecipients] = useState('');
  const [isSavingWhatsAppRecipients, setIsSavingWhatsAppRecipients] = useState(false);
  const { toast } = useToast();
  const appSettingsClient = supabase as unknown as AppSettingsClient;

  const fetchWhatsAppRecipients = useCallback(async () => {
    const { data, error } = await appSettingsClient
      .from('app_settings')
      .select('value')
      .eq('key', 'booking_whatsapp_recipients')
      .maybeSingle();

    if (!error) {
      setWhatsAppRecipients(data?.value || '');
    }
  }, [appSettingsClient]);

  const fetchBookings = useCallback(async () => {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        stylist:stylists(name),
        service:services(name, price)
      `)
      .order('booking_date', { ascending: false })
      .order('start_time', { ascending: true });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    if (dateFilter) {
      query = query.eq('booking_date', format(dateFilter, 'yyyy-MM-dd'));
    }

    const { data, error } = await query;

    if (error) {
      toast({
        title: 'Fehler',
        description: 'Buchungen konnten nicht geladen werden.',
        variant: 'destructive',
      });
    } else {
      setBookings(data || []);
    }
    setIsLoading(false);
  }, [dateFilter, statusFilter, toast]);

  useEffect(() => {
    void fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    void fetchWhatsAppRecipients();
  }, [fetchWhatsAppRecipients]);

  const saveWhatsAppRecipients = async () => {
    setIsSavingWhatsAppRecipients(true);

    const { error } = await appSettingsClient.from('app_settings').upsert(
      {
        key: 'booking_whatsapp_recipients',
        value: whatsAppRecipients.trim(),
      },
      { onConflict: 'key' }
    );

    setIsSavingWhatsAppRecipients(false);

    if (error) {
      toast({
        title: 'Fehler',
        description: 'WhatsApp-Verteiler konnte nicht gespeichert werden.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Erfolg',
      description: 'WhatsApp-Verteiler wurde gespeichert.',
    });
  };

  const updateBookingStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Fehler',
        description: 'Status konnte nicht aktualisiert werden.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Erfolg',
        description: 'Buchungsstatus wurde aktualisiert.',
      });
      try {
        if (status === 'completed') {
          // Send feedback request email
          const booking = bookings.find(b => b.id === id);
          if (booking) {
            const feedbackToken = booking.feedback_token;
            const reviewLink = feedbackToken
              ? `${window.location.origin}/review?token=${feedbackToken}`
              : `${window.location.origin}/review?bookingId=${id}&stylistId=${booking.stylist_id ?? ''}&serviceId=${booking.service_id ?? ''}`;
            await supabase.functions.invoke('send-feedback', {
              body: {
                to: booking.customer_email,
                name: booking.customer_name,
                bookingId: id,
                reviewLink,
              },
            });
          }
        }
      } catch (error) {
        console.error('send-feedback failed', error);
      }
      fetchBookings();
    }
  };

  const filteredBookings = bookings.filter(booking =>
    booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-foreground">Buchungen</h1>
        <p className="text-muted-foreground">Verwalten Sie alle Terminbuchungen</p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>WhatsApp-Verteiler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              value={whatsAppRecipients}
              onChange={(e) => setWhatsAppRecipients(e.target.value)}
              placeholder="+4915212345678, +491701234567"
            />
            <p className="text-sm text-muted-foreground">
              Kommagetrennte WhatsApp-Nummern im internationalen Format. Bei jeder neuen Buchung wird zusätzlich die beim Stylisten hinterlegte WhatsApp-Nummer benachrichtigt.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={saveWhatsAppRecipients} disabled={isSavingWhatsAppRecipients}>
              {isSavingWhatsAppRecipients ? 'Speichert...' : 'Verteiler speichern'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Suchen nach Name oder E-Mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="pending">Ausstehend</SelectItem>
                <SelectItem value="confirmed">Bestätigt</SelectItem>
                <SelectItem value="completed">Abgeschlossen</SelectItem>
                <SelectItem value="cancelled">Storniert</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn(!dateFilter && 'text-muted-foreground')}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter ? format(dateFilter, 'dd.MM.yyyy', { locale: de }) : 'Datum wählen'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={dateFilter}
                  onSelect={setDateFilter}
                  locale={de}
                />
                {dateFilter && (
                  <div className="p-2 border-t">
                    <Button variant="ghost" size="sm" className="w-full" onClick={() => setDateFilter(undefined)}>
                      Filter zurücksetzen
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          {filteredBookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Keine Buchungen gefunden
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kunde</TableHead>
                    <TableHead>Dienstleistung</TableHead>
                    <TableHead>Stylist</TableHead>
                    <TableHead>Datum & Zeit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Preis</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.customer_name}</p>
                          <p className="text-sm text-muted-foreground">{booking.customer_email}</p>
                          {booking.customer_phone && (
                            <p className="text-sm text-muted-foreground">{booking.customer_phone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{booking.service?.name || '-'}</TableCell>
                      <TableCell>{booking.stylist?.name || '-'}</TableCell>
                      <TableCell>
                        <div>
                          <p>{format(new Date(booking.booking_date), 'dd.MM.yyyy', { locale: de })}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.start_time?.slice(0, 5)} - {booking.end_time?.slice(0, 5)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        {booking.service?.price ? `€${Number(booking.service.price).toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {booking.status === 'pending' && (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-green-500 hover:text-green-600"
                                onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                title="Bestätigen"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                title="Stornieren"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-blue-500 hover:text-blue-600"
                              onClick={() => updateBookingStatus(booking.id, 'completed')}
                              title="Abschließen"
                            >
                              <Clock className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
