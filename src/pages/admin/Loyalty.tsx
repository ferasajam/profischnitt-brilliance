import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Gift, Plus, TrendingUp, TrendingDown, Star } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface LoyaltyData {
  id: string;
  points: number;
  total_earned: number;
  total_redeemed: number;
  customer_id: string;
  profile: { first_name: string | null; last_name: string | null; email: string | null } | null;
}

interface Transaction {
  id: string;
  points: number;
  transaction_type: string;
  description: string | null;
  created_at: string;
  customer_id: string;
  profile: { first_name: string | null; last_name: string | null } | null;
}

export default function Loyalty() {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [pointsAmount, setPointsAmount] = useState('');
  const [transactionType, setTransactionType] = useState<'bonus' | 'redeemed'>('bonus');
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  const fetchData = async () => {
    const [loyaltyResult, transactionsResult, profilesResult] = await Promise.all([
      supabase.from('loyalty_points').select('*').order('points', { ascending: false }),
      supabase.from('loyalty_transactions').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('profiles').select('id, first_name, last_name, email')
    ]);

    if (loyaltyResult.error || transactionsResult.error) {
      toast({
        title: 'Fehler',
        description: 'Daten konnten nicht geladen werden.',
        variant: 'destructive',
      });
    } else {
      const profileMap = new Map(profilesResult.data?.map(p => [p.id, p]) || []);
      
      const loyaltyWithProfiles = loyaltyResult.data?.map(l => ({
        ...l,
        profile: profileMap.get(l.customer_id) || null
      })) || [];
      
      const transactionsWithProfiles = transactionsResult.data?.map(t => ({
        ...t,
        profile: profileMap.get(t.customer_id) || null
      })) || [];
      
      setLoyaltyData(loyaltyWithProfiles);
      setTransactions(transactionsWithProfiles);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const points = parseInt(pointsAmount);
    if (!selectedCustomer || !points) return;

    // Add transaction
    const { error: transactionError } = await supabase
      .from('loyalty_transactions')
      .insert({
        customer_id: selectedCustomer,
        points: transactionType === 'bonus' ? points : -points,
        transaction_type: transactionType,
        description: description || (transactionType === 'bonus' ? 'Bonus-Punkte' : 'Punkte eingelöst'),
      });

    if (transactionError) {
      toast({
        title: 'Fehler',
        description: 'Transaktion konnte nicht erstellt werden.',
        variant: 'destructive',
      });
      return;
    }

    // Update loyalty points
    const currentData = loyaltyData.find(l => l.customer_id === selectedCustomer);
    if (currentData) {
      const newPoints = transactionType === 'bonus' 
        ? currentData.points + points 
        : Math.max(0, currentData.points - points);
      
      const { error: updateError } = await supabase
        .from('loyalty_points')
        .update({
          points: newPoints,
          total_earned: transactionType === 'bonus' 
            ? currentData.total_earned + points 
            : currentData.total_earned,
          total_redeemed: transactionType === 'redeemed' 
            ? currentData.total_redeemed + points 
            : currentData.total_redeemed,
        })
        .eq('customer_id', selectedCustomer);

      if (updateError) {
        toast({
          title: 'Fehler',
          description: 'Punkte konnten nicht aktualisiert werden.',
          variant: 'destructive',
        });
        return;
      }
    }

    toast({
      title: 'Erfolg',
      description: transactionType === 'bonus' 
        ? `${points} Punkte wurden hinzugefügt.`
        : `${points} Punkte wurden eingelöst.`,
    });

    setIsDialogOpen(false);
    setSelectedCustomer('');
    setPointsAmount('');
    setDescription('');
    fetchData();
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned':
      case 'bonus':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'redeemed':
      case 'expired':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Gift className="w-4 h-4" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    const labels: Record<string, string> = {
      earned: 'Verdient',
      redeemed: 'Eingelöst',
      bonus: 'Bonus',
      expired: 'Abgelaufen',
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const totalPoints = loyaltyData.reduce((sum, l) => sum + l.points, 0);
  const topCustomers = loyaltyData.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-foreground">Treueprogramm</h1>
          <p className="text-muted-foreground">Verwalten Sie Kundenpunkte und Belohnungen</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Punkte hinzufügen/einlösen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Punkte verwalten</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddPoints} className="space-y-4">
              <div className="space-y-2">
                <Label>Kunde</Label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kunde auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {loyaltyData.map((l) => (
                      <SelectItem key={l.customer_id} value={l.customer_id}>
                        {l.profile?.first_name || l.profile?.last_name 
                          ? `${l.profile.first_name || ''} ${l.profile.last_name || ''}`.trim()
                          : l.profile?.email || 'Unbekannt'} ({l.points} Punkte)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Aktion</Label>
                <Select value={transactionType} onValueChange={(v) => setTransactionType(v as 'bonus' | 'redeemed')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bonus">Bonus-Punkte hinzufügen</SelectItem>
                    <SelectItem value="redeemed">Punkte einlösen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="points">Anzahl Punkte</Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  value={pointsAmount}
                  onChange={(e) => setPointsAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung (optional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="z.B. Geburtstagsbonus"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button type="submit">
                  {transactionType === 'bonus' ? 'Hinzufügen' : 'Einlösen'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gesamte Punkte
            </CardTitle>
            <Gift className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPoints.toLocaleString('de-DE')}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Teilnehmer
            </CardTitle>
            <Star className="w-5 h-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loyaltyData.length}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Durchschnitt
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loyaltyData.length > 0 
                ? Math.round(totalPoints / loyaltyData.length).toLocaleString('de-DE')
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Top Kunden</CardTitle>
          </CardHeader>
          <CardContent>
            {topCustomers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Noch keine Daten vorhanden
              </p>
            ) : (
              <div className="space-y-4">
                {topCustomers.map((customer, index) => (
                  <div 
                    key={customer.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                        index === 1 ? 'bg-gray-400/20 text-gray-400' :
                        index === 2 ? 'bg-amber-600/20 text-amber-600' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">
                          {customer.profile?.first_name || customer.profile?.last_name 
                            ? `${customer.profile.first_name || ''} ${customer.profile.last_name || ''}`.trim()
                            : customer.profile?.email || 'Unbekannt'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {customer.total_earned} verdient • {customer.total_redeemed} eingelöst
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{customer.points}</p>
                      <p className="text-xs text-muted-foreground">Punkte</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Letzte Transaktionen</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Noch keine Transaktionen vorhanden
              </p>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.transaction_type)}
                      <div>
                        <p className="font-medium text-sm">
                          {transaction.profile?.first_name || transaction.profile?.last_name 
                            ? `${transaction.profile.first_name || ''} ${transaction.profile.last_name || ''}`.trim()
                            : 'Unbekannt'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.description || getTransactionLabel(transaction.transaction_type)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${transaction.points > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {transaction.points > 0 ? '+' : ''}{transaction.points}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(transaction.created_at), 'dd.MM.yy', { locale: de })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
