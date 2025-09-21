"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts";

// Mock car data
const cars = [
  {
    id: 1,
    name: "Toyota Corolla",
    coords: [-33.961, 25.611],
    audioUrl: "/api/car/1/audio",
    motionData: {
      x: [0.1, 0.2, -0.1, 0, 0.05],
      y: [0.05, -0.1, 0.15, 0, -0.05],
      z: [0, 0.1, -0.05, 0.05, 0.1],
    },
    gpsSpeed: 48,
    battery: 95,
    esp32Status: "Online",
    sensorHealth: "Good",
    tirePressure: [32, 33, 31, 32], // Front-left, Front-right, Rear-left, Rear-right
    brakeHealth: 85,
    mileage: 45230,
    lastService: "2023-10-15"
  },
  {
    id: 2,
    name: "VW Polo",
    coords: [-33.965, 25.620],
    audioUrl: "/api/car/2/audio",
    motionData: {
      x: [0.05, -0.1, 0.15, 0, -0.05],
      y: [0.1, 0.05, -0.1, 0, 0],
      z: [0, -0.05, 0.1, 0.05, 0],
    },
    gpsSpeed: 30,
    battery: 88,
    esp32Status: "Online",
    sensorHealth: "Good",
    tirePressure: [29, 34, 30, 31], // Uneven pressure indicating potential issues
    brakeHealth: 72,
    mileage: 68210,
    lastService: "2023-08-22"
  },
  {
    id: 3,
    name: "Ford Ranger",
    coords: [-33.968, 25.604],
    audioUrl: "/api/car/3/audio",
    motionData: {
      x: [0, 0.1, -0.05, 0.05, 0.1],
      y: [0.05, 0, -0.05, 0.1, 0.05],
      z: [0.1, -0.1, 0, 0.05, -0.05],
    },
    gpsSpeed: 52,
    battery: 80,
    esp32Status: "Online",
    sensorHealth: "Good",
    tirePressure: [35, 35, 34, 35],
    brakeHealth: 90,
    mileage: 23540,
    lastService: "2023-11-05"
  },
];

// Map style options
const mapStyles = [
  {
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  {
    name: "Topographic",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://opentopomap.org/">OpenTopoMap</a> contributors'
  },
  {
    name: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; <a href="https://www.arcgis.com/">Esri</a>'
  },
  {
    name: "Dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
  }
];

interface Event {
  carId: number;
  type: string;
  timestamp: string;
}

function AutoCenter({ position }: { position: LatLngTuple }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom(), { animate: true });
  }, [position, map]);
  return null;
}

// Car Health Visualization Components
const SuspensionVisualization = ({ data }: { data: number[] }) => {
  const maxValue = Math.max(...data.map(Math.abs));
  const severity = maxValue > 0.15 ? "High" : maxValue > 0.1 ? "Medium" : "Low";
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-semibold text-gray-800 mb-3">Suspension Analysis</h4>
      <div className="flex items-end justify-center h-32 mb-3">
        {data.map((value, index) => (
          <div key={index} className="flex flex-col items-center mx-1">
            <div 
              className="w-6 bg-blue-500 rounded-t"
              style={{ height: `${Math.abs(value) * 300}px` }}
            ></div>
            <div className="text-xs mt-1">Sample {index+1}</div>
          </div>
        ))}
      </div>
      <div className={`text-center font-medium ${
        severity === "High" ? "text-red-600" : 
        severity === "Medium" ? "text-yellow-600" : "text-green-600"
      }`}>
        {severity === "High" ? "Suspension issues detected" :
         severity === "Medium" ? "Minor suspension variations" :
         "Suspension normal"}
      </div>
    </div>
  );
};

