// src/hooks/useSellerDashboardLiveUpdates.js
//
// Live-updates the Seller Dashboard's numbers/orders/activity feed when a
// relevant order event lands on this seller's existing Socket.IO room
// (seller:<id>) — no new socket connection, no polling. Reuses the same
// useOrderSocketEvents hook that already powers NotificationCenter.
//
// Several socket events can land within milliseconds of each other (e.g.
// order created immediately followed by a status update), so refetches
// are debounced into a single burst of API calls instead of one call per
// event.

import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import useOrderSocketEvents from "./useOrderSocketEvents.js";
import {
  fetchSellerDashboard,
  fetchRecentOrders,
  fetchRecentActivities,
} from "../redux/slices/sellerSlice.js";

const DEBOUNCE_MS = 600;

export default function useSellerDashboardLiveUpdates() {
  const dispatch = useDispatch();
  const timerRef = useRef(null);

  const refresh = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      dispatch(fetchSellerDashboard());
      dispatch(fetchRecentOrders());
      dispatch(fetchRecentActivities());
    }, DEBOUNCE_MS);
  };

  useOrderSocketEvents({
    onOrderCreated: refresh,
    onSellerConfirmed: refresh,
    onSellerRejected: refresh,
    onAdminConfirmed: refresh,
    onAdminRejected: refresh,
    onShippingUpdated: refresh,
    onStatusUpdated: refresh,
  });

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
}
