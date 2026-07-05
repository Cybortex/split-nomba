"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type Tab = "overview" | "users" | "students" | "staff" | "sessions" | "settings";

// ============================================================================
// ROLE LABELS (shared across tabs)
// ============================================================================
const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  INSTITUTION_ADMIN: "Institution Admin",
  FINANCE: "Finance",
  STUDENT_AFFAIRS: "Student Affairs",
  DEAN: "Dean",
  HOD: "HOD",
  STAFF: "Staff",
  STAFF_ADVISOR: "Staff Advisor",
  STUDENT_EXCO: "Student Exco",
  STUDENT: "Student",
};

const ASSIGNABLE_ROLES = [
  "FINANCE",
  "STUDENT_AFFAIRS",
  "DEAN",
  "HOD",
  "STAFF",
  "STAFF_ADVISOR",
  "STUDENT_EXCO",
  "STUDENT",
] as const;

// ============================================================================
// TAB BUTTONS
// ============================================================================
function TabBar({ activeTab, onTabChange }: { activeTab: Tab; onTabChange: (tab: Tab) => void }) {
  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "overview", label: "Overview", icon: "📊" },
    { key: "users", label: "Users", icon: "👥" },
    { key: "students", label: "Students", icon: "🎓" },
    { key: "staff", label: "Staff", icon: "👔" },
    { key: "sessions", label: "Sessions", icon: "📅" },
    { key: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
            activeTab === tab.key
              ? "bg-gold text-black border-gold"
              : "bg-transparent text-secondary border-border hover:bg-hover"
          }`}
        >
          <span className="mr-1.5">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// OVERVIEW TAB
// ============================================================================
function OverviewTab({ institutionId }: { institutionId: string }) {
  const wallets = useQuery(api.wallets.listAll, { institutionId: institutionId as any });
  const students = useQuery(api.studentRecords.listStudents, { institutionId: institutionId as any });

  if (!wallets) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="skeleton w-8 h-8 rounded-full" />
      </div>
    );
  }

  const totalCollected = wallets.reduce((sum: number, w: any) => sum + w.totalCollected, 0);
  const totalBalance = wallets.reduce((sum: number, w: any) => sum + w.availableBalance, 0);
  const totalTransactions = wallets.reduce((sum: number, w: any) => sum + w.transactionCount, 0);
  const totalStudents = students?.length ?? 0;

  const stats = [
    { label: "Total Collected", value: `₦${totalCollected.toLocaleString()}`, color: "text-gold" },
    { label: "Available Balance", value: `₦${totalBalance.toLocaleString()}`, color: "text-success" },
    { label: "Transactions", value: totalTransactions.toLocaleString(), color: "text-info" },
    { label: "Active Students", value: totalStudents.toLocaleString(), color: "text-pending" },
  ];

  const walletTypeGroups = [
    { type: "institution", label: "Institution", gradient: "from-gold/10 to-gold/5" },
    { type: "faculty", label: "Faculty", gradient: "from-success/10 to-success/5" },
    { type: "department", label: "Department", gradient: "from-info/10 to-info/5" },
    { type: "association", label: "Association", gradient: "from-pending/10 to-pending/5" },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="p-6 rounded-xl border border-border bg-surface">
            <p className="text-sm text-muted mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {walletTypeGroups.map(({ type, label, gradient }) => {
        const typeWallets = wallets.filter((w: any) => w.type === type);
        if (typeWallets.length === 0) return null;
        return (
          <div key={type} className={`rounded-xl border border-border bg-gradient-to-br ${gradient} p-6`}>
            <h3 className="font-semibold text-primary mb-4">{label} Wallets</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted">
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium text-right">Balance</th>
                    <th className="pb-2 font-medium text-right">Collected</th>
                    <th className="pb-2 font-medium text-right">Txns</th>
                  </tr>
                </thead>
                <tbody>
                  {typeWallets.map((wallet: any) => (
                    <tr key={wallet._id} className="border-t border-border-subtle">
                      <td className="py-2 font-medium text-primary">{wallet.name}</td>
                      <td className="py-2 text-right font-mono text-success">₦{wallet.availableBalance.toLocaleString()}</td>
                      <td className="py-2 text-right font-mono text-gold">₦{wallet.totalCollected.toLocaleString()}</td>
                      <td className="py-2 text-right text-secondary">{wallet.transactionCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {wallets.length === 0 && (
        <div className="p-12 rounded-xl border border-border bg-surface text-center">
          <p className="text-muted">No wallets created yet. Import an institution structure to get started.</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// USERS TAB
// ============================================================================
function UsersTab({ institutionId }: { institutionId: string }) {
  const currentUser = useQuery(api.auth.getCurrentUser);
  const users = useQuery(api.auth.listInstitutionUsers, { institutionId: institutionId as any });
  const addRole = useMutation(api.auth.addUserRole);
  const removeRole = useMutation(api.auth.removeUserRole);
  const deactivate = useMutation(api.auth.deactivateUser);

  const [processing, setProcessing] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Add user modal state
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ clerkId: "", email: "", role: "STUDENT" });
  const [addingUser, setAddingUser] = useState(false);
  const createUser = useMutation(api.auth.createInstitutionUser);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleAddRole = async (userId: string, role: string) => {
    setProcessing(`add-${userId}-${role}`);
    try {
      await addRole({ userId: userId as any, role });
      showMessage("success", `Added ${ROLE_LABELS[role] || role} role`);
    } catch (err: any) {
      showMessage("error", err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleRemoveRole = async (userId: string, role: string) => {
    setProcessing(`remove-${userId}-${role}`);
    try {
      await removeRole({ userId: userId as any, role });
      showMessage("success", `Removed ${ROLE_LABELS[role] || role} role`);
    } catch (err: any) {
      showMessage("error", err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleDeactivate = async (userId: string) => {
    if (!confirm("Deactivate this user? They will not be able to log in.")) return;
    setProcessing(`deactivate-${userId}`);
    try {
      await deactivate({ userId: userId as any });
      showMessage("success", "User deactivated");
    } catch (err: any) {
      showMessage("error", err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.clerkId || !newUser.email) return;
    setAddingUser(true);
    try {
      await createUser({
        clerkId: newUser.clerkId,
        email: newUser.email,
        roles: [newUser.role],
        permissions: [],
        institutionId: institutionId as any,
      });
      showMessage("success", `User ${newUser.email} created with role ${ROLE_LABELS[newUser.role]}`);
      setShowAddUser(false);
      setNewUser({ clerkId: "", email: "", role: "STUDENT" });
    } catch (err: any) {
      showMessage("error", err.message);
    } finally {
      setAddingUser(false);
    }
  };

  if (!currentUser || !users) {
    return <div className="flex items-center justify-center h-48"><div className="skeleton w-8 h-8 rounded-full" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-primary">User Management</h2>
          <p className="text-xs text-muted mt-0.5">{users.length} users in this institution</p>
        </div>
        <button
          onClick={() => setShowAddUser(!showAddUser)}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gold text-black hover:brightness-110 transition-all duration-200"
        >
          {showAddUser ? "Cancel" : "+ Add User"}
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm border ${
          message.type === "success"
            ? "bg-success/10 text-success border-success/20"
            : "bg-error/10 text-error border-error/20"
        }`}>{message.text}</div>
      )}

      {/* Add User Form */}
      {showAddUser && (
        <div className="p-5 rounded-xl border border-border bg-surface space-y-3">
          <h3 className="text-sm font-semibold text-primary">Create New User</h3>
          <p className="text-xs text-muted">
            First, create the user in{" "}
            <a href="https://dashboard.clerk.com" target="_blank" rel="noopener noreferrer" className="text-gold underline">Clerk Dashboard</a>{" "}
            (email + password), then paste their Clerk ID below.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium mb-1 text-secondary">Clerk ID</label>
              <input type="text" placeholder="user_2xxx" value={newUser.clerkId}
                onChange={(e) => setNewUser({ ...newUser, clerkId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface-secondary text-primary text-sm font-mono outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-secondary">Email</label>
              <input type="email" placeholder="user@institution.edu" value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-secondary">Role</label>
              <select value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none focus:border-gold">
                {ASSIGNABLE_ROLES.map((role) => (
                  <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                ))}
              </select>
            </div>
          </div>
          <button onClick={handleAddUser} disabled={addingUser || !newUser.clerkId || !newUser.email}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-gold text-black hover:brightness-110 transition-all duration-200 disabled:opacity-50">
            {addingUser ? "Creating..." : "Create User"}
          </button>
        </div>
      )}

      {users.length === 0 ? (
        <div className="p-8 rounded-xl border border-border bg-surface text-center">
          <p className="text-muted">No users found in this institution.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((user: any) => (
            <div key={user._id} className="p-4 rounded-xl border border-border bg-surface transition-all duration-200 hover:border-gold-royal">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-gold">{user.email.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-primary truncate">{user.email}</p>
                      <p className="text-xs text-muted font-mono truncate">ID: {user.clerkId.substring(0, 12)}...</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {user.roles.map((role: string) => (
                      <span key={role}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium ${
                          !user.isActive ? "bg-surface-secondary text-muted" :
                          role === "SUPER_ADMIN" || role === "INSTITUTION_ADMIN" ? "bg-gold/10 text-gold" :
                          "bg-surface-secondary text-secondary"
                        }`}>
                        {ROLE_LABELS[role] || role}
                        {role !== "SUPER_ADMIN" && role !== "INSTITUTION_ADMIN" && role !== "STUDENT" && user.roles.length > 1 && (
                          <button onClick={() => handleRemoveRole(user._id, role)}
                            disabled={processing === `remove-${user._id}-${role}`}
                            className="ml-1 hover:text-error transition-colors">×</button>
                        )}
                      </span>
                    ))}
                    {!user.isActive && <span className="px-2.5 py-1 rounded text-xs font-medium bg-error/10 text-error">Deactivated</span>}
                    {user.isActive && <span className="px-2 py-0.5 rounded text-xs bg-success/10 text-success">Active</span>}
                  </div>
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <button onClick={() => setExpandedUser(expandedUser === user._id ? null : user._id)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-secondary hover:bg-hover transition-all">
                    {expandedUser === user._id ? "Close" : "Manage"}
                  </button>
                  {user.isActive && (
                    <button onClick={() => handleDeactivate(user._id)}
                      disabled={processing === `deactivate-${user._id}`}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-error hover:bg-error/10 disabled:opacity-50">
                      {processing === `deactivate-${user._id}` ? "..." : "Deactivate"}
                    </button>
                  )}
                </div>
              </div>
              {expandedUser === user._id && (
                <div className="mt-4 pt-4 border-t border-border-subtle">
                  <p className="text-xs font-medium text-muted mb-2">Add Role</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ASSIGNABLE_ROLES.filter((role) => !user.roles.includes(role)).map((role) => (
                      <button key={role} onClick={() => handleAddRole(user._id, role)}
                        disabled={processing === `add-${user._id}-${role}`}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg border border-border text-secondary bg-surface-secondary hover:bg-hover disabled:opacity-50">
                        + {ROLE_LABELS[role] || role}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STUDENTS TAB (NEW)
// ============================================================================
function StudentsTab({ institutionId }: { institutionId: string }) {
  const students = useQuery(api.studentRecords.listStudents, { institutionId: institutionId as any });
  const addStudent = useMutation(api.studentRecords.addStudentRecord);
  const updateStatus = useMutation(api.studentRecords.updateStudentStatus);

  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState({ matric: "", faculty: "", department: "", level: "100", email: "", facultySlug: "", departmentSlug: "" });

  const showMsg = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleAdd = async () => {
    if (!form.matric || !form.faculty || !form.department || !form.email) return;
    setAdding(true);
    try {
      await addStudent({
        institutionId: institutionId as any,
        matric: form.matric,
        faculty: form.faculty,
        department: form.department,
        level: Number(form.level),
        email: form.email,
        facultySlug: form.facultySlug || undefined,
        departmentSlug: form.departmentSlug || undefined,
      });
      showMsg("success", `Student ${form.matric} added!`);
      setShowAdd(false);
      setForm({ matric: "", faculty: "", department: "", level: "100", email: "", facultySlug: "", departmentSlug: "" });
    } catch (err: any) {
      showMsg("error", err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleStatusChange = async (studentId: string, matric: string, newStatus: "graduated" | "withdrawn") => {
    try {
      await updateStatus({ studentId: studentId as any, status: newStatus });
      showMsg("success", `${matric} marked as ${newStatus}`);
    } catch (err: any) {
      showMsg("error", err.message);
    }
  };

  const filtered = search
    ? students?.filter((s: any) =>
        s.matric.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.faculty.toLowerCase().includes(search.toLowerCase()) ||
        s.department.toLowerCase().includes(search.toLowerCase())
      )
    : students;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-primary">Student Records</h2>
          <p className="text-xs text-muted mt-0.5">{students?.length ?? 0} students</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search students..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 pl-8 pr-3 py-1.5 rounded-lg border border-border bg-surface text-sm text-primary outline-none focus:border-gold" />
          </div>
          <button onClick={() => setShowAdd(!showAdd)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gold text-black hover:brightness-110 transition-all">
            {showAdd ? "Cancel" : "+ Add Student"}
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm border ${
          message.type === "success" ? "bg-success/10 text-success border-success/20" : "bg-error/10 text-error border-error/20"
        }`}>{message.text}</div>
      )}

      {showAdd && (
        <div className="p-5 rounded-xl border border-border bg-surface space-y-3">
          <h3 className="text-sm font-semibold text-primary">Add Student Record</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium mb-1 text-secondary">Matric Number *</label>
              <input type="text" placeholder="SCI/2023/001" value={form.matric}
                onChange={(e) => setForm({ ...form, matric: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface-secondary text-sm outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-secondary">Level</label>
              <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface-secondary text-sm outline-none focus:border-gold">
                {[100, 200, 300, 400, 500].map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-secondary">Faculty *</label>
              <input type="text" placeholder="Science" value={form.faculty}
                onChange={(e) => setForm({ ...form, faculty: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface-secondary text-sm outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-secondary">Department *</label>
              <input type="text" placeholder="Computer Science" value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface-secondary text-sm outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-secondary">Faculty Slug</label>
              <input type="text" placeholder="SCIENCE" value={form.facultySlug}
                onChange={(e) => setForm({ ...form, facultySlug: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface-secondary text-sm font-mono outline-none focus:border-gold" />
              <p className="text-xs text-muted mt-0.5">Must match the association slug exactly. Used for payment routing.</p>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-secondary">Department Slug</label>
              <input type="text" placeholder="COMP-SCI" value={form.departmentSlug}
                onChange={(e) => setForm({ ...form, departmentSlug: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface-secondary text-sm font-mono outline-none focus:border-gold" />
              <p className="text-xs text-muted mt-0.5">Must match the association slug exactly. Used for payment routing.</p>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1 text-secondary">Email *</label>
              <input type="email" placeholder="student@institution.edu.ng" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface-secondary text-sm outline-none focus:border-gold" />
            </div>
          </div>
          <button onClick={handleAdd} disabled={adding || !form.matric || !form.faculty || !form.department || !form.email}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-gold text-black hover:brightness-110 disabled:opacity-50">
            {adding ? "Adding..." : "Add Student"}
          </button>
        </div>
      )}

      {!students ? (
        <div className="flex items-center justify-center h-32"><div className="skeleton w-8 h-8 rounded-full" /></div>
      ) : filtered && filtered.length > 0 ? (
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-secondary text-left">
                  <th className="px-4 py-3 font-medium text-muted">Matric</th>
                  <th className="px-4 py-3 font-medium text-muted">Email</th>
                  <th className="px-4 py-3 font-medium text-muted">Faculty</th>
                  <th className="px-4 py-3 font-medium text-muted">Department</th>
                  <th className="px-4 py-3 font-medium text-muted text-right">Level</th>
                  <th className="px-4 py-3 font-medium text-muted">Status</th>
                  <th className="px-4 py-3 font-medium text-muted text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s: any) => (
                  <tr key={s._id} className="border-t border-border-subtle hover:bg-hover transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-primary font-medium">{s.matric}</td>
                    <td className="px-4 py-3 text-secondary">{s.email}</td>
                    <td className="px-4 py-3 text-secondary">{s.faculty}</td>
                    <td className="px-4 py-3 text-secondary">{s.department}</td>
                    <td className="px-4 py-3 text-right font-mono">{s.level}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        s.status === "active" ? "bg-success/10 text-success" :
                        s.status === "graduated" ? "bg-info/10 text-info" : "bg-error/10 text-error"
                      }`}>{s.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {s.status === "active" ? (
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => handleStatusChange(s._id, s.matric, "graduated")}
                            className="px-2 py-1 text-xs font-medium rounded border border-border text-info hover:bg-info/10 transition-colors">Graduate</button>
                          <button onClick={() => handleStatusChange(s._id, s.matric, "withdrawn")}
                            className="px-2 py-1 text-xs font-medium rounded border border-border text-error hover:bg-error/10 transition-colors">Withdraw</button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-12 rounded-xl border border-border bg-surface text-center">
          <p className="text-muted">{search ? "No students match your search." : "No student records yet."}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STAFF TAB (NEW)
// ============================================================================
function StaffTab({ institutionId }: { institutionId: string }) {
  const staffUsers = useQuery(api.auth.getUsersByRole, {
    institutionId: institutionId as any,
    roles: ["STAFF"],
  });

  const [search, setSearch] = useState("");

  const filtered = search
    ? staffUsers?.filter((u: any) => u.email.toLowerCase().includes(search.toLowerCase()))
    : staffUsers;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-primary">Staff Members</h2>
          <p className="text-xs text-muted mt-0.5">{staffUsers?.length ?? 0} staff members</p>
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search staff..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48 pl-8 pr-3 py-1.5 rounded-lg border border-border bg-surface text-sm text-primary outline-none focus:border-gold" />
        </div>
      </div>

      {!staffUsers ? (
        <div className="flex items-center justify-center h-32"><div className="skeleton w-8 h-8 rounded-full" /></div>
      ) : filtered && filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((user: any) => (
            <div key={user._id} className="p-4 rounded-xl border border-border bg-surface transition-all duration-200 hover:border-gold-royal">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-gold">{user.email.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-primary truncate">{user.email}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {user.roles.map((role: string) => (
                      <span key={role} className={`text-xs px-2 py-0.5 rounded font-medium ${
                        role === "STAFF" ? "bg-surface-secondary text-secondary" : "bg-gold/10 text-gold-royal"
                      }`}>{ROLE_LABELS[role] || role}</span>
                    ))}
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                      user.isActive ? "bg-success/10 text-success" : "bg-error/10 text-error"
                    }`}>{user.isActive ? "Active" : "Inactive"}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-xl border border-border bg-surface text-center">
          <p className="text-muted">{search ? "No staff match your search." : "No staff members yet. Assign the STAFF role to users in the Users tab."}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SESSIONS TAB
// ============================================================================
function SessionsTab({ institutionId }: { institutionId: string }) {
  const sessions = useQuery(api.sessions.listSessions, { institutionId: institutionId as any });
  const createSession = useMutation(api.sessions.createSession);
  const activateSession = useMutation(api.sessions.activateSession);

  const [newSession, setNewSession] = useState({ name: "", startDate: "", endDate: "", isActive: true });
  const [creating, setCreating] = useState(false);
  const [sessionMessage, setSessionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const activeSession = sessions?.find((s: any) => s.isActive);

  const showMessage = (type: "success" | "error", text: string) => {
    setSessionMessage({ type, text });
    setTimeout(() => setSessionMessage(null), 4000);
  };

  const handleCreate = async () => {
    if (!newSession.name || !newSession.startDate || !newSession.endDate) return;
    setCreating(true);
    try {
      await createSession({
        institutionId: institutionId as any,
        name: newSession.name,
        startDate: new Date(newSession.startDate).getTime(),
        endDate: new Date(newSession.endDate).getTime(),
        isActive: newSession.isActive,
      });
      setNewSession({ name: "", startDate: "", endDate: "", isActive: true });
      showMessage("success", `Session "${newSession.name}" created!`);
    } catch (err: any) {
      showMessage("error", err.message || "Failed to create session");
    } finally {
      setCreating(false);
    }
  };

  const handleActivate = async (sessionId: string, name: string) => {
    try {
      await activateSession({ institutionId: institutionId as any, sessionId: sessionId as any });
      showMessage("success", `Session "${name}" activated!`);
    } catch (err: any) {
      showMessage("error", err.message || "Failed to activate session");
    }
  };

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold text-primary">Academic Sessions</h2>
        <p className="text-xs text-muted mt-0.5">Create and manage academic sessions. Fees are configured per session by the Finance team.</p>
      </div>

      {sessionMessage && (
        <div className={`p-3 rounded-lg text-sm border ${
          sessionMessage.type === "success" ? "bg-success/10 text-success border-success/20" : "bg-error/10 text-error border-error/20"
        }`}>{sessionMessage.text}</div>
      )}

      {activeSession ? (
        <div className="p-4 rounded-xl border border-gold/30 bg-gradient-to-r from-gold/10 to-gold/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">📅</span>
            <div>
              <p className="text-sm font-semibold text-primary">{activeSession.name}</p>
              <p className="text-xs text-muted">{formatDate(activeSession.startDate)} — {formatDate(activeSession.endDate)}</p>
            </div>
          </div>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gold text-black">ACTIVE</span>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-border bg-surface text-center">
          <p className="text-sm text-muted">No active session. Create one below or activate an existing session.</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="p-5 rounded-xl border border-border bg-surface">
          <h3 className="font-semibold text-primary mb-3">Create Session</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1 text-secondary">Session Name</label>
              <input type="text" placeholder="e.g., 2025/2026" value={newSession.name}
                onChange={(e) => setNewSession({ ...newSession, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface-secondary text-sm outline-none focus:border-gold" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-secondary">Start Date</label>
                <input type="date" value={newSession.startDate}
                  onChange={(e) => setNewSession({ ...newSession, startDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface-secondary text-sm outline-none focus:border-gold" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-secondary">End Date</label>
                <input type="date" value={newSession.endDate}
                  onChange={(e) => setNewSession({ ...newSession, endDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface-secondary text-sm outline-none focus:border-gold" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={newSession.isActive}
                onChange={(e) => setNewSession({ ...newSession, isActive: e.target.checked })}
                className="rounded border-border" />
              <span className="text-sm text-secondary">Activate immediately</span>
            </label>
            <button onClick={handleCreate}
              disabled={creating || !newSession.name || !newSession.startDate || !newSession.endDate}
              className="w-full py-2.5 text-sm font-semibold rounded-lg bg-gold text-black disabled:opacity-50 hover:brightness-110">
              {creating ? "Creating..." : "Create Session"}
            </button>
          </div>
        </div>
        <div className="p-5 rounded-xl border border-border bg-surface">
          <h3 className="font-semibold text-primary mb-3">All Sessions</h3>
          {sessions && sessions.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sessions.map((session: any) => (
                <div key={session._id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    session.isActive ? "bg-gold/10 border border-gold/20" : "bg-surface-secondary"
                  }`}>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-primary">{session.name}</span>
                      {session.isActive && <span className="text-xs px-1.5 py-0.5 rounded bg-gold text-black font-semibold">Active</span>}
                    </div>
                    <p className="text-xs text-muted mt-0.5">{formatDate(session.startDate)} — {formatDate(session.endDate)}</p>
                  </div>
                  {!session.isActive && (
                    <button onClick={() => handleActivate(session._id, session.name)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-secondary hover:bg-hover">Activate</button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted py-8 text-center">No sessions created yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SETTINGS TAB (NEW)
// ============================================================================
function SettingsTab({ institutionId }: { institutionId: string }) {
  const myInst = useQuery(api.auth.getMyInstitution);
  const updateInst = useMutation(api.auth.updateInstitutionProfile);

  const [form, setForm] = useState({ name: "", phone: "", address: "", website: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Populate form when institution data loads
  useEffect(() => {
    if (myInst) {
      setForm({
        name: myInst.name || "",
        phone: (myInst as any).phone || "",
        address: (myInst as any).address || "",
        website: (myInst as any).website || "",
      });
    }
  }, [myInst]);

  const showMsg = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await updateInst({
        institutionId: institutionId as any,
        name: form.name.trim() || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
        website: form.website || undefined,
      });
      showMsg("success", "Institution settings updated!");
    } catch (err: any) {
      showMsg("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!myInst) {
    return <div className="flex items-center justify-center h-48"><div className="skeleton w-8 h-8 rounded-full" /></div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="font-semibold text-primary">Institution Settings</h2>
        <p className="text-xs text-muted mt-0.5">Update your institution's profile information.</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm border ${
          message.type === "success" ? "bg-success/10 text-success border-success/20" : "bg-error/10 text-error border-error/20"
        }`}>{message.text}</div>
      )}

      <div className="p-6 rounded-xl border border-border bg-surface space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1.5 text-secondary">Institution Name *</label>
          <input type="text" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none focus:border-gold" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5 text-secondary">Phone</label>
            <input type="text" placeholder="+234 800 000 0000" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface-secondary text-sm outline-none focus:border-gold" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5 text-secondary">Website</label>
            <input type="text" placeholder="https://institution.edu.ng" value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface-secondary text-sm outline-none focus:border-gold" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5 text-secondary">Address</label>
          <input type="text" placeholder="Lagos, Nigeria" value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface-secondary text-sm outline-none focus:border-gold" />
        </div>
        <button onClick={handleSave} disabled={saving || !form.name.trim()}
          className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gold text-black hover:brightness-110 disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Institution Info Card */}
      <div className="p-4 rounded-xl border border-border bg-surface-secondary">
        <h3 className="text-sm font-semibold text-primary mb-2">Institution Details</h3>
        <div className="space-y-1.5 text-xs text-muted">
          <p><span className="font-medium text-secondary">ID:</span> <span className="font-mono">{myInst._id}</span></p>
          <p><span className="font-medium text-secondary">Created:</span> {new Date(myInst.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
          <p><span className="font-medium text-secondary">Status:</span> {myInst.isActive ? <span className="text-success">Active</span> : <span className="text-error">Inactive</span>}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN DASHBOARD
// ============================================================================
export function InstitutionAdminDashboard({ 
  institutionId,
  activeTab = "overview" 
}: { 
  institutionId?: string; 
  activeTab?: string;
}) {
  const myInst = useQuery(api.auth.getMyInstitution);
  const effectiveInstId = institutionId || (myInst?._id as string | undefined);

  if (!effectiveInstId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="skeleton w-12 h-12 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-primary">Institution Admin Dashboard</h2>
          <span className="text-xs px-2 py-0.5 rounded bg-gold/10 text-gold-royal font-mono">INSTITUTION_ADMIN</span>
        </div>
        <p className="text-xs text-muted mt-0.5">
          Manage users, students, staff, academic sessions, and institution settings.
        </p>
      </div>

      {activeTab === "overview" && <OverviewTab institutionId={effectiveInstId} />}
      {activeTab === "users" && <UsersTab institutionId={effectiveInstId} />}
      {activeTab === "students" && <StudentsTab institutionId={effectiveInstId} />}
      {activeTab === "staff" && <StaffTab institutionId={effectiveInstId} />}
      {activeTab === "sessions" && <SessionsTab institutionId={effectiveInstId} />}
      {activeTab === "settings" && <SettingsTab institutionId={effectiveInstId} />}
    </div>
  );
}
