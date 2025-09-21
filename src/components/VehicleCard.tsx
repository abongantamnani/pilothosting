interface VehicleCardProps {
  vehicle: {
    id: string;
    name: string;
    last_lat: number;
    last_lng: number;
    motion_status: boolean;
    last_update: string;
  };
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-green-400">
      <h2 className="text-xl font-bold mb-2">{vehicle.name}</h2>
      <p>Last Location: {vehicle.last_lat.toFixed(4)}, {vehicle.last_lng.toFixed(4)}</p>
      <p>Motion: {vehicle.motion_status ? "Moving" : "Stopped"}</p>
      <p>Last Update: {new Date(vehicle.last_update).toLocaleString()}</p>
      <a
        href={`/vehicle/${vehicle.id}`}
        className="mt-2 inline-block text-green-400 underline"
      >
        View Details
      </a>
    </div>
  );
}
