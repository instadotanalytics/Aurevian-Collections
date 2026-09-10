import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiMapPin, FiX, FiLoader, FiLogIn } from "react-icons/fi";
import { useLocationContext } from "../../../contexts/LocationContext";
import styles from "./LocationPermissionModal.module.css";

const LocationPermissionModal = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state) => state.auth);
    const {
        showPermissionModal,
        pendingIntent,
        requestLocation,
        declineLocation,
        isLocating,
        locationError,
        closePermissionModal,
    } = useLocationContext();

    if (!showPermissionModal) return null;

    const isPurchaseGated = !!pendingIntent;

    return (
        <div className={styles.overlay} onClick={closePermissionModal}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button
                    type="button"
                    className={styles.closeBtn}
                    onClick={closePermissionModal}
                    aria-label="Close"
                >
                    <FiX size={18} />
                </button>

                <div className={styles.iconWrap}>
                    <FiMapPin size={26} />
                </div>

                <h3 className={styles.title}>
                    {isPurchaseGated
                        ? "Share your location to continue"
                        : "See what's near you"}
                </h3>
                <p className={styles.body}>
                    {isPurchaseGated
                        ? "We use your location to confirm delivery estimates and show nearby showroom availability before you buy."
                        : "Allow location access to see products and showrooms closest to you. You can always browse without it — nothing changes except the order products appear in."}
                </p>

                {locationError && <p className={styles.errorText}>{locationError}</p>}

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.primaryBtn}
                        onClick={requestLocation}
                        disabled={isLocating}
                    >
                        {isLocating ? (
                            <>
                                <FiLoader className={styles.spinIcon} size={15} />
                                Locating...
                            </>
                        ) : (
                            "Allow Location"
                        )}
                    </button>
                    <button
                        type="button"
                        className={styles.secondaryBtn}
                        onClick={declineLocation}
                        disabled={isLocating}
                    >
                        Not Now
                    </button>
                </div>

                {!isAuthenticated && (
                    <button
                        type="button"
                        className={styles.loginSuggestion}
                        onClick={() => {
                            closePermissionModal();
                            navigate("/login");
                        }}
                    >
                        <FiLogIn size={14} />
                        Log in for a faster, personalized checkout
                    </button>
                )}
            </div>
        </div>
    );
};

export default LocationPermissionModal;