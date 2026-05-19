import { motion } from "framer-motion";
import { Phone, Navigation, Hospital, Shield, Flame, Stethoscope, Ambulance } from "lucide-react";
import { NearbyService, formatDistance } from "@/services/nearbyServices";

const TYPE_CONFIG = {
  hospital: {
    icon: Hospital,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    badge: "bg-red-500/20 text-red-400",
    label: "Hospital",
  },
  police: {
    icon: Shield,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    badge: "bg-blue-500/20 text-blue-400",
    label: "Police",
  },
  fire_station: {
    icon: Flame,
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
    badge: "bg-orange-500/20 text-orange-400",
    label: "Fire",
  },
  clinic: {
    icon: Stethoscope,
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
    badge: "bg-green-500/20 text-green-400",
    label: "Clinic",
  },
  ambulance: {
    icon: Ambulance,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
    badge: "bg-yellow-500/20 text-yellow-400",
    label: "Ambulance",
  },
};

interface Props {
  service: NearbyService;
  index: number;
  userLat?: number;
  userLng?: number;
}

export default function NearbyServiceCard({ service, index, userLat, userLng }: Props) {
  const config = TYPE_CONFIG[service.type] ?? TYPE_CONFIG.hospital;
  const Icon = config.icon;

  const handleCall = () => {
    if (service.phone) {
      window.location.href = `tel:${service.phone}`;
    } else {
      // fallback emergency numbers
      const fallback: Record<string, string> = {
        hospital: "tel:112",
        police: "tel:100",
        fire_station: "tel:101",
        ambulance: "tel:108",
        clinic: "tel:112",
      };
      window.location.href = fallback[service.type] ?? "tel:112";
    }
  };

  const handleNavigate = () => {
    const dest = `${service.lat},${service.lng}`;
    const origin = userLat && userLng ? `${userLat},${userLng}` : "";
    const url = origin
      ? `https://www.google.com/maps/dir/${origin}/${dest}`
      : `https://www.google.com/maps/search/?api=1&query=${dest}`;
    window.open(url, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`glass-dark rounded-2xl border p-4 ${config.bg}`}
      data-testid={`nearby-service-card-${service.id}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.badge}`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${config.badge}`}>
              {config.label}
            </span>
          </div>
          <h3 className="font-semibold text-foreground text-sm leading-tight truncate">
            {service.name}
          </h3>
          {service.distance !== undefined && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatDistance(service.distance)} away
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleCall}
          data-testid={`call-btn-${service.id}`}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-semibold hover:bg-green-500/20 transition-colors"
        >
          <Phone className="w-4 h-4" />
          Call
        </button>
        <button
          onClick={handleNavigate}
          data-testid={`navigate-btn-${service.id}`}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-semibold hover:bg-blue-500/20 transition-colors"
        >
          <Navigation className="w-4 h-4" />
          Navigate
        </button>
      </div>
    </motion.div>
  );
}
