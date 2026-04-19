import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useParams } from "react-router-dom";
import { CalendarDays, MapPin, Video, Globe, Loader2, CheckCircle2, Zap, Upload, X } from "lucide-react";
import { useEventBySlug, Event } from "@/hooks/useEvents";
import { useFormFields } from "@/hooks/useFormFields";
import { useCreateRegistration } from "@/hooks/useRegistrations";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Tables } from "@/integrations/supabase/types";

type FormField = Tables<"form_fields">;

// ─── Helper: format event date/time with timezone ───
function formatEventDateTime(event: Event) {
  const tz = event.timezone || "America/New_York";
  const parts: string[] = [];

  if (event.event_date) {
    const start = new Date(event.event_date);
    const dateStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: tz });
    const timeStr = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: tz });

    let line = `${dateStr} · ${timeStr}`;

    if (event.event_end_date) {
      const end = new Date(event.event_end_date);
      const endDateStr = end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: tz });
      const endTimeStr = end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: tz });

      if (endDateStr === dateStr) {
        line += ` – ${endTimeStr}`;
      } else {
        line += ` – ${endDateStr} · ${endTimeStr}`;
      }
    }

    // Timezone abbreviation
    const tzAbbr = start.toLocaleTimeString("en-US", { timeZone: tz, timeZoneName: "short" }).split(" ").pop() || tz;
    line += ` ${tzAbbr}`;

    parts.push(line);
  }

  return parts.join("");
}

// ─── Extracted stable components ───

const SuccessCard = ({ brandColor, eventName }: { brandColor: string; eventName: string }) => (
  <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg mx-auto">
    <Card className="border-border shadow-2xl">
      <CardContent className="p-8 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: brandColor }} />
        </motion.div>
        <h2 className="text-2xl font-display font-bold mb-2">You're Registered!</h2>
        <p className="text-muted-foreground">Thank you for registering for <strong>{eventName}</strong>. You'll receive a confirmation email shortly.</p>
      </CardContent>
    </Card>
  </motion.div>
);

const EventInfo = ({ event, className = "" }: { event: Event; className?: string }) => {
  const [expanded, setExpanded] = useState(false);
  const locationIcon = event.location_type === "physical" ? <MapPin className="w-4 h-4" /> : event.location_type === "hybrid" ? <Globe className="w-4 h-4" /> : <Video className="w-4 h-4" />;
  const locationLabel = event.location_type === "physical" ? "In-Person" : event.location_type === "hybrid" ? "Hybrid" : "Virtual";
  const dateTimeStr = formatEventDateTime(event);

  // Truncate to first 2 sentences
  const description = event.description || "";
  const sentences = description.match(/[^.!?]*[.!?]+/g) || [description];
  const isTruncatable = sentences.length > 1;
  const truncated = isTruncatable ? sentences.slice(0, 1).join("").trim() + "…" : description;

  return (
    <div className={`pt-6 md:pt-0 ${className}`}>
      {dateTimeStr && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <CalendarDays className="w-4 h-4 shrink-0" />
          {dateTimeStr}
        </div>
      )}
      <h1 className="text-2xl sm:text-4xl md:text-7xl font-display font-bold">{event.name}</h1>
      {description && (
        <div className="mt-4 mb-4">
          <p className="text-muted-foreground text-sm leading-relaxed">
            {expanded || !isTruncatable ? description : truncated}
          </p>
          {isTruncatable && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="text-sm font-medium mt-1 hover:underline"
              style={{ color: "hsl(var(--primary))" }}
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      )}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {locationIcon} {locationLabel}
      </div>
    </div>
  );
};

