"use client";

import { useMemo, useState } from "react";
import { Mail, Search } from "lucide-react";
import { defaultAvatarFor } from "../../lib/photoUtils";
import { useCommitteeMembers } from "../../lib/committee";
import { PhoneAction } from "../common/PhoneAction";

function avatarFor(profile) {
  return profile.photo?.useDefault === false && profile.photo?.base64
    ? profile.photo.base64
    : defaultAvatarFor(profile.gender);
}

export default function CommitteeTab() {
  const { members, ready } = useCommitteeMembers();
  const [search, setSearch] = useState("");
  const [designation, setDesignation] = useState("all");

  const designations = useMemo(() => {
    const seen = new Map();
    members.forEach((m) => {
      if (!seen.has(m.committeeRole.id)) seen.set(m.committeeRole.id, m.committeeRole.title);
    });
    return Array.from(seen.entries()).map(([id, title]) => ({ id, title }));
  }, [members]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter((m) => {
      if (designation !== "all" && m.committeeRole.id !== designation) return false;
      if (!q) return true;
      return (
        m.name?.toLowerCase().includes(q) ||
        m.committeeRole.title?.toLowerCase().includes(q) ||
        m.department?.toLowerCase().includes(q)
      );
    });
  }, [members, search, designation]);

  return (
    <div>
      <h1>Committee</h1>
      <p className="step-sub">The current management committee.</p>

      {members.length > 0 && (
        <div className="committee-filter-row">
          <div className="committee-search-box">
            <Search size={15} />
            <input
              type="text"
              placeholder="নাম, পদবী বা বিভাগ খুঁজুন…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select value={designation} onChange={(e) => setDesignation(e.target.value)}>
            <option value="all">সব পদবী</option>
            {designations.map((d) => (
              <option key={d.id} value={d.id}>{d.title}</option>
            ))}
          </select>
        </div>
      )}

      {!ready && <p className="helper-text">Loading…</p>}
      {ready && members.length === 0 && <p className="helper-text">No committee roles have been assigned yet.</p>}
      {ready && members.length > 0 && filtered.length === 0 && <p className="helper-text">কোনো ফলাফল পাওয়া যায়নি।</p>}

      <div className="directory-grid" style={{ marginTop: 18 }}>
        {filtered.map((m) => (
          <div key={m.id} className="directory-card">
            <div className="directory-card-top">
              <img
                src={avatarFor(m)}
                alt=""
                width={44}
                height={44}
                style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
              />
              <div>
                <div className="directory-card-name">{m.name}</div>
                <span className="committee-role-badge">{m.committeeRole.title}</span>
              </div>
            </div>
            <div className="directory-card-body">
              {m.department && (
                <div className="directory-card-meta">{m.department}{m.session ? ` · ${m.session}` : ""}</div>
              )}
              {m.email && (
                <div className="directory-card-meta"><Mail size={14} />{m.email}</div>
              )}
              {m.phone && (
                <div className="directory-card-meta">
                  <PhoneAction phone={m.phone} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
