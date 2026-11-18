
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./ProfileDropdown.css";

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.fullName
    ?.trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleLogout() {
    setIsOpen(false);
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      <button
        className={`profile-trigger ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Open profile menu"
      >
        <span className="profile-avatar">{initials}</span>

        <span className="profile-trigger-info">
          <span className="profile-trigger-name">
            {user?.fullName || "User"}
          </span>
          <span className="profile-trigger-email">
            {user?.email || ""}
          </span>
        </span>

        <span className={`profile-chevron ${isOpen ? "rotated" : ""}`}>
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="profile-menu">
          <div className="profile-menu-header">
            <span className="profile-avatar large">{initials}</span>

            <div className="profile-menu-user">
              <strong>{user?.fullName || "User"}</strong>
              <span>{user?.email || ""}</span>
            </div>
          </div>

          <div className="profile-menu-divider" />

          <div className="profile-account-info">
            <span className="profile-info-label">
              Account status
            </span>

            <span className="profile-status">
              <span className="profile-status-dot" />
              Active account
            </span>

            <span className="profile-info-label role-label">
              Account role
            </span>

            <span className="profile-role">
              {user?.role || "USER"}
            </span>
          </div>

          <div className="profile-menu-divider" />

          <button
            className="profile-logout-button"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

          <div className="profile-menu-footer">
            LinkLite Account
          </div>
        </div>
      )}
    </div>
  );
}