const WheelAlignmentVisualization = ({ dataX, dataY }: { dataX: number[], dataY: number[] }) => {
  const avgX = dataX.reduce((a, b) => a + b, 0) / dataX.length;
  const avgY = dataY.reduce((a, b) => a + b, 0) / dataY.length;
  
  const alignmentIssue = Math.abs(avgX) > 0.08 || Math.abs(avgY) > 0.08;
  const severity = alignmentIssue ? "High" : "Low";
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-semibold text-gray-800 mb-3">Wheel Alignment</h4>
      <div className="flex justify-center mb-3">
        <div className="relative w-32 h-32 border-2 border-gray-400 rounded-full">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gray-200 rounded-full"></div>
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full"
            style={{
              left: `${50 + avgX * 500}%`,
              top: `${50 + avgY * 500}%`
            }}
          ></div>
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-400 transform -translate-y-1/2"></div>
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-400 transform -translate-x-1/2"></div>
        </div>
      </div>
      <div className={`text-center font-medium ${
        severity === "High" ? "text-red-600" : "text-green-600"
      }`}>
        {alignmentIssue ? "Wheel alignment needed" : "Wheel alignment normal"}
      </div>
    </div>
  );
};

const TireHealthVisualization = ({ tirePressure }: { tirePressure: number[] }) => {
  const idealPressure = 33;
  const issues = tirePressure.filter(p => Math.abs(p - idealPressure) > 2).length > 0;
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-semibold text-gray-800 mb-3">Tire Pressure (PSI)</h4>
      <div className="grid grid-cols-2 gap-3 mb-3">
        {tirePressure.map((pressure, index) => {
          const positions = ["Front Left", "Front Right", "Rear Left", "Rear Right"];
          const isIssue = Math.abs(pressure - idealPressure) > 2;
          
          return (
            <div key={index} className="text-center">
              <div className="font-medium">{positions[index]}</div>
              <div className={`text-lg font-bold ${isIssue ? "text-red-600" : "text-green-600"}`}>
                {pressure} PSI
              </div>
              {isIssue && (
                <div className="text-xs text-red-500">
                  {pressure > idealPressure ? "Over-inflated" : "Under-inflated"}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className={`text-center font-medium ${issues ? "text-red-600" : "text-green-600"}`}>
        {issues ? "Tire pressure issues detected" : "Tire pressure normal"}
      </div>
    </div>
  );
};

const OverallHealthRadar = ({ car }: { car: any }) => {
  const motionXMax = Math.max(...car.motionData.x.map(Math.abs));
  const motionYMax = Math.max(...car.motionData.y.map(Math.abs));
  const motionZMax = Math.max(...car.motionData.z.map(Math.abs));
  
  const tirePressureScore = car.tirePressure.filter((p: number) => Math.abs(p - 33) <= 2).length / 4 * 100;
  const brakeScore = car.brakeHealth;
  const batteryScore = car.battery;
  
  const radarData = [
    { subject: 'Suspension', A: 100 - Math.min(motionXMax * 500, 100), fullMark: 100 },
    { subject: 'Alignment', A: 100 - Math.min(motionYMax * 500, 100), fullMark: 100 },
    { subject: 'Balance', A: 100 - Math.min(motionZMax * 500, 100), fullMark: 100 },
    { subject: 'Tires', A: tirePressureScore, fullMark: 100 },
    { subject: 'Brakes', A: brakeScore, fullMark: 100 },
    { subject: 'Battery', A: batteryScore, fullMark: 100 },
  ];
  
  const averageHealth = radarData.reduce((sum, item) => sum + item.A, 0) / radarData.length;
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-semibold text-gray-800 mb-3">Overall Vehicle Health</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar name="Health" dataKey="A" stroke="#4CAF50" fill="#4CAF50" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className={`text-center font-medium text-lg ${
        averageHealth > 80 ? "text-green-600" : 
        averageHealth > 60 ? "text-yellow-600" : "text-red-600"
      }`}>
        Overall Score: {Math.round(averageHealth)}%
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [selectedCar, setSelectedCar] = useState<number | null>(null);
  const [alerts, setAlerts] = useState<Event[]>([]);
  const [acknowledged, setAcknowledged] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [panelOpen, setPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"car" | "alerts">("car");
  const [carSubTab, setCarSubTab] = useState<"motion" | "audio" | "hardware" | "health">("health"); // Default to health tab
  const [mapStyle, setMapStyle] = useState(0);

  const car = useMemo(
    () => cars.find((c) => c.id === selectedCar) || null,
    [selectedCar]
  );

  // Mock real-time alert trigger
  useEffect(() => {
    const timer = setInterval(() => {
      const randomCar = cars[Math.floor(Math.random() * cars.length)];
      const alertTypes = [
        "Gun sound detected",
        "Shouting detected",
        "Knife detected",
        "Car bump",
        "Glass breaking",
        "Unusual speed",
        "Harsh braking",
      ];
      const newAlert: Event = {
        carId: randomCar.id,
        type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
        timestamp: new Date().toLocaleTimeString(),
      };
      setAlerts((prev) => [...prev, newAlert]);
      setAcknowledged(false);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Play alert sound
  useEffect(() => {
    if (alerts.length > 0 && !acknowledged) {
      const audio = new Audio("/sounds/ti-ti-ti.mp3");
      audio.loop = true;
      audio.play().catch(() => {});
      return () => audio.pause();
    }
  }, [alerts, acknowledged]);

  // Simulated car health analysis
  const analyzeCarHealth = (car: typeof cars[0]): {issue: string, severity: "high" | "medium" | "low"}[] => {
    const issues: {issue: string, severity: "high" | "medium" | "low"}[] = [];
    
    const motionXMax = Math.max(...car.motionData.x.map(Math.abs));
    const motionYMax = Math.max(...car.motionData.y.map(Math.abs));
    const motionZMax = Math.max(...car.motionData.z.map(Math.abs));
    
    if (motionXMax > 0.15) issues.push({issue: "Suspension abnormality detected", severity: "high"});
    else if (motionXMax > 0.1) issues.push({issue: "Potential suspension wear", severity: "medium"});
    
    if (motionYMax > 0.15) issues.push({issue: "Wheel alignment issue detected", severity: "high"});
    else if (motionYMax > 0.1) issues.push({issue: "Slight wheel misalignment", severity: "medium"});
    
    if (motionZMax > 0.15) issues.push({issue: "Tire imbalance or damage suspected", severity: "high"});
    else if (motionZMax > 0.1) issues.push({issue: "Minor tire balance issues", severity: "medium"});
    
    if (car.gpsSpeed > 80) issues.push({issue: "High speed stress on vehicle", severity: "medium"});
    if (car.esp32Status !== "Online") issues.push({issue: "ESP32 connectivity issue", severity: "high"});
    
    // Check tire pressure
    const tireIssues = car.tirePressure.filter(p => Math.abs(p - 33) > 2).length;
    if (tireIssues > 0) {
      issues.push({
        issue: `${tireIssues} tire(s) with pressure issues`,
        severity: tireIssues > 1 ? "high" : "medium"
      });
    }
    
    // Check brake health
    if (car.brakeHealth < 60) issues.push({issue: "Brakes need immediate attention", severity: "high"});
    else if (car.brakeHealth < 75) issues.push({issue: "Brakes wearing down", severity: "medium"});
    
    // Check battery
    if (car.battery < 70) issues.push({issue: "Battery may need replacement soon", severity: "medium"});
    if (car.battery < 50) issues.push({issue: "Battery critically low", severity: "high"});
    
    return issues.length ? issues : [{issue: "All systems normal", severity: "low"}];
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-900 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Vehicle Monitoring Dashboard</h1>
        <div className="flex items-center gap-4">
          {alerts.length > 0 && !acknowledged && (
            <div className="bg-red-600 text-white px-3 py-1 rounded-full flex items-center gap-2">
              <span className="h-2 w-2 bg-white rounded-full animate-pulse"></span>
              <span>{alerts.length} Active Alert{alerts.length > 1 ? 's' : ''}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <select 
              className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
              value={mapStyle}
              onChange={(e) => setMapStyle(parseInt(e.target.value))}
            >
              {mapStyles.map((style, index) => (
                <option key={index} value={index}>{style.name}</option>
              ))}
            </select>
            <button 
              className="bg-green-700 hover:bg-green-600 px-3 py-1 rounded text-sm"
              onClick={() => setPanelOpen(!panelOpen)}
            >
              {panelOpen ? 'Hide Panel' : 'Show Panel'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 text-green-400 p-4 overflow-y-auto">
          <h2 className="text-lg font-bold mb-4">Vehicles</h2>
          {cars.map((c) => {
            const carAlerts = alerts.filter((a) => a.carId === c.id);
            const hasAlert = carAlerts.length > 0 && !acknowledged;
            const healthIssues = analyzeCarHealth(c).filter(i => i.severity !== "low" && i.issue !== "All systems normal");
            
            return (
              <div
                key={c.id}
                className={`relative p-3 mb-2 border rounded-lg cursor-pointer transition-all ${
                  selectedCar === c.id 
                    ? 'bg-green-700 border-green-500' 
                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                } ${hasAlert ? 'border-red-500' : ''}`}
                onClick={() => {
                  setSelectedCar(c.id);
                  setActiveTab("car");
                  setPanelOpen(true);
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{c.name}</span>
                  <div className="flex">
                    {hasAlert && (
                      <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full mr-1">
                        {carAlerts.length}
                      </span>
                    )}
                    {healthIssues.length > 0 && (
                      <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded-full">
                        {healthIssues.length}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs mt-1 text-gray-400">
                  Battery: {c.battery}% • Speed: {c.gpsSpeed} km/h
                </div>
                {healthIssues.length > 0 && (
                  <div className="text-xs mt-1 text-yellow-400">
                    {healthIssues.length} issue{healthIssues.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Map Area */}
        <div className="flex-1 relative p-4">
          {car && showMap ? (
            <div className="relative h-full w-full rounded-lg overflow-hidden shadow-md">
              <MapContainer
                center={car.coords as LatLngTuple}
                zoom={15}
                preferCanvas={true}
                className="h-full w-full"
              >
                <TileLayer
                  url={mapStyles[mapStyle].url}
                  attribution={mapStyles[mapStyle].attribution}
                />
                <Marker position={car.coords as LatLngTuple}>
                  <Popup>{car.name}</Popup>
                </Marker>
                <AutoCenter position={car.coords as LatLngTuple} />
              </MapContainer>

              {alerts.length > 0 && !acknowledged && (
                <div className="absolute inset-0 bg-red-500 bg-opacity-20 animate-pulse pointer-events-none rounded-lg z-10 border-4 border-red-500"></div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 bg-gray-200 rounded-lg">
              🚗 Select a car to view it on the map
            </div>
          )}
        </div>

        {/* Slide-in Panel */}
        <div
          className={`bg-white shadow-lg overflow-y-auto transition-all duration-300 ease-in-out ${
            panelOpen ? 'w-96' : 'w-0'
          }`}
        >
          {panelOpen && car && (
            <div className="p-4">
              {/* Panel header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  <button
                    className={`px-4 py-2 rounded-lg ${
                      activeTab === "car" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800"
                    }`}
                    onClick={() => setActiveTab("car")}
                  >
                    Car Info
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg ${
                      activeTab === "alerts" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-800"
                    }`}
                    onClick={() => setActiveTab("alerts")}
                  >
                    Alerts {alerts.length > 0 && !acknowledged && `(${alerts.length})`}
                  </button>
                </div>
              </div>

              {/* Car Info Tab */}
              {activeTab === "car" && (
                <>
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{car.name}</h2>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-gray-100 p-2 rounded">
                        <div className="text-xs text-gray-500">Battery</div>
                        <div className="text-lg font-semibold">{car.battery}%</div>
                      </div>
                      <div className="bg-gray-100 p-2 rounded">
                        <div className="text-xs text-gray-500">Speed</div>
                        <div className="text-lg font-semibold">{car.gpsSpeed} km/h</div>
                      </div>
                      <div className="bg-gray-100 p-2 rounded">
                        <div className="text-xs text-gray-500">Mileage</div>
                        <div className="text-lg font-semibold">{car.mileage.toLocaleString()} km</div>
                      </div>
                      <div className="bg-gray-100 p-2 rounded">
                        <div className="text-xs text-gray-500">Last Service</div>
                        <div className="text-lg font-semibold">{car.lastService}</div>
                      </div>
                    </div>
                  </div>

                  {/* Sub-tabs */}
                  <div className="flex gap-2 mb-4 overflow-x-auto">
                    {(["motion", "audio", "hardware", "health"] as const).map((tab) => (
                      <button
                        key={tab}
                        className={`px-3 py-1 rounded-full whitespace-nowrap ${
                          carSubTab === tab ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800"
                        }`}
                        onClick={() => setCarSubTab(tab)}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Motion Tab */}
                  {carSubTab === "motion" && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-700">Motion Sensors</h3>
                      {["x", "y", "z"].map((axis) => (
                        <div key={axis} className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium text-gray-700 mb-2">{axis.toUpperCase()} Axis</p>
                          <div className="h-20">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={car.motionData[axis as "x" | "y" | "z"].map(
                                  (val, i) => ({ time: i, value: val })
                                )}
                              >
                                <XAxis dataKey="time" />
                                <YAxis />
                                <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
                                <Tooltip />
                                <Line
                                  type="monotone"
                                  dataKey="value"
                                  stroke="#10b981"
                                  strokeWidth={2}
                                  dot={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Audio Tab */}
                  {carSubTab === "audio" && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h3 className="font-semibold text-gray-700 mb-2">Live Audio</h3>
                      <audio controls src={car.audioUrl} className="w-full"></audio>
                    </div>
                  )}

                  {/* Hardware Tab */}
                  {carSubTab === "hardware" && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-700">Hardware Status</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-100 p-3 rounded">
                          <div className="text-xs text-gray-500">ESP32 Status</div>
                          <div className={`font-semibold ${car.esp32Status === "Online" ? "text-green-600" : "text-red-600"}`}>
                            {car.esp32Status}
                          </div>
                        </div>
                        <div className="bg-gray-100 p-3 rounded">
                          <div className="text-xs text-gray-500">Sensor Health</div>
                          <div className={`font-semibold ${car.sensorHealth === "Good" ? "text-green-600" : "text-yellow-600"}`}>
                            {car.sensorHealth}
                          </div>
                        </div>
                        <div className="bg-gray-100 p-3 rounded">
                          <div className="text-xs text-gray-500">Brake Health</div>
                          <div className={`font-semibold ${
                            car.brakeHealth > 75 ? "text-green-600" : 
                            car.brakeHealth > 60 ? "text-yellow-600" : "text-red-600"
                          }`}>
                            {car.brakeHealth}%
                          </div>
                        </div>
                        <div className="bg-gray-100 p-3 rounded">
                          <div className="text-xs text-gray-500">Battery Health</div>
                          <div className={`font-semibold ${
                            car.battery > 80 ? "text-green-600" : 
                            car.battery > 60 ? "text-yellow-600" : "text-red-600"
                          }`}>
                            {car.battery}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Car Health Tab */}
                  {carSubTab === "health" && (
                    <div className="space-y-4">
                      <OverallHealthRadar car={car} />
                      
                      <div className="grid grid-cols-1 gap-4">
                        <SuspensionVisualization data={car.motionData.x} />
                        <WheelAlignmentVisualization dataX={car.motionData.x} dataY={car.motionData.y} />
                        <TireHealthVisualization tirePressure={car.tirePressure} />
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-3">Health Assessment</h4>
                        <div className="space-y-2">
                          {analyzeCarHealth(car).map((item, idx) => (
                            <div key={idx} className="flex items-start">
                              <div className={`h-2 w-2 rounded-full mt-2 mr-2 ${
                                item.severity === "high" ? "bg-red-500" : 
                                item.severity === "medium" ? "bg-yellow-500" : "bg-green-500"
                              }`}></div>
                              <span className={
                                item.severity === "high" ? "text-red-700" : 
                                item.severity === "medium" ? "text-yellow-700" : "text-green-700"
                              }>
                                {item.issue}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Alerts Tab */}
              {activeTab === "alerts" && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Active Alerts</h3>
                  
                  {alerts.length > 0 ? (
                    <>
                      <div className="space-y-3">
                        {alerts.map((a, i) => {
                          const carInfo = cars.find((c) => c.id === a.carId);
                          return (
                            <div
                              key={i}
                              className="p-3 border-l-4 border-red-500 bg-red-50 rounded-r"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-bold text-red-800">{carInfo?.name}</p>
                                  <p className="text-red-700">{a.type}</p>
                                </div>
                                <span className="text-xs text-red-600 whitespace-nowrap">{a.timestamp}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {!acknowledged && (
                        <button
                          onClick={() => setAcknowledged(true)}
                          className="mt-4 w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow"
                        >
                          Acknowledge All Alerts
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">✅</div>
                      <p>No active alerts</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}