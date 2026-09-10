// src/contexts/LocationContext.jsx

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
} from "react";

const LocationContext = createContext(null);

const STORAGE_KEYS = {
    CHOICE: "locationPermissionChoice", // "granted" | "denied" | null
    COORDS: "userLocationCoords", // { lat, lng, updatedAt }
};

const readStoredCoords = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.COORDS);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (
            typeof parsed?.lat === "number" &&
            typeof parsed?.lng === "number" &&
            Number.isFinite(parsed.lat) &&
            Number.isFinite(parsed.lng)
        ) {
            return parsed;
        }
        return null;
    } catch {
        return null;
    }
};

export const useLocationContext = () => {
    const ctx = useContext(LocationContext);
    if (!ctx) {
        throw new Error("useLocationContext must be used within LocationProvider");
    }
    return ctx;
};

export const LocationProvider = ({ children }) => {
    const [coords, setCoords] = useState(() => readStoredCoords());
    const [permissionChoice, setPermissionChoice] = useState(() => {
        try {
            return localStorage.getItem(STORAGE_KEYS.CHOICE) || null;
        } catch {
            return null;
        }
    });
    const [isLocating, setIsLocating] = useState(false);
    const [locationError, setLocationError] = useState(null);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    // ✅ NEW — set when the modal was opened specifically to gate a
    // purchase action (Buy Now / Add to Cart), so the modal can show a
    // more purposeful message and, on success, resume that action.
    const [pendingIntent, setPendingIntent] = useState(null); // { onGranted } | null

    const isGeolocationSupported =
        typeof navigator !== "undefined" && "geolocation" in navigator;

    // Show the popup once, only when the user has never decided either
    // way. Graceful fallback: never nag on unsupported browsers.
    useEffect(() => {
        if (!isGeolocationSupported) return;
        if (permissionChoice === null) {
            setShowPermissionModal(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const persistCoords = useCallback((lat, lng) => {
        const record = { lat, lng, updatedAt: Date.now() };
        setCoords(record);
        try {
            localStorage.setItem(STORAGE_KEYS.COORDS, JSON.stringify(record));
        } catch {
            // best-effort only
        }
    }, []);

    const persistChoice = useCallback((choice) => {
        setPermissionChoice(choice);
        try {
            localStorage.setItem(STORAGE_KEYS.CHOICE, choice);
        } catch {
            // no-op
        }
    }, []);

    const requestLocation = useCallback(() => {
        if (!isGeolocationSupported) {
            setLocationError("Location isn't supported on this browser.");
            persistChoice("denied");
            setShowPermissionModal(false);
            setPendingIntent(null);
            return;
        }

        setIsLocating(true);
        setLocationError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                persistCoords(latitude, longitude);
                persistChoice("granted");
                setIsLocating(false);
                setShowPermissionModal(false);
                setPendingIntent((intent) => {
                    if (intent?.onGranted) intent.onGranted();
                    return null;
                });
            },
            (error) => {
                setIsLocating(false);
                setShowPermissionModal(false);
                if (error.code === error.PERMISSION_DENIED) {
                    persistChoice("denied");
                } else {
                    setLocationError(
                        "We couldn't get your location right now. You can try again anytime.",
                    );
                    persistChoice("denied");
                }
                setPendingIntent(null);
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
        );
    }, [isGeolocationSupported, persistCoords, persistChoice]);

    const declineLocation = useCallback(() => {
        persistChoice("denied");
        setShowPermissionModal(false);
        setPendingIntent(null);
    }, [persistChoice]);

    const openLocationPrompt = useCallback(() => {
        setLocationError(null);
        setPendingIntent(null);
        setShowPermissionModal(true);
    }, []);

    const clearLocation = useCallback(() => {
        setCoords(null);
        persistChoice("denied");
        try {
            localStorage.removeItem(STORAGE_KEYS.COORDS);
        } catch {
            // no-op
        }
    }, [persistChoice]);

    const closePermissionModal = useCallback(() => {
        setShowPermissionModal(false);
        setPendingIntent(null);
    }, []);

    // ✅ NEW — call this right before a purchase action (Buy Now / Add to
    // Cart). If we already have live coordinates, runs onGranted()
    // immediately and returns true. Otherwise (never asked, or user had
    // denied earlier) it re-opens the permission modal and returns
    // false — the caller should stop and let the modal's flow (Allow ->
    // onGranted, or Not Now -> nothing) take over.
    const promptLocationIfNeeded = useCallback(
        (onGranted) => {
            if (coords) {
                onGranted?.();
                return true;
            }
            setLocationError(null);
            setPendingIntent({ onGranted });
            setShowPermissionModal(true);
            return false;
        },
        [coords],
    );

    const value = useMemo(
        () => ({
            coords,
            hasLocation: !!coords,
            permissionChoice,
            isLocating,
            locationError,
            isGeolocationSupported,
            showPermissionModal,
            pendingIntent,
            requestLocation,
            declineLocation,
            openLocationPrompt,
            clearLocation,
            closePermissionModal,
            promptLocationIfNeeded,
        }),
        [
            coords,
            permissionChoice,
            isLocating,
            locationError,
            isGeolocationSupported,
            showPermissionModal,
            pendingIntent,
            requestLocation,
            declineLocation,
            openLocationPrompt,
            clearLocation,
            closePermissionModal,
            promptLocationIfNeeded,
        ],
    );

    return (
        <LocationContext.Provider value={value}>
            {children}
        </LocationContext.Provider>
    );
};

export default LocationContext;