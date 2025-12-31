import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Loader2, Target } from 'lucide-react';

// Safe icon initialization
const getMarkerIcon = () => {
    try {
        return new L.Icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
        });
    } catch (e) {
        return undefined;
    }
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error("Map Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="h-[300px] flex items-center justify-center bg-red-50 text-red-500 rounded p-4 text-center">
                    <p>Something went wrong loading the map.<br />Please try entering the address manually.</p>
                </div>
            );
        }

        return this.props.children;
    }
}

// Helper to fix map rendering in Modals
function MapResizer() {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
}

function DraggableMarker({ position, onMove }: { position: { lat: number, lng: number }, onMove: (pos: { lat: number, lng: number }) => void }) {
    const map = useMapEvents({
        click(e) {
            const newPos = { lat: e.latlng.lat, lng: e.latlng.lng };
            onMove(newPos);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    const icon = getMarkerIcon();

    return (
        <Marker
            position={position}
            icon={icon}
            draggable={true}
            eventHandlers={{
                dragend: (e) => {
                    const marker = e.target;
                    const pos = marker.getLatLng();
                    const newPos = { lat: pos.lat, lng: pos.lng };
                    onMove(newPos);
                    map.flyTo(pos, map.getZoom());
                },
            }}
        />
    );
};

interface MapLocationPickerProps {
    onConfirm: (data: any) => void;
    initialLat?: number;
    initialLon?: number;
}

export default function MapLocationPicker({ onConfirm, initialLat, initialLon }: MapLocationPickerProps) {
    // Use simple object state instead of L.LatLng to avoid instance issues
    const [position, setPosition] = useState<{ lat: number, lng: number } | null>(
        initialLat && initialLon ? { lat: initialLat, lng: initialLon } : null
    );
    const [loading, setLoading] = useState(false);

    // Safety check for geolocation support
    useEffect(() => {
        if (!position) {
            if (!navigator.geolocation) {
                // Fallback to New Delhi if geolocation not supported
                setPosition({ lat: 28.6139, lng: 77.2090 });
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                },
                (err) => {
                    console.error("Geolocation denied/error:", err);
                    // Fallback to New Delhi (India Center-ish)
                    setPosition({ lat: 28.6139, lng: 77.2090 });
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        }
    }, []);

    const confirmLocation = async () => {
        if (!position) return;
        setLoading(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'ShopKartEcommerce/1.0',
                    },
                }
            );
            const data = await res.json();
            onConfirm({
                ...data,
                lat: position.lat,
                lon: position.lng
            });
        } catch (error) {
            console.error("Geocoding failed", error);
        } finally {
            setLoading(false);
        }
    };

    if (!position) {
        return (
            <div className="h-[400px] flex flex-col items-center justify-center bg-muted/20 rounded-lg">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Detecting location...</p>
            </div>
        );
    }

    const handleLocateMe = () => {
        setLoading(true);
        if (!navigator.geolocation) {
            console.error("Geolocation not supported");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setPosition(newPos);

                // We need to fly to the new position. Since we don't have direct access to map instance here easily without context,
                // we rely on the position state update triggering a re-render. 
                // However, DraggableMarker doesn't auto-fly on prop change in previous code.
                // A better approach is to move this button INSIDE the MapContainer where we have useMap, 
                // OR use a small effect component that watches `position` and flies to it.
                // Let's implement a 'RecenterAutomatically' component inside MapContainer.

                setLoading(false);
            },
            (err) => {
                console.error("Geolocation failed", err);
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="h-[350px] w-full rounded-lg overflow-hidden border border-border relative z-0">
                <ErrorBoundary>
                    <MapContainer center={position} zoom={16} className="h-full w-full">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapResizer />
                        <MapRecenter position={position} />
                        <DraggableMarker position={position} onMove={setPosition} />

                        <div className="absolute bottom-4 right-4 z-[1000]">
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                className="shadow-md bg-white hover:bg-gray-100 text-black border border-gray-200"
                                onClick={handleLocateMe}
                            >
                                <Loader2 className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Locate Me
                            </Button>
                        </div>
                    </MapContainer>
                </ErrorBoundary>
            </div>

            <div className="bg-yellow-50 text-yellow-800 text-xs px-3 py-2 rounded border border-yellow-200">
                ⚠️ Drag the pin to your exact location for better delivery accuracy.
            </div>

            <Button onClick={confirmLocation} disabled={loading} className="w-full">
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Fetching Address...
                    </>
                ) : (
                    'Confirm Location'
                )}
            </Button>
        </div>
    );
}

// Helper to auto-center map when position changes programmatically (e.g. Locate Me click)
function MapRecenter({ position }: { position: { lat: number, lng: number } }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(position, map.getZoom());
    }, [position, map]);
    return null;
}
