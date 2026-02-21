import { useState, useRef, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PullToRefresh({ onRefresh }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const threshold = 80;

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (window.scrollY !== 0 || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;
    
    if (distance > 0) {
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    setPullDistance(0);
  };

  useEffect(() => {
    const element = document.documentElement;
    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove, { passive: true });
    element.addEventListener("touchend", handleTouchEnd);

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pullDistance, isRefreshing]);

  return (
    <AnimatePresence>
      {(pullDistance > 0 || isRefreshing) && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ transform: `translateY(${Math.min(pullDistance, threshold)}px)` }}
        >
          <div className="glass rounded-full p-3 shadow-lg border border-emerald-200 dark:border-emerald-800">
            <RefreshCw
              className={`w-5 h-5 text-emerald-600 dark:text-emerald-400 ${
                isRefreshing ? "animate-spin" : ""
              }`}
              style={{
                transform: `rotate(${(pullDistance / threshold) * 360}deg)`,
                transition: isRefreshing ? "none" : "transform 0.1s ease"
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}