const RegistrationForm = ({
  event,
  formFields,
  formData,
  onFieldChange,
  consent,
  onConsentChange,
  paymentUrl,
  setPaymentUrl,
  onSubmit,
  isPending,
  brandColor,
  className = "",
}: {
  event: Event;
  formFields: FormField[] | undefined;
  formData: Record<string, string>;
  onFieldChange: (label: string, value: string) => void;
  consent: boolean;
  onConsentChange: (v: boolean) => void;
  paymentUrl: string | null;
  setPaymentUrl: (v: string | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  brandColor: string;
  className?: string;
}) => {
  const [uploading, setUploading] = useState(false);
  const isPaid = event.ticket_price && Number(event.ticket_price) > 0;
  const qrUrl = (event as any).logo_url;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `receipts/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("event-assets").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("event-assets").getPublicUrl(path);
      setPaymentUrl(data.publicUrl);
    } catch (err: any) {
      toast.error(err.message || "Failed to upload screenshot");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className={`space-y-4 ${className}`}>
      {formFields?.map((field) => (
        <div key={field.id} className="space-y-2">
          <Label>{field.label}{field.required && " *"}</Label>
          <Input
            type={field.field_type === "email" ? "email" : field.field_type === "tel" ? "tel" : "text"}
            placeholder={field.placeholder || field.label}
            required={field.required}
            value={formData[field.label] || ""}
            onChange={e => onFieldChange(field.label, e.target.value)}
          />
        </div>
      ))}

      {isPaid && qrUrl && (
        <div className="bg-muted/30 border border-border rounded-lg p-4 mt-4 space-y-4">
          <div>
            <h4 className="font-semibold text-sm">Payment Required</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Ticket Price: <span className="font-bold text-foreground">${event.ticket_price}</span></p>
          </div>
          
          <div className="flex justify-center bg-white p-2 rounded-lg border border-border w-40 mx-auto">
            <img src={qrUrl} alt="Payment QR Code" className="w-full h-full object-contain" />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-semibold block">Upload Payment Screenshot *</Label>
            {paymentUrl ? (
              <div className="relative inline-block w-full">
                <img src={paymentUrl} alt="Receipt" className="w-full h-32 rounded-lg border border-border object-cover" />
                <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => setPaymentUrl(null)}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-border bg-background cursor-pointer hover:bg-muted/50 transition-colors w-full">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Upload className="w-4 h-4 text-primary" />}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold">Upload Receipt</p>
                  <p className="text-[10px] text-muted-foreground">Required to complete registration</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
            )}
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 pt-2">
        <Checkbox id="gdpr" checked={consent} onCheckedChange={(c) => onConsentChange(!!c)} />
        <Label htmlFor="gdpr" className="text-xs text-muted-foreground leading-relaxed">
          I agree to receive communications about this event and consent to the processing of my data in accordance with the Privacy Policy.
        </Label>
      </div>
      <Button
        type="submit"
        className="w-full h-11 text-base border-0 text-white"
        style={{ background: `linear-gradient(135deg, ${brandColor}, ${brandColor}CC)` }}
        disabled={isPending || (!!isPaid && !!qrUrl && !paymentUrl)}
      >
        {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Registering…</> : "Register Now"}
      </Button>
    </form>
  );
};

const FlyerImage = ({ flyerUrl, eventName, className = "" }: { flyerUrl: string | null; eventName: string; className?: string }) => (
  flyerUrl ? (
    <div className={`flex items-start justify-center bg-muted ${className}`}>
      <img src={flyerUrl} alt={eventName} className="w-full h-full object-contain" />
    </div>
  ) : null
);

const PoweredBy = () => (
  <p className="text-center text-xs text-muted-foreground mt-6">
    Powered by <span className="font-semibold">eventspark</span>
  </p>
);

// ─── Main component ───

const Register = () => {
  const { slug } = useParams();
  const { data: event, isLoading: eventLoading } = useEventBySlug(slug);
  const { data: formFields, isLoading: fieldsLoading } = useFormFields(event?.id);
  const { user } = useAuth();
  const createReg = useCreateRegistration();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const handleFieldChange = useCallback((label: string, value: string) => {
    setFormData(prev => ({ ...prev, [label]: value }));
  }, []);

  if (eventLoading || fieldsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-display font-bold mb-2">Event Not Found</h1>
            <p className="text-muted-foreground">This event may have ended or the link is invalid.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      toast.error("Please accept the privacy policy to register.");
      return;
    }
    const missing = formFields?.filter(f => f.required && !formData[f.label]?.trim());
    if (missing && missing.length > 0) {
      toast.error(`Please fill in: ${missing.map(f => f.label).join(", ")}`);
      return;
    }
    try {
      // Ensure data is never an empty object ({}) to satisfy database constraints
      const submissionData = Object.keys(formData).length === 0 
        ? { email: user?.email || "attendee@event.com" } 
        : { ...formData };
      
      if (paymentUrl) {
        submissionData["payment_receipt"] = paymentUrl;
      }

      await createReg.mutateAsync({ event_id: event.id, data: submissionData });
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    }
  };

  const brandColor = event.primary_color || "#7C3AED";
  const template = event.template || "split";
  const flyerUrl = event.background_image_url;
  const isDark = (event as any).color_mode === "dark";

  const formProps = {
    event,
    formFields,
    formData,
    onFieldChange: handleFieldChange,
    consent,
    onConsentChange: setConsent,
    paymentUrl,
    setPaymentUrl,
    onSubmit: handleSubmit,
    isPending: createReg.isPending,
    brandColor,
  };

  const wrapDark = (content: React.ReactNode) => (
    <div className={isDark ? "dark" : ""}>
      {content}
    </div>
  );

  if (submitted) {
    return wrapDark(
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background text-foreground" style={{ background: isDark ? undefined : `linear-gradient(135deg, ${brandColor}15, ${brandColor}05)` }}>
        <SuccessCard brandColor={brandColor} eventName={event.name} />
      </div>
    );
  }

  // ─── MINIMAL ───
  if (template === "minimal") {
    return wrapDark(
      <div className="min-h-screen relative bg-background text-foreground">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${brandColor}15, ${brandColor}05)` }} />
        <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
            <Card className="border-border shadow-2xl">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: `linear-gradient(135deg, ${brandColor}, ${brandColor}CC)` }}>
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <EventInfo event={event} />
                </div>
                <RegistrationForm {...formProps} />
                <PoweredBy />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── SPLIT SCREEN ───
  if (template === "split") {
    return wrapDark(
      <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground">
        {/* Left: flyer image — top-aligned on mobile */}
        <div className="md:w-1/2 bg-muted flex items-start md:items-center justify-center p-0 md:p-6 min-h-[250px] md:min-h-screen">
          {flyerUrl ? (
            <img src={flyerUrl} alt={event.name} className="w-full md:max-w-full md:max-h-full object-contain md:rounded-lg" />
          ) : (
            <div className="text-center p-6">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `linear-gradient(135deg, ${brandColor}, ${brandColor}CC)` }}>
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-display font-bold">{event.name}</h2>
            </div>
          )}
        </div>
        {/* Right: form */}
        <div className="md:w-1/2 flex items-center justify-center px-4 py-8 md:px-8 md:py-12">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-[85%]">
            <EventInfo event={event} className="mb-8" />
            <RegistrationForm {...formProps} />
            <PoweredBy />
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── STACKED ───
  if (template === "stacked") {
    return wrapDark(
      <div className="min-h-screen bg-background text-foreground" style={{ background: isDark ? undefined : `linear-gradient(135deg, ${brandColor}15, ${brandColor}05)` }}>
        {flyerUrl ? (
          <div className="w-full bg-muted flex items-start justify-center" style={{ maxHeight: "50vh" }}>
            <img src={flyerUrl} alt={event.name} className="w-full h-full object-contain" style={{ maxHeight: "50vh" }} />
          </div>
        ) : (
          <div className="w-full py-16 text-center" style={{ background: `linear-gradient(135deg, ${brandColor}, ${brandColor}CC)` }}>
            <h1 className="text-4xl font-display font-bold text-white">{event.name}</h1>
            {event.description && <p className="text-white/80 mt-2 max-w-lg mx-auto">{event.description}</p>}
          </div>
        )}
        <div className="max-w-lg mx-auto px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-border shadow-2xl">
              <CardContent className="p-8">
                <EventInfo event={event} className="mb-6" />
                <RegistrationForm {...formProps} />
                <PoweredBy />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── LANDING PAGE ───
  if (template === "landing") {
    return wrapDark(
      <div className="min-h-screen bg-background text-foreground">
        <div className="relative w-full flex items-start justify-center" style={{ minHeight: "50vh" }}>
          {flyerUrl ? (
            <>
              <img src={flyerUrl} alt={event.name} className="absolute inset-0 w-full h-full object-contain" />
              <div className="absolute inset-0 bg-black/60" />
            </>
          ) : (
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${brandColor}, ${brandColor}CC)` }} />
          )}
          <div className="relative text-center text-white px-4 py-16 z-10">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold mb-4 truncate max-w-3xl mx-auto">{event.name}</h1>
            {event.description && <p className="text-white/80 max-w-xl mx-auto text-lg leading-relaxed mt-3">{event.description}</p>}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-white/70">
              {event.event_date && (
                <span className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  {formatEventDateTime(event)}
                </span>
              )}
              <span className="flex items-center gap-2">
                {event.location_type === "physical" ? <MapPin className="w-5 h-5" /> : event.location_type === "hybrid" ? <Globe className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                {event.location_type === "physical" ? "In-Person" : event.location_type === "hybrid" ? "Hybrid" : "Virtual"}
              </span>
            </div>
          </div>
        </div>
        <div className="max-w-lg mx-auto px-4 py-12 -mt-8 relative z-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-border shadow-2xl">
              <CardContent className="p-8">
                <h2 className="text-xl font-display font-bold mb-6 text-center">Register Now</h2>
                <RegistrationForm {...formProps} />
                <PoweredBy />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── CARD GRID ───
  if (template === "cards") {
    return wrapDark(
      <div className="min-h-screen bg-background text-foreground" style={{ background: isDark ? undefined : `linear-gradient(135deg, ${brandColor}15, ${brandColor}05)` }}>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            {flyerUrl && (
              <div className="mb-6 flex justify-center">
                <img src={flyerUrl} alt={event.name} className="max-h-64 object-contain rounded-lg" />
              </div>
            )}
            <EventInfo event={event} />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-border">
              <CardContent className="p-6">
                <h3 className="font-display font-semibold mb-3">Event Details</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{event.description || "Join us for this exciting event."}</p>
                {event.event_date && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="w-4 h-4" />
                    {formatEventDateTime(event)}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="border-border shadow-xl">
              <CardContent className="p-6">
                <h3 className="font-display font-semibold mb-4">Register</h3>
                <RegistrationForm {...formProps} />
              </CardContent>
            </Card>
          </div>
          <PoweredBy />
        </div>
      </div>
    );
  }

  // Fallback
  return wrapDark(
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background text-foreground" style={{ background: isDark ? undefined : `linear-gradient(135deg, ${brandColor}15, ${brandColor}05)` }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <Card className="border-border shadow-2xl">
          <CardContent className="p-8">
            <EventInfo event={event} className="text-center mb-8" />
            <RegistrationForm {...formProps} />
            <PoweredBy />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;
