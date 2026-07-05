import { useCallback, useEffect, useState } from 'react';
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
import { Plus, Edit, Trash2, User, ExternalLink, ChevronUp, ChevronDown } from 'lucide-react';
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
  whatsapp_phone: string | null;
  is_active: boolean;
  serves_women: boolean;
  serves_men: boolean;
}

interface Service {
  id: string;
  name: string;
  category: string | null;
  duration_minutes: number;
  price: number;
}

interface StylistServiceLink {
  service_id: string;
  sort_order: number | null;
}

export default function Stylists() {
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStylist, setEditingStylist] = useState<Stylist | null>(null);
  const [hasWhatsAppPhoneColumn, setHasWhatsAppPhoneColumn] = useState(true);
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
    whatsapp_phone: '',
    is_active: true,
    serves_women: true,
    serves_men: true,
  });
  const { toast } = useToast();

  const isMissingWhatsAppPhoneColumn = (error: { code?: string; message?: string } | null) => (
    error?.code === '42703' || error?.message?.includes('whatsapp_phone')
  );

  const buildStylistPayload = () => {
    if (hasWhatsAppPhoneColumn) {
      return formData;
    }

    const { whatsapp_phone: _unused, ...payloadWithoutWhatsApp } = formData;
    return payloadWithoutWhatsApp;
  };

  const fetchStylists = useCallback(async () => {
    const baseQuery = supabase
      .from('stylists')
      .order('name');

    const { data, error } = await baseQuery
      .select('id, name, title, specialty, bio, image_url, instagram_url, whatsapp_phone, is_active, serves_women, serves_men');

    if (error && isMissingWhatsAppPhoneColumn(error)) {
      const fallbackResult = await baseQuery
        .select('id, name, title, specialty, bio, image_url, instagram_url, is_active, serves_women, serves_men');

      if (fallbackResult.error) {
        toast({
          title: 'Fehler',
          description: 'Stylisten konnten nicht geladen werden.',
          variant: 'destructive',
        });
      } else {
        setHasWhatsAppPhoneColumn(false);
        setStylists((fallbackResult.data || []).map((stylist) => ({ ...stylist, whatsapp_phone: null })));
        toast({
          title: 'Hinweis',
          description: 'Die Spalte whatsapp_phone fehlt noch in der Datenbank. Die Seite läuft vorübergehend ohne WhatsApp-Feld.',
        });
      }

      setIsLoading(false);
      return;
    }

    if (error) {
      toast({
        title: 'Fehler',
        description: 'Stylisten konnten nicht geladen werden.',
        variant: 'destructive',
      });
    } else {
      setHasWhatsAppPhoneColumn(true);
      setStylists(data || []);
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchStylists();
  }, [fetchStylists]);

  const openAssignServices = async (stylist: Stylist) => {
    setAssignStylist(stylist);
    // Load all services
    const { data: services } = await supabase
      .from('services')
      .select('id, name, category, duration_minutes, price')
      .order('category');
    const servicesList = (services || []) as Service[];
    setAllServices(servicesList);
    // Load current mappings
    const { data: links } = await supabase
      .from('stylist_services')
      .select('service_id, sort_order')
      .eq('stylist_id', stylist.id);

    const ordered = (((links || []) as unknown) as StylistServiceLink[])
      .slice()
      .sort((a, b) => {
        const ao = a.sort_order ?? Number.POSITIVE_INFINITY;
        const bo = b.sort_order ?? Number.POSITIVE_INFINITY;
        if (ao !== bo) return ao - bo;
        const an = servicesList.find(s => s.id === a.service_id)?.name ?? '';
        const bn = servicesList.find(s => s.id === b.service_id)?.name ?? '';
        return an.localeCompare(bn, 'de');
      });

    setSelectedServiceIds(ordered.map(l => l.service_id));
    setServicesDialogOpen(true);
  };

  const toggleService = (serviceId: string, checked: boolean) => {
    setSelectedServiceIds(prev => {
      if (checked) return prev.includes(serviceId) ? prev : [...prev, serviceId];
      return prev.filter(id => id !== serviceId);
    });
  };

  const moveSelectedService = (serviceId: string, direction: 'up' | 'down') => {
    setSelectedServiceIds(prev => {
      const index = prev.indexOf(serviceId);
      if (index === -1) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = prev.slice();
      const tmp = next[targetIndex];
      next[targetIndex] = next[index];
      next[index] = tmp;
      return next;
    });
  };

  const saveAssignedServices = async () => {
    if (!assignStylist) return;
    // Current links
    const { data: existing, error: existingError } = await supabase
      .from('stylist_services')
      .select('service_id')
      .eq('stylist_id', assignStylist.id);

    if (existingError) {
      toast({
        title: 'Fehler',
        description: 'Bestehende Service-Zuweisungen konnten nicht geladen werden.',
        variant: 'destructive',
      });
      return;
    }

    const existingIds = new Set(((existing || []) as Array<{ service_id: string }>).map(e => e.service_id));
    const desiredIds = selectedServiceIds;

    // Deletes
    const toDelete = [...existingIds].filter(id => !desiredIds.includes(id));
    if (toDelete.length) {
      const { error: deleteError } = await supabase
        .from('stylist_services')
        .delete()
        .eq('stylist_id', assignStylist.id)
        .in('service_id', toDelete);

      if (deleteError) {
        toast({
          title: 'Fehler',
          description: 'Entfernen von Services ist fehlgeschlagen.',
          variant: 'destructive',
        });
        return;
      }
    }

    // Upsert (also updates sort_order)
    if (desiredIds.length) {
      const rows = desiredIds.map((service_id, index) => ({
        stylist_id: assignStylist.id,
        service_id,
        sort_order: index,
      }));

      const { error: upsertError } = await supabase
        .from('stylist_services')
        .upsert(rows, { onConflict: 'stylist_id,service_id' });

      if (upsertError) {
        toast({
          title: 'Fehler',
          description: 'Speichern der Reihenfolge ist fehlgeschlagen.',
          variant: 'destructive',
        });
        return;
      }
    }

    toast({
      title: 'Erfolg',
      description: 'Services und Reihenfolge wurden gespeichert.',
    });

    setServicesDialogOpen(false);
    setAssignStylist(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = buildStylistPayload();
    
    if (editingStylist) {
      const { error } = await supabase
        .from('stylists')
        .update(payload)
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
        .insert(payload);

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
      whatsapp_phone: stylist.whatsapp_phone || '',
      is_active: stylist.is_active,
      serves_women: stylist.serves_women,
      serves_men: stylist.serves_men,
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

  const toggleAudience = async (id: string, patch: Partial<Pick<Stylist, 'serves_women' | 'serves_men'>>) => {
    const { error } = await supabase
      .from('stylists')
      .update(patch)
      .eq('id', id);

    if (error) {
      toast({
        title: 'Fehler',
        description: 'Zielgruppe konnte nicht geändert werden.',
        variant: 'destructive',
      });
      return;
    }
    fetchStylists();
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
      whatsapp_phone: '',
      is_active: true,
      serves_women: true,
      serves_men: true,
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
              {hasWhatsAppPhoneColumn && (
                <div className="space-y-2">
                  <Label htmlFor="whatsapp_phone">WhatsApp-Nummer (optional)</Label>
                  <Input
                    id="whatsapp_phone"
                    value={formData.whatsapp_phone}
                    onChange={(e) => setFormData({ ...formData, whatsapp_phone: e.target.value })}
                    placeholder="+4915212345678"
                  />
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Aktiv</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="serves_women"
                    checked={formData.serves_women}
                    onCheckedChange={(checked) => setFormData({ ...formData, serves_women: checked })}
                  />
                  <Label htmlFor="serves_women">Damen</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="serves_men"
                    checked={formData.serves_men}
                    onCheckedChange={(checked) => setFormData({ ...formData, serves_men: checked })}
                  />
                  <Label htmlFor="serves_men">Herren</Label>
                </div>
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
                  <TableHead>Zielgruppe</TableHead>
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
                          {hasWhatsAppPhoneColumn && stylist.whatsapp_phone && (
                            <p className="text-xs text-muted-foreground">WhatsApp: {stylist.whatsapp_phone}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{stylist.title || '-'}</TableCell>
                    <TableCell>{stylist.specialty || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={stylist.serves_women}
                            onCheckedChange={(checked) => toggleAudience(stylist.id, { serves_women: checked })}
                          />
                          <span className="text-sm text-muted-foreground">Damen</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={stylist.serves_men}
                            onCheckedChange={(checked) => toggleAudience(stylist.id, { serves_men: checked })}
                          />
                          <span className="text-sm text-muted-foreground">Herren</span>
                        </div>
                      </div>
                    </TableCell>
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
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Reihenfolge in Booking</h4>
              {selectedServiceIds.length === 0 ? (
                <p className="text-sm text-muted-foreground">Noch keine Services ausgewählt.</p>
              ) : (
                <div className="space-y-2">
                  {selectedServiceIds.map((serviceId, index) => {
                    const service = allServices.find(s => s.id === serviceId);
                    if (!service) return null;
                    return (
                      <div key={serviceId} className="flex items-center gap-2 p-3 border rounded-md bg-card">
                        <div className="flex-1">
                          <div className="font-medium">{index + 1}. {service.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {(service.category || 'Ohne Kategorie')} · {service.duration_minutes} Min
                            {typeof service.price === 'number' ? ` · ${service.price.toFixed(2)}€` : ''}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            disabled={index === 0}
                            onClick={() => moveSelectedService(serviceId, 'up')}
                            aria-label="Nach oben"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            disabled={index === selectedServiceIds.length - 1}
                            onClick={() => moveSelectedService(serviceId, 'down')}
                            aria-label="Nach unten"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

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
                        <div className="text-xs text-muted-foreground">{service.duration_minutes} Min{typeof service.price === 'number' ? ` · ${service.price.toFixed(2)}€` : ''}</div>
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
