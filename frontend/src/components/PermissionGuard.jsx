// components/PermissionGuard.jsx
import useAuthStore from '../store/useAuthStore';

const PermissionGuard = ({ roles, children, fallback = null }) => {
  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);

  if (!hasAnyRole(roles)) {
    return fallback;
  }

  return <>{children}</>;
};

export default PermissionGuard;