import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, User } from 'lucide-react';

interface Stylist {
  id: string;
  name: string;
  specialty: string | null;
  bio: string | null;
  image_url: string | null;
  is_active: boolean;
}

export default function Stylists() {
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStylist, setEditingStylist] = useState<Stylist | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    bio: '',
    image_url: '',
    is_active: true,
  });
  const { toast } = useToast();

  const fetchStylists = async () => {
    const { data, error } = await supabase
      .from('stylists')
      .select('*')
      .order('name');

    if (error) {
      toast({
        title: 'Fehler',
        description: 'Stylisten konnten nicht geladen werden.',
        variant: 'destructive',
      });
    } else {
      setStylists(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStylists();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingStylist) {
      const { error } = await supabase
        .from('stylists')
        .update(formData)
        .eq('id', editingStylist.id);

      if (error) {
        toast({
          title: 'Fehler',
          description: 'Stylist konnte nicht aktualisiert werden.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erfolg',
          description: 'Stylist wurde aktualisiert.',
        });
      }
    } else {
      const { error } = await supabase
        .from('stylists')
        .insert(formData);

      if (error) {
        toast({
          title: 'Fehler',
          description: 'Stylist konnte nicht erstellt werden.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erfolg',
          description: 'Stylist wurde erstellt.',
        });
      }
    }

    setIsDialogOpen(false);
    resetForm();
    fetchStylists();
  };

  const handleEdit = (stylist: Stylist) => {
    setEditingStylist(stylist);
    setFormData({
      name: stylist.name,
      specialty: stylist.specialty || '',
      bio: stylist.bio || '',
      image_url: stylist.image_url || '',
      is_active: stylist.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie diesen Stylisten wirklich löschen?')) return;

    const { error } = await supabase
      .from('stylists')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Fehler',
        description: 'Stylist konnte nicht gelöscht werden.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Erfolg',
        description: 'Stylist wurde gelöscht.',
      });
      fetchStylists();
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('stylists')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Fehler',
        description: 'Status konnte nicht geändert werden.',
        variant: 'destructive',
      });
    } else {
      fetchStylists();
    }
  };

  const resetForm = () => {
    setEditingStylist(null);
    setFormData({
      name: '',
      specialty: '',
      bio: '',
      image_url: '',
      is_active: true,
    });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-foreground">Stylisten</h1>
          <p className="text-muted-foreground">Verwalten Sie Ihr Team</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Neuer Stylist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingStylist ? 'Stylist bearbeiten' : 'Neuen Stylisten hinzufügen'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialty">Spezialgebiet</Label>
                <Input
                  id="specialty"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  placeholder="z.B. Damen-Styling, Färbetechnik"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Biografie</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Kurze Beschreibung des Stylisten"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">Bild-URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Aktiv</Label>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button type="submit">
                  {editingStylist ? 'Speichern' : 'Erstellen'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/50">
        <CardContent className="pt-6">
          {stylists.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Noch keine Stylisten vorhanden
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stylist</TableHead>
                  <TableHead>Spezialgebiet</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stylists.map((stylist) => (
                  <TableRow key={stylist.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                          {stylist.image_url ? (
                            <img src={stylist.image_url} alt={stylist.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{stylist.name}</p>
                          {stylist.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-1">{stylist.bio}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{stylist.specialty || '-'}</TableCell>
                    <TableCell>
                      <Switch
                        checked={stylist.is_active}
                        onCheckedChange={() => toggleActive(stylist.id, stylist.is_active)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleEdit(stylist)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(stylist.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
