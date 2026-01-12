import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, User, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';

interface Stylist {
  id: string;
  name: string;
  title: string | null;
  specialty: string | null;
  bio: string | null;
  image_url: string | null;
  instagram_url: string | null;
  is_active: boolean;
}

interface Service {
  id: string;
  name: string;
  category: string | null;
  duration_minutes: number;
  price: number;
}

export default function Stylists() {
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStylist, setEditingStylist] = useState<Stylist | null>(null);
  const [servicesDialogOpen, setServicesDialogOpen] = useState(false);
  const [assignStylist, setAssignStylist] = useState<Stylist | null>(null);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    specialty: '',
    bio: '',
    image_url: '',
    instagram_url: '',
    is_active: true,
  });
  const { toast } = useToast();

  const fetchStylists = async () => {
    const { data, error } = await supabase
      .from('stylists')
      .select('id, name, title, specialty, bio, image_url, instagram_url, is_active')
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

  const openAssignServices = async (stylist: Stylist) => {
    setAssignStylist(stylist);
    // Load all services
    const { data: services } = await supabase
      .from('services')
      .select('id, name, category, duration_minutes, price')
      .order('category');
    setAllServices(services || []);
    // Load current mappings
    const { data: links } = await supabase
      .from('stylist_services')
      .select('service_id')
      .eq('stylist_id', stylist.id);
    setSelectedServiceIds((links || []).map(l => l.service_id));
    setServicesDialogOpen(true);
  };

  const toggleService = (serviceId: string, checked: boolean) => {
    setSelectedServiceIds(prev => checked ? [...prev, serviceId] : prev.filter(id => id !== serviceId));
  };

  const saveAssignedServices = async () => {
    if (!assignStylist) return;
    // Current links
    const { data: existing } = await supabase
      .from('stylist_services')
      .select('service_id')
      .eq('stylist_id', assignStylist.id);
    const existingIds = new Set((existing || []).map(e => e.service_id));
    const desiredIds = new Set(selectedServiceIds);

    // Inserts
    const toInsert = [...desiredIds].filter(id => !existingIds.has(id)).map(id => ({ stylist_id: assignStylist.id, service_id: id }));
    if (toInsert.length) {
      await supabase.from('stylist_services').insert(toInsert);
    }
    // Deletes
    const toDelete = [...existingIds].filter(id => !desiredIds.has(id));
    if (toDelete.length) {
      await supabase.from('stylist_services').delete().in('service_id', toDelete).eq('stylist_id', assignStylist.id);
    }

    setServicesDialogOpen(false);
    setAssignStylist(null);
  };

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
      title: stylist.title || '',
      specialty: stylist.specialty || '',
      bio: stylist.bio || '',
      image_url: stylist.image_url || '',
      instagram_url: stylist.instagram_url || '',
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
      title: '',
      specialty: '',
      bio: '',
      image_url: '',
      instagram_url: '',
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
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link to="/team">
              <ExternalLink className="w-4 h-4 mr-2" />
              Team-Seite ansehen
            </Link>
          </Button>
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
                <Label htmlFor="title">Titel/Rolle</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="z.B. Meister-Stylist, Senior-Stylist"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialty">Spezialgebiet</Label>
                <Input
                  id="specialty"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  placeholder="Kommagetrennt: Herrenschnitte, Bartpflege, Klassische Styles"
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
              <div className="space-y-2">
                <Label htmlFor="instagram_url">Instagram (optional)</Label>
                <Input
                  id="instagram_url"
                  value={formData.instagram_url}
                  onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                  placeholder="https://instagram.com/username oder @username"
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
                  <TableHead>Titel</TableHead>
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
                    <TableCell>{stylist.title || '-'}</TableCell>
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
                          size="sm"
                          variant="secondary"
                          onClick={() => openAssignServices(stylist)}
                        >
                          Services zuweisen
                        </Button>
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

      {/* Assign Services Dialog */}
      <Dialog open={servicesDialogOpen} onOpenChange={setServicesDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Services zuweisen {assignStylist ? `– ${assignStylist.name}` : ''}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 max-h-[60vh] overflow-auto pr-1">
            {['Herren','Damen','Styling','Farbe','Pflege'].map(cat => (
              <div key={cat}>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">{cat}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {allServices.filter(s => (s.category || '') === cat).map(service => (
                    <label key={service.id} className="flex items-center gap-3 p-3 border rounded-md bg-card">
                      <Checkbox
                        checked={selectedServiceIds.includes(service.id)}
                        onCheckedChange={(checked) => toggleService(service.id, Boolean(checked))}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{service.name}</div>
                        <div className="text-xs text-muted-foreground">{service.duration_minutes} Min · {service.price.toFixed(2)}€</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setServicesDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={saveAssignedServices}>Speichern</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
