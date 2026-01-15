import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User as UserIcon, Shield, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [points, setPoints] = useState<number>(0);
  const [changingPwd, setChangingPwd] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [threshold, setThreshold] = useState<number>(10);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: profile }, { data: lp } ] = await Promise.all([
        supabase.from('profiles').select('first_name, last_name, email').eq('id', user.id).single(),
        supabase.from('loyalty_points').select('points').eq('customer_id', user.id).single(),
      ]);
      const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim();
      setFullName(name || user.email || "");
      setEmail(profile?.email || user.email || "");
      setPoints(lp?.points || 0);
      try {
        type UnknownBuilder = { select: (q: string) => UnknownBuilder; eq: (c: string, v: unknown) => UnknownBuilder; maybeSingle: () => Promise<unknown> };
        const builder = (supabase as unknown as { from: (t: string) => UnknownBuilder }).from('app_settings');
        const res = await builder.select('value').eq('key','loyalty_threshold').maybeSingle() as { data?: { value?: string } };
        const v = Number(res?.data?.value);
        setThreshold(Number.isFinite(v) && v > 0 ? v : 10);
      } catch {}
    })();
  }, [user]);

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast({ title: 'Aktuelles Passwort fehlt', description: 'Bitte aktuelles Passwort eingeben.', variant: 'destructive' });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast({ title: 'Passwort zu kurz', description: 'Mindestens 6 Zeichen.', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwörter stimmen nicht überein', description: 'Bitte neues Passwort bestätigen.', variant: 'destructive' });
      return;
    }
    setChangingPwd(true);
    // Re-authenticate with current password to verify identity
    const emailAddr = email || user?.email || "";
    const { error: reauthError } = await supabase.auth.signInWithPassword({ email: emailAddr, password: currentPassword });
    if (reauthError) {
      setChangingPwd(false);
      toast({ title: 'Aktuelles Passwort falsch', description: 'Bitte erneut versuchen.', variant: 'destructive' });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPwd(false);
    if (error) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Passwort geändert', description: 'Ihr Passwort wurde aktualisiert.' });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Bitte melden Sie sich an, um Ihr Profil zu sehen.</p>
        <div className="mt-4">
          <Button asChild variant="gold"><a href="/auth">Anmelden</a></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <section className="py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial-gold opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection>
            <div className="flex items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h1 className="font-serif text-3xl font-bold text-foreground">Mein Profil</h1>
                  <p className="text-muted-foreground">{fullName}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={async () => { await signOut(); navigate('/'); }}
              >
                Abmelden
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1 border-border/50">
                <CardHeader>
                  <CardTitle>Treuepunkte</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-primary">{points}</div>
                  <p className="text-sm text-muted-foreground mt-2">Gesammelte Punkte</p>
                  {points >= threshold && (
                    <div className="mt-3 text-sm text-green-600 font-medium">Gratis-Schnitt verfügbar! ({threshold} Punkte)</div>
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-1 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Mail className="w-4 h-4" />E-Mail</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>E-Mail</Label>
                    <Input value={email} readOnly disabled className="bg-muted cursor-not-allowed" />
                    <p className="text-xs text-muted-foreground">Die E-Mail-Adresse kann nicht geändert werden.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-1 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Shield className="w-4 h-4" />Passwort ändern</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={changePassword} className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="pwd_current">Aktuelles Passwort</Label>
                      <Input id="pwd_current" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Aktuelles Passwort" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pwd_new">Neues Passwort</Label>
                      <Input id="pwd_new" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mind. 6 Zeichen" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pwd_confirm">Neues Passwort bestätigen</Label>
                      <Input id="pwd_confirm" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Bestätigen" required />
                    </div>
                    <Button type="submit" disabled={changingPwd}>
                      {changingPwd ? 'Ändere…' : 'Passwort ändern'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
