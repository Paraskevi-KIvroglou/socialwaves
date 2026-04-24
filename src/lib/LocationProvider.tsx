"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  LOCATION_STORAGE_KEY,
  type LocationPermission,
  type UserLocation,
} from "@/lib/location";

type LocationContextValue = {
  location: UserLocation | null;
  permission: LocationPermission;
  isRequesting: boolean;
  error: string | null;
  requestLocation: () => Promise<UserLocation | null>;
  setManualLocation: (loc: {
    latitude: number;
    longitude: number;
    label?: string;
  }) => void;
  clearLocation: () => void;
};

const LocationContext = createContext<LocationContextValue | undefined>(
  undefined
);

function readStoredLocation(): UserLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCATION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserLocation) : null;
  } catch {
    return null;
  }
}

function persistLocation(loc: UserLocation | null): void {
  if (typeof window === "undefined") return;
  if (loc === null) {
    window.localStorage.removeItem(LOCATION_STORAGE_KEY);
  } else {
    window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(loc));
  }
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [permission, setPermission] = useState<LocationPermission>("unknown");
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocation(readStoredLocation());

    if (!("geolocation" in navigator)) {
      setPermission("unsupported");
      return;
    }

    const { permissions } = navigator;
    if (permissions && typeof permissions.query === "function") {
      permissions
        .query({ name: "geolocation" as PermissionName })
        .then((status) => {
          if (status.state === "granted") setPermission("granted");
          else if (status.state === "denied") setPermission("denied");
          else setPermission("prompt");
          status.onchange = () => {
            if (status.state === "granted") setPermission("granted");
            else if (status.state === "denied") setPermission("denied");
            else setPermission("prompt");
          };
        })
        .catch(() => setPermission("prompt"));
    } else {
      setPermission("prompt");
    }
  }, []);

  const requestLocation = useCallback((): Promise<UserLocation | null> => {
    return new Promise((resolve) => {
      if (!("geolocation" in navigator)) {
        setPermission("unsupported");
        resolve(null);
        return;
      }

      setError(null);
      setIsRequesting(true);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: UserLocation = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            updatedAt: new Date().toISOString(),
            source: "geolocation",
          };
          persistLocation(loc);
          setLocation(loc);
          setPermission("granted");
          setIsRequesting(false);
          resolve(loc);
        },
        (err: GeolocationPositionError) => {
          let message: string;
          if (err.code === 1) {
            message = "Location permission denied";
            setPermission("denied");
          } else if (err.code === 3) {
            message = "Location request timed out";
          } else {
            message = "Location unavailable";
          }
          setError(message);
          setIsRequesting(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10_000,
          maximumAge: 60_000,
        }
      );
    });
  }, []);

  const setManualLocation = useCallback(
    (loc: { latitude: number; longitude: number; label?: string }) => {
      const next: UserLocation = {
        latitude: loc.latitude,
        longitude: loc.longitude,
        updatedAt: new Date().toISOString(),
        source: "manual",
        label: loc.label,
      };
      persistLocation(next);
      setLocation(next);
      setError(null);
    },
    []
  );

  const clearLocation = useCallback(() => {
    persistLocation(null);
    setLocation(null);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      location,
      permission,
      isRequesting,
      error,
      requestLocation,
      setManualLocation,
      clearLocation,
    }),
    [
      location,
      permission,
      isRequesting,
      error,
      requestLocation,
      setManualLocation,
      clearLocation,
    ]
  );

  return (
    <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
  );
}

export function useLocation(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (ctx === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return ctx;
}
