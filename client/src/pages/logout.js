import { useUserContext } from "../contexts/userContext";
import { useNavigate } from "react-router-dom";
export default function Logout() {
  const { handleLogout } = useUserContext();
  const navigate = useNavigate();
  const handleLogoutFn = () => {
    handleLogout();
    navigate("/");
  };
  return (
    <div className="settings-content">
      <div className="settings-header">
        <h3>Logout</h3>
        <p className="text-muted">Sign out of your account</p>
      </div>
      <div className="settings-body">
        <p>Are you sure you want to logout?</p>
        <div className="d-flex gap-2">
          <button type="button" className="btn btn-outline-secondary">
            Cancel
          </button>
          <button
            className="btn btn-primary align-item-center"
            onClick={handleLogoutFn}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
