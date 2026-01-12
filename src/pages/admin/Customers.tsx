import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, User, Gift } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface Customer {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  loyalty_points: { points: number } | null;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchCustomers = async () => {
      const [profilesResult, loyaltyResult] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('loyalty_points').select('customer_id, points')
      ]);

      if (profilesResult.error) {
        toast({
          title: 'Fehler',
          description: 'Kunden konnten nicht geladen werden.',
          variant: 'destructive',
        });
      } else {
        const loyaltyMap = new Map(loyaltyResult.data?.map(l => [l.customer_id, l]) || []);
        const customersWithLoyalty = profilesResult.data?.map(p => ({
          ...p,
          loyalty_points: loyaltyMap.get(p.id) || null
        })) || [];
        setCustomers(customersWithLoyalty);
      }
      setIsLoading(false);
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      (customer.email?.toLowerCase().includes(searchLower)) ||
      (customer.phone?.includes(searchTerm))
    );
  });

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
        <h1 className="text-3xl font-serif text-foreground">Kunden</h1>
        <p className="text-muted-foreground">Übersicht aller registrierten Kunden</p>
      </div>

      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Suchen nach Name, E-Mail oder Telefon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredCustomers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Keine Kunden gefunden
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kunde</TableHead>
                  <TableHead>Kontakt</TableHead>
                  <TableHead>Treuepunkte</TableHead>
                  <TableHead>Registriert am</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {customer.first_name || customer.last_name 
                              ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
                              : 'Unbekannt'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{customer.email || '-'}</p>
                        {customer.phone && (
                          <p className="text-sm text-muted-foreground">{customer.phone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-primary" />
                        <span className="font-medium">
                          {customer.loyalty_points?.points || 0} Punkte
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(customer.created_at), 'dd.MM.yyyy', { locale: de })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
