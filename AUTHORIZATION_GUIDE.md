# 🔐 AUTHORIZATION GUIDE - IPBB System

## 📖 Table of Contents
- [Overview](#overview)
- [Security Principles](#security-principles)
- [Backend Authorization](#backend-authorization)
- [Frontend Authorization](#frontend-authorization)
- [Endpoint Access Matrix](#endpoint-access-matrix)
- [Implementation Examples](#implementation-examples)
- [Security Best Practices](#security-best-practices)

---

## Overview

IPBB system menggunakan **2-layer authorization**:
1. **Backend** - Real security & data protection (**MANDATORY**)
2. **Frontend** - UI/UX & user experience (**OPTIONAL but recommended**)

### 🎯 Role System

| Role | `is_admin` | `is_verified` | Access Level |
|------|-----------|---------------|--------------|
| **Guest** | - | - | Login, Register only |
| **Unverified User** | `false` | `false` | Profile, SPPT verification |
| **Verified User** | `false` | `true` | All SPPT features |
| **Admin** | `true` | any | All features + user management |

---

## Security Principles

### ⚠️ CRITICAL RULES:

1. **Never Trust The Client**
   - Frontend dapat di-bypass menggunakan tools seperti Postman
   - SEMUA validasi harus ada di backend
   - Frontend authorization hanya untuk UX

2. **Backend is Source of Truth**
   - Setiap endpoint harus validate authorization
   - Return 401 (Unauthorized) jika token invalid
   - Return 403 (Forbidden) jika tidak punya akses

3. **Principle of Least Privilege**
   - User hanya bisa akses data yang mereka butuhkan
   - Admin bisa akses semua data
   - Unverified user hanya bisa verifikasi SPPT

---

## Backend Authorization

### Method 1: Using Dependency Injection (✅ RECOMMENDED)

```python
from app.core.deps import SessionDep, CurrentUser
from app.auth.service import get_current_user
from app.models.user import User

# Simple: Any authenticated user
@router.get("/my-profile")
async def get_profile(
    session: SessionDep,
    current_user: User = Depends(get_current_user)
):
    return {"user": current_user}
```

### Method 2: Inline Admin Check

```python
@router.get("/admin-stats")
async def admin_stats(
    session: SessionDep,
    current_user: User = Depends(get_current_user)
):
    # Check admin first
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail={"code": "ADMIN_REQUIRED", "msg": "Admin access required"}
        )
    
    # Continue with logic
    stats = await get_stats(session)
    return stats
```

### Method 3: Helper Function

```python
def require_admin(current_user: User):
    """Reusable admin checker"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin required")

def require_verified(current_user: User):
    """Reusable verification checker"""
    if not current_user.is_verified:
        raise HTTPException(status_code=403, detail="SPPT verification required")

# Usage
@router.get("/dashboard")
async def dashboard(current_user: User = Depends(get_current_user)):
    require_admin(current_user)  # ← Check here
    # ... continue
```

---

## Frontend Authorization

### Component-Level Protection

```tsx
// components/admin-guard.tsx
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { data: user } = useAuthMe()
  const router = useRouter()
  
  useEffect(() => {
    if (user && !user.is_admin) {
      router.replace("/profile") // Redirect non-admin
    }
  }, [user])
  
  if (!user?.is_admin) return null // Don't render
  
  return <>{children}</>
}

// Usage in page
export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminContent />  {/* Only visible to admin */}
    </AdminGuard>
  )
}
```

### Conditional Rendering

```tsx
export function Navigation() {
  const { data: user } = useAuthMe()
  
  return (
    <nav>
      <Link href="/profile">Profile</Link>
      <Link href="/sppt">My SPPT</Link>
      
      {/* Show admin menu only for admin */}
      {user?.is_admin && (
        <Link href="/admin">Admin Panel</Link>
      )}
    </nav>
  )
}
```

### API Call Protection (Automatic via Interceptor)

```tsx
// lib/orval/mutator.ts
AXIOS_INSTANCE.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Automatic 401/403 handling
AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try refresh token
    }
    if (error.response?.status === 403) {
      // Show "Access Denied" message
      toast.error("You don't have permission to access this")
    }
    return Promise.reject(error)
  }
)
```

---

## Endpoint Access Matrix

| Endpoint | Public | User | Verified | Admin | Notes |
|----------|--------|------|----------|-------|-------|
| **AUTH** |
| `POST /auth/register` | ✅ | ✅ | ✅ | ✅ | Anyone |
| `POST /auth/login` | ✅ | ✅ | ✅ | ✅ | Anyone |
| `POST /auth/refresh` | ✅ | ✅ | ✅ | ✅ | With refresh token |
| `GET /auth/me` | ❌ | ✅ | ✅ | ✅ | Logged in users |
| `GET /auth/oauth/google/*` | ✅ | ✅ | ✅ | ✅ | OAuth flow |
| **PROFILE** |
| `GET /profile/me` | ❌ | ✅ | ✅ | ✅ | Own profile |
| ~~`GET /profile/toggle-admin`~~ | ❌ | ❌ | ❌ | ❌ | **DISABLED (Security)** |
| **SPPT VERIFICATION** |
| `POST /op/verifikasi` | ❌ | ✅ | ✅ | ✅ | For unverified users |
| **SPPT DATA (Verified Users)** |
| `GET /op/spop` | ❌ | ❌ | ✅ | ✅ | Requires verification |
| `POST /op/sppt/years` | ❌ | ❌ | ✅ | ✅ | Requires verification |
| `GET /op/sppt/{year}/{nop}/*` | ❌ | ❌ | ✅ | ✅ | Requires verification |
| `GET /op/sppt/batch/{nop}/*` | ❌ | ❌ | ✅ | ✅ | Requires verification |
| **ADMIN PANEL** |
| `GET /admin/users` | ❌ | ❌ | ❌ | ✅ | Admin only |
| `POST /admin/users` | ❌ | ❌ | ❌ | ✅ | Admin only |
| `PATCH /admin/users/{id}` | ❌ | ❌ | ❌ | ✅ | Admin only |
| `DELETE /admin/users/{id}` | ❌ | ❌ | ❌ | ✅ | Admin only |
| **DASHBOARD** |
| `GET /dashboard/stats` | ❌ | ❌ | ❌ | ✅ | Admin only |
| `GET /dashboard/filters` | ❌ | ❌ | ❌ | ✅ | Admin only |
| `GET /dashboard/sppt-report/*` | ❌ | ❌ | ❌ | ✅ | Admin only |

**Legend:**
- ✅ = Allowed
- ❌ = Forbidden (401/403 error)
- ~~Strikethrough~~ = Disabled for security

---

## Implementation Examples

### Example 1: Admin-Only Endpoint

```python
# backend/app/routes/admin.py
from fastapi import APIRouter, Depends, HTTPException
from app.auth.service import get_current_user
from app.models.user import User

router = APIRouter(prefix="/admin")

def require_admin(current_user: User):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")

@router.get("/users")
async def get_all_users(
    session: SessionDep,
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)  # ← Check admin
    
    users = await session.exec(select(User)).all()
    return {"users": users}
```

### Example 2: Verified User Only

```python
# backend/app/sppt/router.py
@router.get("/spop")
async def get_spop(
    session: SessionDep,
    current_user: User = Depends(get_current_user)
):
    # Check verification status
    if not current_user.is_verified:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "VERIFICATION_REQUIRED",
                "msg": "You must verify your SPPT data first"
            }
        )
    
    spop = await session.exec(select(Spop)).all()
    return {"data": spop}
```

### Example 3: Frontend Protection

```tsx
// app/admin/page.tsx
import { AdminGuard } from "@/components/admin-guard"

export default function AdminPage() {
  return (
    <AdminGuard>
      <div>
        <h1>Admin Panel</h1>
        {/* Admin-only content */}
      </div>
    </AdminGuard>
  )
}

// components/admin-guard.tsx
export function AdminGuard({ children }) {
  const { data: user, isLoading } = useAuthMe()
  const router = useRouter()
  
  useEffect(() => {
    if (!isLoading && user && !user.is_admin) {
      toast.error("Access denied: Admin only")
      router.replace("/profile")
    }
  }, [user, isLoading])
  
  if (isLoading) return <Loading />
  if (!user?.is_admin) return null
  
  return <>{children}</>
}
```

---

## Security Best Practices

### ✅ DO:

1. **Always validate on backend**
   ```python
   @router.get("/sensitive-data")
   async def get_data(current_user: User = Depends(get_current_user)):
       if not current_user.is_admin:  # ← ALWAYS CHECK
           raise HTTPException(status_code=403)
       return sensitive_data
   ```

2. **Use dependency injection**
   ```python
   # Cleaner & reusable
   from app.auth.service import get_current_user
   
   @router.get("/endpoint")
   async def endpoint(user: User = Depends(get_current_user)):
       # user already validated
   ```

3. **Return proper HTTP status codes**
   - `401 Unauthorized` - Token invalid/missing
   - `403 Forbidden` - Valid token but insufficient permissions
   - `404 Not Found` - Don't reveal existence of protected resources

4. **Log authorization failures**
   ```python
   if not current_user.is_admin:
       logger.warning(f"Unauthorized admin access attempt by {current_user.email}")
       raise HTTPException(status_code=403)
   ```

### ❌ DON'T:

1. **❌ NEVER trust frontend checks only**
   ```python
   # BAD: No backend check
   @router.delete("/users/{id}")
   async def delete_user(id: str):
       await delete(id)  # ← Anyone can call this!
   ```

2. **❌ NEVER expose admin endpoints without auth**
   ```python
   # BAD
   @router.get("/admin/all-users")
   async def get_users():  # ← No authentication!
       return all_users
   ```

3. **❌ NEVER let users change their own role**
   ```python
   # VERY BAD - Security vulnerability!
   @router.post("/make-me-admin")
   async def promote_self(current_user: User):
       current_user.is_admin = True  # ← Privilege escalation!
   ```

4. **❌ NEVER return detailed errors to client**
   ```python
   # BAD
   except Exception as e:
       return {"error": str(e)}  # ← Exposes internals
   
   # GOOD
   except Exception as e:
       logger.error(f"Error: {e}")
       return {"error": "Internal server error"}
   ```

---

## Testing Authorization

### Unit Test Example

```python
# tests/test_admin_auth.py
import pytest
from fastapi.testclient import TestClient

def test_admin_endpoint_requires_admin(client: TestClient, regular_user_token):
    response = client.get(
        "/admin/users",
        headers={"Authorization": f"Bearer {regular_user_token}"}
    )
    assert response.status_code == 403
    assert "ADMIN_REQUIRED" in response.json()["detail"]["code"]

def test_admin_endpoint_allows_admin(client: TestClient, admin_user_token):
    response = client.get(
        "/admin/users",
        headers={"Authorization": f"Bearer {admin_user_token}"}
    )
    assert response.status_code == 200
    assert "users" in response.json()
```

---

## Summary

### Backend Authorization (MANDATORY ✅)
- ✅ Validate every protected endpoint
- ✅ Use `get_current_user` dependency
- ✅ Check `is_admin` or `is_verified` as needed
- ✅ Return 401/403 with proper error messages
- ✅ Log authorization failures

### Frontend Authorization (RECOMMENDED 👍)
- ✅ Hide UI elements for unauthorized users
- ✅ Use `<AdminGuard>` for admin pages
- ✅ Show friendly error messages
- ✅ Redirect unauthorized access attempts
- ✅ Handle 401/403 responses gracefully

### Remember:
> **"Client-side authorization is for USER EXPERIENCE, server-side authorization is for SECURITY!"**

---

## Need Help?

- Check backend logs for authorization errors
- Use browser DevTools to see 401/403 responses
- Test with Postman to verify backend protection
- Review `app/core/deps.py` for reusable dependencies

## Related Files

- Backend: `app/core/deps.py`, `app/auth/service.py`
- Frontend: `components/admin-guard.tsx`, `lib/orval/mutator.ts`
- Models: `app/models/user.py`
- Routes: `app/routes/admin.py`, `app/routes/dashboard.py`, `app/sppt/router.py`
