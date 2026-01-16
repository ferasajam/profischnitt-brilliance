import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  CalendarIcon,
  Search,
  Check,
  X,
  Clock,
} from 'lucide-react';
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
  stylist: { name: string } | null;
  service: { name: string; price: number } | null;
}

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<Date | undefined>();
  const { toast } = useToast();

  const fetchBookings = async () => {
    let query = supabase
      .from('bookings')
      .select(`*, stylist:stylists(name), service:services(name, price)`)
      .order('booking_date', { ascending: false })
      .order('start_time', { ascending: true });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    if (dateFilter) {
      query = query.eq(
        'booking_date',
        format(dateFilter, 'yyyy-MM-dd')
      );
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
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, dateFilter]);

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
        description: 'Status aktualisiert',
      });
      fetchBookings();
    }
  };

  const filteredBookings = bookings.filter(
    (b) =>
      b.customer_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      b.customer_email
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Suchen nach Name oder E-Mail"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="md:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="pending">Ausstehend</SelectItem>
              <SelectItem value="confirmed">Bestätigt</SelectItem>
              <SelectItem value="completed">Abgeschlossen</SelectItem>
              <SelectItem value="cancelled">Storniert</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(!dateFilter && 'text-muted-foreground')}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFilter
                  ? format(dateFilter, 'dd.MM.yyyy', { locale: de })
                  : 'Datum'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Calendar
                mode="single"
                selected={dateFilter}
                onSelect={setDateFilter}
                locale={de}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kunde</TableHead>
                <TableHead>Dienstleistung</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredBookings.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <p className="font-medium">{b.customer_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {b.customer_email}
                    </p>
                  </TableCell>

                  <TableCell>{b.service?.name || '-'}</TableCell>

                  <TableCell>
                    {format(new Date(b.booking_date), 'dd.MM.yyyy')}
                    <br />
                    <span className="text-sm text-muted-foreground">
                      {b.start_time?.slice(0, 5)} – {b.end_time?.slice(0, 5)}
                    </span>
                  </TableCell>

                  <TableCell>{b.status}</TableCell>

                  <TableCell>
                    <div className="flex gap-2">
                      {b.status === 'pending' && (
                        <>
                          <Button
                            type="button"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() =>
                              updateBookingStatus(b.id, 'confirmed')
                            }
                            onTouchEnd={() =>
                              updateBookingStatus(b.id, 'confirmed')
                            }
                          >
                            <Check />
                          </Button>

                          <Button
                            type="button"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() =>
                              updateBookingStatus(b.id, 'cancelled')
                            }
                            onTouchEnd={() =>
                              updateBookingStatus(b.id, 'cancelled')
                            }
                          >
                            <X />
                          </Button>
                        </>
                      )}

                      {b.status === 'confirmed' && (
                        <Button
                          type="button"
                          size="icon"
                          className="h-10 w-10"
                          onClick={() =>
                            updateBookingStatus(b.id, 'completed')
                          }
                          onTouchEnd={() =>
                            updateBookingStatus(b.id, 'completed')
                          }
                        >
                          <Clock />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
